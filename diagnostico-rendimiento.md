# Diagnóstico de rendimiento — listado de tareas

Rama: `feature/pruebas-rendimiento`
Fecha: 2026-11-03

## Cómo se reprodujo

```bash
npm install
cp server/.env.example server/.env
npm run db:setup
npm --prefix server run db:seed:large   # 1 proyecto con 5.000 tareas y 20.000 comentarios
npm run dev:server

k6 run -e VUS=1  -e DURATION=20s performance/scenarios/api-load.k6.js
k6 run -e VUS=20 -e DURATION=20s performance/scenarios/api-load.k6.js
```

Endpoint medido: `GET /api/projects/proj-4/tasks` ("[Carga] Proyecto grande", 5.000 tareas).

## Resultados

| Escenario | p95 | Umbral `p(95)<1000` |
|---|---|---|
| 1 pedido con curl | ~550 ms, **1,86 MB** de respuesta | — |
| k6, 1 usuario virtual | 560 ms | ✓ pasa |
| k6, 20 usuarios virtuales | **4,11 s** | ✗ falla |

- Un proyecto chico responde en ~2 ms: la lentitud aparece solo con volumen.
- Con 20 usuarios virtuales el throughput se estanca en **~4 pedidos/s**. Los pedidos se encolan uno detrás de otro y la latencia se multiplica por ~8.
- `http_req_failed`: 0 %. No hay errores, solo lentitud.

## Causa raíz

Archivo: `server/src/modules/tasks/tasks.controller.ts`, función `listByProject`.

### 1. Consultas N+1 (líneas 33–37)

```ts
for (const row of rows) {
  const assignee = row.assigneeId ? await db.user.findUnique(...) : null;   // 1 query por tarea
  const commentCount = await db.comment.count({ where: { taskId: row.id } }); // otra más
```

Con 5.000 tareas se ejecutan unas **10.000 consultas a SQLite por pedido**, todas en serie por el `await` dentro del loop. Los índices (`@@index([taskId])` en comments) existen, así que el costo no es de índices sino de la cantidad de consultas.

### 2. La paginación se calcula pero no se aplica (líneas 27–30 y 46)

`limit` y `offset` se leen del query string (por defecto 20, máximo 100), pero nunca se pasan a `repo.findTasks`. El endpoint devuelve las 5.000 tareas completas, y además responde `limit: 20` en el JSON, un dato falso para quien consume la API.

Los dos defectos se potencian: con paginación, el N+1 sería de 20 tareas y no de 5.000.

## Remediación propuesta

- **Paginar en la base:** pasar `take: limit, skip: offset` al `findMany` y calcular `total` con `countTasks` en lugar de `rows.length`.
- **Eliminar el N+1:** traer todo en una sola consulta con
  `include: { assignee: { select: { id: true, email: true } }, _count: { select: { comments: true } } }`.
  Si la relación de comments no está declarada en el schema, usar un único `groupBy` por `taskId`.

## Hallazgos adicionales en el mismo código

- **SQL injection en la búsqueda** (`server/src/modules/tasks/tasks.repository.ts`): usa `$queryRawUnsafe` con `'${term}'` interpolado. Con `search=' OR '1'='1' --` la API responde **500**.
- **`buildFilters` pisa los filtros:** si se mandan `status` y `priority` juntos, solo se aplica el último.
- **`countTasks` con búsqueda** vuelve a ejecutar la consulta completa solo para contar.
