## Paso 3 · Reporte de performance

### Resultados obtenidos

| Anotá | Seed chica | Seed grande |
| --- | --- | --- |
| p95 (`http_req_duration`) | 22,86 ms | 20,5 s (primera ejecución) / 19,44 s (segunda ejecución) |
| Error rate (`http_req_failed`) | 0,00 % | 0,00 % |
| Iteraciones por segundo | 0,974142/s | 0,947376/s (primera ejecución) / 1,013614/s (segunda ejecución) |

### Hipótesis

El aumento de la cantidad de datos en la base de datos provoca un incremento considerable en el tiempo de respuesta de la API. Con la seed chica, el p95 es de 22,86 ms, mientras que con la seed grande aumenta hasta aproximadamente 19-20 segundos.

Esto puede deberse a consultas que procesan grandes cantidades de proyectos, tareas y comentarios, generando mayor carga en la base de datos. Aunque no se producen errores HTTP, el rendimiento se degrada significativamente.

### Issue para el repositorio

Escritura✓

# \[Performance\] Degradación del tiempo de respuesta de la API con datos grandes

**Criterio violado:**

- Criterio de rendimiento: el tiempo de respuesta p95 debe ser inferior a 500 ms.
- Criterio de rendimiento: la tasa de errores HTTP debe ser inferior al 1 %.

**Entorno:**

- Proyecto: Taskflow 2026 S2 - GrupoJSD.
- Sistema operativo: Windows.
- Herramienta: k6.
- Seed chica: 1 VU durante 30 segundos.
- Seed grande: 20 VUs durante 1 minuto.
- Base de datos: `server/prisma/dev.db`.

**Pasos para reproducir:**

1. Ejecutar `npm run db:reset`.
2. Levantar la API con `npm run dev`.
3. Ejecutar `k6 run -e VUS=1 -e DURATION=30s performance/scenarios/api-load.k6.js`.
4. Cargar los datos grandes con `npm --prefix server run db:seed:large`.
5. Ejecutar `k6 run -e VUS=20 -e DURATION=1m performance/scenarios/api-load.k6.js`.

**Esperado vs. obtenido:**

- Esperado: p95 inferior a 500 ms y tasa de errores inferior al 1 %.
- Obtenido con seed chica: p95 de 22,86 ms y tasa de errores de 0,00 %.
- Obtenido con seed grande: p95 de 20,5 segundos en la primera ejecución y 19,44 segundos en la segunda. La tasa de errores se mantiene en 0,00 %.

**Evidencia:**

- Seed grande cargada correctamente: 200 proyectos de carga, 5000 tareas y 20000 comentarios.
- Primera ejecución con seed grande:
  - p95: 20,5 s.
  - Error rate: 0,00 %.
  - Iteraciones: 0,947376/s.
  - Threshold `p(95)<500` incumplido.
- Segunda ejecución con seed grande:
  - p95: 19,44 s.
  - Error rate: 0,00 %.
  - Iteraciones: 1,013614/s.
  - Threshold `p(95)<1000` incumplido.

**Hipótesis:**

El incremento de los datos provoca una degradación importante del rendimiento de las consultas de la API. El procesamiento de grandes cantidades de proyectos, tareas y comentarios podría estar generando consultas costosas o falta de optimización en el acceso a la base de datos. La ausencia de errores HTTP indica que las solicitudes siguen funcionando, pero tardan considerablemente más en responder.