# Code smells y refactors — TaskFlow (Equipo 10)

Este documento lista los smells detectados en `server/`, dónde estaban en `main`
(commit `3bdebea`), qué refactor se aplicó, con qué técnica, cómo se verificó que
el comportamiento no cambió y en qué commit quedó.

## Resumen

| ID | Smell | Dónde estaba (en `main`) | Severidad | Estado | Commit |
|----|-------|--------------------------|-----------|--------|--------|
| S1 | Clave JWT con valor por defecto público en el código | `server/src/middleware/auth.ts:10` | Alta | **Refactorizado** | `dd834e8` |
| S2 | SQL armado por concatenación (SQL injection) | `server/src/modules/tasks/tasks.repository.ts:33` | Crítica | **Refactorizado** | `b151bf5` |
| S3 | Método largo con if/else anidados y código repetido | `server/src/modules/tasks/tasks.service.ts:88-179` (`updateTask`) | Media | **Refactorizado** | `28c6e13` |
| S4 | Error crudo en el manejador de errores | `server/src/middleware/errors.ts:26` | Baja | Verificado, sin cambios | `641eb10` (test) |
| S5 | Contraseña de prueba literal en el seed | `server/prisma/seed.ts:18` | Baja | Documentado | — |
| S6 | `PATCH`/`DELETE` de tareas sin verificar membresía | `tasks.routes.ts:14-15`, `tasks.controller.ts:84` | Alta | Documentado (lo remedia Seguridad) | — |
| S7 | Asignación masiva en `createTask` | `server/src/modules/tasks/tasks.service.ts:66` | Alta | Documentado | — |
| S8 | Filtros que se pisan entre sí | `server/src/modules/tasks/tasks.repository.ts:12-25` (`buildFilters`) | Media | Documentado (bug) | — |
| S9 | Consultas N+1 y paginación sin aplicar | `server/src/modules/tasks/tasks.controller.ts:33` (`listByProject`) | Media | Documentado (lo cubre Performance) | — |
| S10 | `any`, `catch` que se traga el error | `server/src/modules/comments/comments.service.ts:7-16` | Baja | Documentado (lo cubre Pipeline/lint) | — |

Los commits son los de la rama `refactor/smells-y-cobertura`. Si se vuelven a
aplicar con otro autor (`git am`, `rebase`), los hashes cambian: la identificación
estable es el asunto del commit (ver [Commits](#commits)).

---

## Refactors aplicados

Método usado en los tres: (1) escribir tests de **caracterización** que fijan el
comportamiento actual y comprobar que pasan sobre `main`; (2) refactorizar;
(3) volver a correr los mismos tests. Si el refactor cambia a propósito un
comportamiento inseguro (S1 en producción, S2), el test que lo cubre se escribe
antes y **falla antes del cambio** y pasa después.

### S1 — Clave JWT con valor por defecto público

- **Antes:** `export const JWT_SECRET = process.env.JWT_SECRET ?? 'taskflow-dev-secret';`.
  Si en producción se olvidaba definir la variable, el servidor firmaba los tokens
  con una clave que cualquiera puede leer en el repositorio, y arrancaba igual sin
  avisar. Además se evaluaba al importar el módulo, lo que hacía que dependiera del
  orden de carga.
- **Refactor:** nuevo `server/src/config.ts` con `getJwtSecret()`, que lee la
  variable en el momento de usarla. Fuera de producción conserva la clave de
  desarrollo; en producción sin `JWT_SECRET` **lanza un error**, y `index.ts` lo
  invoca al arrancar para que el servidor ni siquiera levante mal configurado.
  `auth.ts` deja de exportar `JWT_SECRET` (nadie más lo importaba). Se documenta la
  variable en `server/.env.example`.
- **Técnica:** Extract Module / mover configuración al entorno (*Replace Magic
  Literal*, fail fast).
- **Cambio de comportamiento:** solo en producción sin `JWT_SECRET` (ahora falla,
  intencional). En desarrollo y tests todo se comporta igual.
- **Verificación:** `tests/integration/jwt-token.test.ts` (7 tests: firma y
  duración de 24 h, token válido, token con otra clave, con la clave de desarrollo,
  vencido, sin cabecera y no-Bearer), escrito antes y verde antes/después.
  `tests/integration/config.test.ts` (5 tests) cubre la nueva función.

### S2 — SQL injection en la búsqueda de tareas

- **Antes:** `findTasks` armaba el SQL con el texto del usuario pegado dentro del
  string y lo ejecutaba con `$queryRawUnsafe`:
  `instr(title, '${term}')`. Con `?search=x') > 0) OR (1=1) --` la API devolvía las
  tareas de **todos los proyectos**, incluidos los de los que el usuario no es
  miembro. Con una comilla simple (`O'Brien`) respondía 500.
- **Refactor:** se pasa a `$queryRaw` con plantilla etiquetada, de modo que
  `projectId` y el término viajan como parámetros y no como parte del SQL.
- **Técnica:** *Replace Dynamic Query with Parameterized Query*.
- **Verificación:** `tests/integration/tasks-search.test.ts` (11 tests de
  caracterización de la búsqueda legítima y del listado, verdes antes y después) y
  `tests/integration/tasks-search-injection.test.ts` (3 tests de regresión).
  Estos tres **fallaban antes del cambio** (fuga entre proyectos y 500) y pasan
  después.
- **Nota de diagnóstico:** el comentario que había en `tasks.service.ts` hablaba de
  "SQL injection" en `createTask`, pero ahí Prisma sí parametriza. La inyección real
  estaba en este archivo. Lo de `createTask` es otro problema (S7).

### S3 — `updateTask`: método largo, anidado y con código repetido

- **Antes:** 92 líneas, hasta 5 niveles de `if/else` anidados (asignado y estado) y
  `assertTransition` + `nextStatus = requested` repetidos en dos ramas.
- **Refactor:** se extraen `resolveAssignee`, `resolveDueDate`, `canChangeStatus`,
  `resolveStatusChange` y `collectChanges`. `updateTask` queda en 24 líneas, con una
  sola responsabilidad: cargar la tarea, aplicar los cambios y escribir el
  historial. Se usan cláusulas de guarda en lugar de `else` anidados.
- **Técnica:** Extract Method, Replace Nested Conditional with Guard Clauses,
  Remove Duplicated Code.
- **Cambio de comportamiento:** ninguno. Se conservan el orden de las
  validaciones y los mensajes de error.
- **Verificación:** `tests/integration/tasks-update.test.ts` (29 tests:
  validaciones de campos, asignado, estados, historial, orden de los errores).
  Se corrieron contra el `updateTask` **original** y contra el refactorizado: 29 de
  29 en ambos.

---

## Smells detectados y no modificados

Cada uno de estos se dejó sin tocar por un motivo concreto.

### S4 — Error crudo en el manejador de errores (`errors.ts`)

El comentario original sugería que el cliente veía el error crudo. No es así: ante
un error inesperado la respuesta es siempre
`{ code: 'INTERNAL', message: 'Unexpected server error', details: [] }` y el
detalle va solo a `console.error`. Está cubierto con
`tests/integration/error-handler.test.ts`, que comprueba que el cuerpo no contiene
trazas ni nombres de error. El riesgo que queda es de **logging** (se imprime el
objeto completo, que puede incluir datos de la petición); la mejora sería un logger
estructurado que no vuelque el error entero. Sin cambios.

### S5 — Contraseña de prueba literal en el seed (`seed.ts`)

No hay un *hash* hardcodeado: el hash se calcula con bcrypt en cada ejecución a
partir de `'Password1'`. Es una contraseña de datos de ejemplo, documentada en el
README, que solo se usa en `db:setup`/`db:reset`. Riesgo bajo mientras el seed no se
corra contra un entorno real. Mejora posible: leerla de una variable
(`SEED_PASSWORD`) y negarse a correr si `NODE_ENV=production`.

### S6 — `PATCH`/`DELETE` de tareas sin verificar membresía

En `tasks.routes.ts` las rutas `PATCH /:taskId` y `DELETE /:taskId` no usan
`requireTaskProjectMember`, a diferencia de `GET`, tags e historial. Cualquier
usuario autenticado puede modificar o borrar tareas de proyectos ajenos. Es el
hallazgo **SEC-03** del trabajo de Seguridad, que es quien lo remedia; arreglarlo
acá cambiaría comportamiento y pisaría ese entregable. Corrección propuesta:
agregar `requireTaskProjectMember('taskId')` a ambas rutas y un test que verifique
403 para un no miembro.

### S7 — Asignación masiva en `createTask`

`createTask` hace `data: { ...(body as object), ... } as never`: copia **todo el
body** a la base y silencia el compilador con `as never`. Probado: un
`POST /api/projects/:id/tasks` con `{ "title": "...", "status": "DONE", "createdAt": "2000-01-01T00:00:00.000Z" }`
crea la tarea ya terminada y con fecha de creación falsa, salteándose las reglas de
transición. Corrección propuesta: no esparcir el body y usar solo los campos ya
validados (`title`, `description`, `priority`, `assigneeId`, `dueDate`). No se
aplicó porque cambia comportamiento observable.

### S8 — `buildFilters` pisa los filtros

Cada `if` reasigna `where` desde cero, así que combinando `status`, `priority` y
`assignedTo` solo se aplica el último. Es un defecto funcional, no solo estético.
Corrección: acumular los filtros en un único objeto. No se aplicó (cambia el
resultado de las consultas).

### S9 — N+1 y paginación sin aplicar en `listByProject`

Dentro del bucle se hace una consulta por tarea para el asignado y otra para
contar comentarios, y `limit`/`offset` se calculan pero no llegan a la consulta.
Es la causa probable de los tiempos del reporte de k6; lo desarrolla el trabajo de
Performance.

### S10 — `any` y `catch` que se traga el error en `comments.service.ts`

`serialize(c: any)` con un `try/catch` cuyo `catch (e)` no se usa y devuelve
`null`. Es parte del lint en rojo del Pipeline; se corrige allí (tipar `c` y
`body`, quitar el `catch`).

---

## Cobertura

Se configuró el umbral en `server/jest.config.js`:

```js
coverageThreshold: { global: { lines: 70, branches: 40 } },
```

`jest --coverage` termina con error si la cobertura baja de esos mínimos (se
comprobó subiendo el mínimo a 99 %: falla). Es el mismo umbral que usa el job de
cobertura de `agregar-ci`.

| | Antes (`main`) | Después |
|---|---|---|
| Tests | 18 | 122 |
| Líneas | 66,4 % | 92,89 % |
| Ramas | 40,57 % | 75,73 % |
| `tasks.service.ts` (líneas) | 52 % | 97,8 % |
| `tasks.controller.ts` (líneas) | 51,38 % | 94,44 % |
| `projects.controller.ts` (líneas) | 27,08 % | 96,87 % |
| `membership.ts` (líneas) | 57,44 % | 82,97 % |

Los tests nuevos están en `server/tests/integration/` (los existentes no se
modificaron) y pasan con `TZ=UTC` y con `TZ=America/Montevideo`: no afirman el
valor exacto de `dueDate` porque ese campo depende de la zona horaria (defecto de
US-16, que cubre otro trabajo).

## Commits

| Asunto | Qué contiene |
|--------|--------------|
| `641eb10` test: tests de caracterización previos al refactor | JWT, errores, búsqueda, `updateTask` |
| `225825d` test: integración de detalle/etiquetas/historial/borrado... | tareas, membresía, miembros de proyecto |
| `dd834e8` refactor(auth): mover la clave JWT a config.getJwtSecret() | S1 |
| `b151bf5` refactor(tasks): búsqueda con consulta SQL parametrizada | S2 |
| `28c6e13` refactor(tasks): extraer métodos de updateTask | S3 |
| `0574998` chore(jest): coverageThreshold global | umbral de cobertura |

## Cómo reproducirlo

```bash
cd server
npm ci
npx prisma generate
npm run test:coverage      # corre los 122 tests y verifica el umbral
```
