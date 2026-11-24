# Matriz de trazabilidad de requisitos — TaskFlow

> **Alcance y criterio.** Esta matriz vincula capacidades funcionales descritas en el `README.md`, la especificación de requisitos y la historia `US-SEC-03` con la evidencia automatizada identificable en el repositorio. Los identificadores `RF-*`, `RNF-*` y `SEC-*` son identificadores propios de esta matriz.
>
> **Lectura:** «Con evidencia» indica que existe una prueba asociada; no confirma por sí mismo que la prueba haya sido ejecutada recientemente ni que el estado sea aprobado.

## Matriz de trazabilidad

| ID | Requisito verificable | Tipo | Fuente | Evidencia de prueba | Cobertura |
|---|---|---|---|---|---|
| RF-01 | El usuario puede registrarse e iniciar sesión con credenciales válidas; las credenciales inválidas deben rechazarse. | Funcional | `README.md`; `/auth/register`; `/auth/login` | `server/tests/auth.test.ts`; `server/tests/e2e/taskflow.spec.ts` | Evidencia localizada |
| RF-02 | Las rutas protegidas requieren autenticación válida y rechazan token ausente, vencido o inválido. | Seguridad / funcional | `README.md`; `docs/clase12-m2-reporte.md` | `server/tests/projects.test.ts`; `server/tests/integration/jwt-token.test.ts` | Evidencia localizada |
| RF-03 | El usuario autenticado puede crear proyectos y consultar los proyectos que tiene disponibles. | Funcional | `README.md`; `/projects` | `server/tests/projects.test.ts`; `server/tests/e2e/taskflow.spec.ts` | Evidencia localizada |
| RF-04 | El owner puede agregar y quitar miembros, respetando duplicados, usuarios inexistentes y permisos por rol. | Funcional / autorización | `README.md`; endpoints de miembros | `server/tests/integration/projects-members.test.ts` | Evidencia localizada |
| RF-05 | Se puede crear una tarea en un proyecto con datos válidos y rechazar un título vacío. | Funcional / validación | `README.md`; `POST /projects/:id/tasks` | `server/tests/tasks.test.ts`; `server/tests/e2e/taskflow.spec.ts` | Evidencia localizada |
| RF-06 | Se pueden listar tareas y aplicar filtros por estado, prioridad, asignado y texto con paginación. | Funcional | `README.md`; `GET /projects/:id/tasks` | `server/tests/tasks.test.ts`; `server/tests/integration/tasks-search.test.ts`; `server/tests/integration/tasks-search-injection.test.ts` | Parcial: falta verificar explícitamente toda la paginación y combinación de filtros |
| RF-07 | Se puede consultar y editar una tarea, incluyendo título, descripción, prioridad, asignado, vencimiento y estado. | Funcional | `README.md`; `PATCH /tasks/:id` | `server/tests/tasks.test.ts`; `server/tests/integration/tasks-detail.test.ts`; `server/tests/integration/tasks-update.test.ts`; `server/tests/e2e/taskflow.spec.ts` | Parcial: comprobar cada campo y todas las transiciones |
| RF-08 | Se pueden agregar y quitar etiquetas de una tarea. | Funcional | `README.md`; `/tasks/:id/tags` | `server/tests/e2e/taskflow.spec.ts`; `server/tests/e2e/a11y.spec.ts` | Parcial: alta localizada; falta confirmación específica de eliminación |
| RF-09 | Se puede consultar el historial de cambios de estado de una tarea. | Funcional | `README.md`; `GET /tasks/:id/history` | Endpoint documentado; no se encontró una prueba específica | Sin evidencia localizada |
| RF-10 | Se pueden agregar y consultar comentarios; un usuario puede eliminar sus propios comentarios. | Funcional / autorización | `README.md`; endpoints de comentarios | `server/tests/comments.test.ts`; `server/tests/e2e/taskflow.spec.ts` | Parcial: falta confirmar eliminación y rechazo ajeno |
| RF-11 / US-SEC-03 | Solo los miembros del proyecto pueden modificar o eliminar sus tareas; los no miembros reciben `403` y no producen cambios. | Seguridad / autorización | `docs/seguridad/HISTORIA_USUARIO_SEC03.md` | `server/tests/integration/tasks-membership.test.ts`; `docs/seguridad/README.md` | Evidencia localizada |
| RF-12 | La búsqueda por texto debe tratar caracteres especiales como datos literales y evitar inyección o fuga entre proyectos. | Seguridad | `server/tests/integration/tasks-search-injection.test.ts` | Pruebas de payload hostil, comillas simples e intento de eliminación | Evidencia localizada |
| RF-13 | Los campos de etiquetas y comentarios del detalle tienen nombres accesibles para tecnologías de asistencia. | Accesibilidad | `docs/clase12-m2-reporte.md`; ACC-01 y ACC-02 | `server/tests/e2e/a11y.spec.ts`; `docs/seguridad/README.md` | Evidencia localizada |
| RNF-01 | La aplicación debe validar la clave JWT y rechazar configuración insegura y tokens forjados o vencidos. | No funcional / seguridad | `server/tests/integration/config.test.ts`; `server/tests/integration/jwt-token.test.ts` | Pruebas de configuración y verificación JWT | Evidencia localizada |
| RNF-02 | Los errores controlados deben seguir el formato JSON y los códigos documentados. | No funcional | `README.md` — formato de errores | `server/tests/integration/error-handler.test.ts` | Parcial: contrastar todos los códigos documentados |
| RNF-03 | Las pantallas principales deben mantenerse verificables según WCAG 2.1 A/AA mediante axe-core. | No funcional / accesibilidad | `docs/clase12-m2-reporte.md`; `server/tests/e2e/a11y.spec.ts` | Auditorías de Login, Registro, Proyectos, Tablero y Detalle de tarea | Evidencia localizada |

## Acciones pendientes

1. Sustituir los identificadores provisionales por los IDs exactos de las 17 historias de usuario del documento `taskflow_especificacion_requerimientos.docx`.
2. Completar la trazabilidad de edición/eliminación de proyectos, eliminación de tareas, historial, eliminación de comentarios y quitar etiquetas.
3. Contrastar la matriz con la estructura requerida en las diapositivas de clase y ajustar columnas o nomenclatura si corresponde.
4. Ejecutar `npm test` y `npm run test:e2e`, y registrar fecha, commit y resultado de las pruebas.

## Autoría

**StephSP**

## Referencias

- [`taskflow_especificacion_requerimientos.docx`](../taskflow_especificacion_requerimientos.docx)
- [`README.md`](../README.md)
- [`docs/seguridad/HISTORIA_USUARIO_SEC03.md`](seguridad/HISTORIA_USUARIO_SEC03.md)
- [`docs/seguridad/README.md`](seguridad/README.md)
- [`docs/clase12-m2-reporte.md`](clase12-m2-reporte.md)
