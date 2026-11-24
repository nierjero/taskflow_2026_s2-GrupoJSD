# Matriz de trazabilidad de requisitos — TaskFlow

> **Objetivo:** permitir recorrer la cadena Requerimiento → User Story → Criterio de aceptación → Prueba → Resultado. Los resultados se diferencian explícitamente de la existencia o inspección de una prueba.

## Autoría

StephSP

## 1. Título y objetivo

Esta matriz relaciona las 17 historias de usuario originales de TaskFlow, sus criterios de aceptación y los requisitos no funcionales con las pruebas existentes en el repositorio. Conserva los identificadores originales y no los sustituye por identificadores inventados.

## 2. Alcance y fuentes

Fuentes principales:

- `taskflow_especificacion_requerimientos.docx`: especificación original y fuente de verdad.
- `README.md`: contratos HTTP y comportamiento general.
- `server/tests/`: pruebas unitarias, de integración y E2E.
- `docs/seguridad/HISTORIA_USUARIO_SEC03.md`: remediación complementaria US-SEC-03.
- `docs/seguridad/README.md`: evidencia de seguridad y ZAP.
- `docs/clase12-m2-reporte.md`: evidencia de seguridad y pruebas de accesibilidad.
- `package.json`, `server/package.json`, `playwright.config.ts` y workflows de GitHub Actions.

Esta versión se redactó a partir del texto entregado de la especificación. No se encontró una extracción automática disponible del DOCX durante la revisión inicial; los IDs y criterios se toman del texto proporcionado.

## 3. Criterios de lectura

- **Cubierto:** existe al menos una prueba específica que verifica el criterio.
- **Parcialmente cubierto:** existe evidencia, pero no verifica todos los aspectos del criterio.
- **Sin evidencia:** no se encontró una prueba que verifique el criterio.
- **Pendiente de verificar:** no puede determinarse con certeza si existe cobertura.
- **PASS:** la prueba fue ejecutada y aprobó.
- **FAIL:** la prueba fue ejecutada y falló.
- **NOT RUN:** no se ejecutó.
- **BLOCKED:** no pudo ejecutarse por un impedimento conocido.

> **Resultado real:** no hay ejecución local disponible en esta modificación. Las pruebas no se marcan como aprobadas solo por existir o haber sido inspeccionadas. Los resultados documentados por terceros se consignan como documentación, no como ejecución propia.

## 4. Matriz de trazabilidad

La matriz usa una fila por criterio para evitar agrupar criterios distintos en una relación única.

| Requerimiento / criterio | Tipo | Fuente | User Story | Criterio de aceptación | Evidencia de prueba inspeccionada | Resultado | Cobertura / observaciones |
|---|---|---|---|---|---|---|---|
| US-01-CA1 | Funcional | Especificación § US-01 | US-01 — Registro de usuario | El email debe tener formato válido. | `server/tests/auth.test.ts` — registra un usuario nuevo; no se encontró una prueba específica de formato de email. | NOT RUN | Sin evidencia específica. Agregar caso con email sin dominio. |
| US-01-CA2 | Funcional | Especificación § US-01 | US-01 — Registro de usuario | El email se normaliza en minúsculas. | No se encontró una prueba específica. | NOT RUN | Sin evidencia localizada. |
| US-01-CA3 | Funcional | Especificación § US-01 | US-01 — Registro de usuario | La contraseña tiene mínimo 8 caracteres, un número y una mayúscula. | `server/tests/auth.test.ts` — escenario de contraseña débil no implementado; solo login usa `Password1`. | NOT RUN | Sin evidencia específica. |
| US-01-CA4 | Funcional | Especificación § US-01 | US-01 — Registro de usuario | Email duplicado devuelve 409. | No se encontró una prueba específica en `server/tests/auth.test.ts`. | NOT RUN | Sin evidencia localizada. |
| US-01-CA5 | Funcional | Especificación § US-01 | US-01 — Registro de usuario | Registro válido devuelve 201 y JWT. | `server/tests/auth.test.ts` — `registra un usuario nuevo` espera 201. | NOT RUN | Parcialmente cubierto: confirma 201, pero no valida que haya JWT en el cuerpo ni su validez. |
| US-01-CA6 | Funcional | Especificación § US-01 | US-01 — Registro de usuario | Validaciones devuelven 400 con mensaje descriptivo. | No se encontró una prueba específica de validación de registro. | NOT RUN | Sin evidencia localizada. |
| US-01-CA7 | Seguridad | Especificación § US-01 | US-01 — Registro de usuario | La contraseña no se devuelve en respuestas. | No se encontró una prueba específica. | NOT RUN | Sin evidencia localizada. |
| US-02-CA1 | Funcional | Especificación § US-02 | US-02 — Login de usuario | Login válido devuelve 200 y JWT con 24 horas. | `server/tests/auth.test.ts` — login válido espera 200. `server/tests/integration/jwt-token.test.ts` — firma, expiración de 24 horas y aceptación del token. | NOT RUN | Cubierto entre ambas pruebas, aunque no debe considerarse PASS hasta ejecutarlas. |
| US-02-CA2 | Funcional | Especificación § US-02 | US-02 — Login de usuario | Credenciales incorrectas devuelven 401. | `server/tests/auth.test.ts` — rechaza contraseña incorrecta. `server/tests/e2e/taskflow.spec.ts` — login fallido. | NOT RUN | Cubierto a nivel API/E2E. |
| US-02-CA3 | Seguridad | Especificación § US-02 | US-02 — Login de usuario | El mismo mensaje se usa para email inexistente y contraseña incorrecta. | No se encontró una prueba específica. | NOT RUN | Sin evidencia localizada. |
| US-02-CA4 | Seguridad | Especificación § US-02 | US-02 — Login de usuario | 5 intentos fallidos bloquean la cuenta 15 minutos. | No se encontró una prueba específica de bloqueo a cinco intentos; existe reinicio posterior a 3 intentos en `auth.test.ts`. | NOT RUN | Sin evidencia completa; falta probar bloqueo y duración. |
| US-02-CA5 | Seguridad | Especificación § US-02 | US-02 — Login de usuario | El contador se reinicia tras login exitoso. | `server/tests/auth.test.ts` — `reinicia el contador de intentos después de un login exitoso`. | NOT RUN | Cubierto a nivel funcional. |
| US-02-CA6 | Seguridad | Especificación § US-02 | US-02 — Login de usuario | El bloqueo se levanta automáticamente a los 15 minutos. | No se encontró una prueba específica temporal. | NOT RUN | Sin evidencia localizada. |
| US-02-CA7 | Seguridad | Especificación § US-02 | US-02 — Login de usuario | El JWT contiene userId. | `server/tests/integration/jwt-token.test.ts` — verifica `payload.userId` y duración. | NOT RUN | Cubierto. |
| US-17-CA1 | Funcional | Especificación § US-17 | US-17 — Recuperar contraseña | Se solicita reseteo indicando el email. | `server/tests/auth.test.ts` — llama a `/api/auth/forgot-password` con email. | NOT RUN | Cubierto parcialmente. |
| US-17-CA2 | Seguridad | Especificación § US-17 | US-17 — Recuperar contraseña | Respuesta idéntica para email registrado y desconocido. | No se encontró una prueba específica comparativa. | NOT RUN | Sin evidencia localizada. |
| US-17-CA3 | Seguridad | Especificación § US-17 | US-17 — Recuperar contraseña | Usuario registrado genera token de un solo uso. | `server/tests/auth.test.ts` — verifica que el token se rechaza al reutilizarse. | NOT RUN | Cubierto para reutilización; falta el alcance de usuarios desconocidos. |
| US-17-CA4 | Seguridad | Especificación § US-17 | US-17 — Recuperar contraseña | Token expira a los 60 minutos. | No se encontró una prueba específica. | NOT RUN | Sin evidencia localizada. |
| US-17-CA5 | Seguridad | Especificación § US-17 | US-17 — Recuperar contraseña | Token vencido, inexistente o usado devuelve 400. | `server/tests/auth.test.ts` — token usado devuelve 400. | NOT RUN | Parcial: falta token vencido e inexistente. |
| US-17-CA6 | Seguridad | Especificación § US-17 | US-17 — Recuperar contraseña | Nuevo token invalida tokens anteriores. | No se encontró una prueba específica. | NOT RUN | Sin evidencia localizada. |
| US-17-CA7 | Seguridad | Especificación § US-17 | US-17 — Recuperar contraseña | Nueva contraseña cumple las reglas de registro. | No se encontró una prueba específica. | NOT RUN | Sin evidencia localizada. |
| US-17-CA8 | Seguridad | Especificación § US-17 | US-17 — Recuperar contraseña | Reseteo exitoso reinicia intentos y desbloquea. | No se encontró una prueba específica. | NOT RUN | Sin evidencia localizada. |
| US-03-CA1 | Funcional | Especificación § US-03 | US-03 — Crear proyecto | Nombre obligatorio, entre 3 y 100 caracteres. | `server/tests/integration/projects-members.test.ts` — nombre corto en edición. No se encontró test específico de creación con nombre corto o límite 100. `server/tests/e2e/taskflow.spec.ts` — nombre vacío devuelve una prueba, pero el reporte indica una discrepancia previa con la implementación. | NOT RUN | Parcial. |
| US-03-CA2 | Funcional | Especificación § US-03 | US-03 — Crear proyecto | Descripción opcional, máximo 500 caracteres. | No se encontró una prueba específica. | NOT RUN | Sin evidencia localizada. |
| US-03-CA3 | Funcional | Especificación § US-03 | US-03 — Crear proyecto | Creador queda owner y miembro. | `server/tests/integration/projects-members.test.ts` — escenarios crean owner y miembro, pero no se encontró una aserción directa de ambos roles al crear. | NOT RUN | Parcial. |
| US-03-CA4 | Funcional | Especificación § US-03 | US-03 — Crear proyecto | Nombre duplicado del mismo usuario devuelve 409. | `server/tests/integration/projects-members.test.ts` — prueba duplicado al editar; no una prueba específica al crear. | NOT RUN | Sin evidencia específica de creación. |
| US-03-CA5 | Funcional | Especificación § US-03 | US-03 — Crear proyecto | Proyecto creado devuelve id y HTTP 201. | `server/tests/projects.test.ts` — creación espera 201. `server/tests/e2e/taskflow.spec.ts` — creación desde UI espera 201 y nombre visible. | NOT RUN | Parcial: el test no verifica explícitamente el formato `proj-*` en todos los casos. |
| US-03-CA6 | Seguridad / funcional | Especificación § US-03 | US-03 — Crear proyecto | Crear sin autenticación devuelve 401. | `server/tests/projects.test.ts` — rechaza crear proyecto sin autenticación. | NOT RUN | Cubierto. |
| US-04-CA1 | Funcional | Especificación § US-04 | US-04 — Listar proyectos del usuario | Solo owner/members; excluye ajenos. | `server/tests/projects.test.ts` — lista proyectos. `server/tests/integration/projects-members.test.ts` — proyecto compartido aparece al nuevo miembro. | NOT RUN | Parcial. |
| US-04-CA2 | Funcional | Especificación § US-04 | US-04 — Listar proyectos del usuario | Los proyectos archivados no aparecen. | No se encontró una prueba específica. | NOT RUN | Sin evidencia localizada. |
| US-04-CA3 | Funcional | Especificación § US-04 | US-04 — Listar proyectos del usuario | Respuesta incluye id, nombre, descripción y fecha de creación. | `server/tests/projects.test.ts` — solo verifica cantidad de proyectos. | NOT RUN | Sin evidencia suficiente. |
| US-04-CA4 | Funcional | Especificación § US-04 | US-04 — Listar proyectos del usuario | Sin proyectos devuelve array vacío. | `server/tests/e2e/taskflow.spec.ts` — espera estado vacío, pero no se considera aserción robusta por el feedback del repositorio. | NOT RUN | Parcial. |
| US-09-CA1 | Seguridad / funcional | Especificación § US-09 | US-09 — Editar proyecto | Solo owner puede editar; miembro recibe 403. | `server/tests/integration/projects-members.test.ts` — `un miembro que no es owner recibe 403`. | NOT RUN | Cubierto. |
| US-09-CA2 | Funcional | Especificación § US-09 | US-09 — Editar proyecto | Nombre mantiene longitud de 3–100. | `projects-members.test.ts` — nombre corto con 400; falta límite superior. | NOT RUN | Parcial. |
| US-09-CA3 | Funcional | Especificación § US-09 | US-09 — Editar proyecto | Descripción opcional hasta 500 caracteres. | No se encontró una prueba específica. | NOT RUN | Sin evidencia localizada. |
| US-09-CA4 | Funcional | Especificación § US-09 | US-09 — Editar proyecto | Cambiar nombre revalida unicidad y devuelve 409. | `server/tests/integration/projects-members.test.ts` — rechaza nombre repetido con 409. | NOT RUN | Cubierto. |
| US-09-CA5 | Funcional | Especificación § US-09 | US-09 — Editar proyecto | Campos ausentes conservan su valor. | No se encontró una prueba específica. | NOT RUN | Sin evidencia localizada. |
| US-09-CA6 | Funcional | Especificación § US-09 | US-09 — Editar proyecto | Respuesta devuelve proyecto completo actualizado. | `projects-members.test.ts` — owner cambia nombre y descripción y valida ambos campos. | NOT RUN | Parcial: falta verificar todos los campos completos. |
| US-09-CA7 | Seguridad | Especificación § US-09 | US-09 — Editar proyecto | Inexistente o ajeno devuelve 404. | `projects-members.test.ts` — ajeno 404, proyecto inexistente/id inválido 404. | NOT RUN | Cubierto. |
| US-10-CA1 | Seguridad / funcional | Especificación § US-10 | US-10 — Eliminar proyecto | Solo owner elimina; miembro recibe 403. | `projects-members.test.ts` — miembro recibe 403 y ajeno 404. | NOT RUN | Cubierto parcialmente: solo falta confirmar ajeno como criterio de seguridad, ya cubierto por el test. |
| US-10-CA2 | Funcional | Especificación § US-10 | US-10 — Eliminar proyecto | Eliminación física, no archivado. | `projects-members.test.ts` — owner borra y después GET de tareas devuelve 404. | NOT RUN | Cubierto parcialmente: no verifica campo `archived` o borrado de entidad. |
| US-10-CA3 | Funcional | Especificación § US-10 | US-10 — Eliminar proyecto | Eliminación elimina todas las tareas. | No se encontró una prueba directa de cascada de proyecto con tareas. | NOT RUN | Sin evidencia específica. |
| US-10-CA4 | Funcional | Especificación § US-10 | US-10 — Eliminar proyecto | También elimina comentarios, historial y etiquetas de las tareas. | No se encontró una prueba directa de borrado en cascada desde proyecto. | NOT RUN | Sin evidencia específica. |
| US-10-CA5 | Funcional | Especificación § US-10 | US-10 — Eliminar proyecto | No queda ningún registro asociado. | No se encontró una prueba directa. | NOT RUN | Sin evidencia específica. |
| US-10-CA6 | Funcional | Especificación § US-10 | US-10 — Eliminar proyecto | DELETE exitoso devuelve 204 sin cuerpo. | `projects-members.test.ts` — borra proyecto y espera 204. | NOT RUN | Cubierto en status; falta verificar cuerpo vacío. |
| US-10-CA7 | Funcional | Especificación § US-10 | US-10 — Eliminar proyecto | Proyecto inexistente devuelve 404. | `projects-members.test.ts` — proyecto inexistente 404. | NOT RUN | Cubierto. |
| US-11-CA1 | Seguridad / funcional | Especificación § US-11 | US-11 — Agregar/quitar miembros | Solo owner puede agregar/quitar; otro recibe 403. | `projects-members.test.ts` — miembro no owner recibe 403 al agregar y quitar. | NOT RUN | Cubierto. |
| US-11-CA2 | Funcional | Especificación § US-11 | US-11 — Agregar/quitar miembros | Email inexistente devuelve 404. | `projects-members.test.ts` — usuario desconocido 404. | NOT RUN | Cubierto. |
| US-11-CA3 | Funcional | Especificación § US-11 | US-11 — Agregar/quitar miembros | Usuario ya miembro devuelve 409. | `projects-members.test.ts` — duplicado 409. | NOT RUN | Cubierto. |
| US-11-CA4 | Funcional | Especificación § US-11 | US-11 — Agregar/quitar miembros | Owner no puede quitarse; devuelve 400. | `projects-members.test.ts` — owner no puede quitarse, 400. | NOT RUN | Cubierto. |
| US-11-CA5 | Funcional | Especificación § US-11 | US-11 — Agregar/quitar miembros | Miembro quitado deja de ver el proyecto. | `projects-members.test.ts` — quitado recibe 403 al consultar tareas; falta verificar desaparición de GET /projects. | NOT RUN | Parcial. |
| US-11-CA6 | Funcional | Especificación § US-11 | US-11 — Agregar/quitar miembros | Tareas asignadas quedan sin asignado al quitar miembro. | No se encontró una prueba específica. | NOT RUN | Sin evidencia localizada. |
| US-11-CA7 | Seguridad | Especificación § US-11 | US-11 — Agregar/quitar miembros | Ex-miembro no puede operar sobre tareas; devuelve 403. | `server/tests/integration/tasks-membership.test.ts` — ajeno recibe 403; no se encontró un caso específico de ex-miembro que conservaba una asignación previa. | NOT RUN | Parcial. |
| US-05-CA1 | Funcional | Especificación § US-05 | US-05 — Crear tarea en un proyecto | Título obligatorio de 3–200 caracteres. | `server/tests/e2e/taskflow.spec.ts` — título vacío rechazado. `server/tests/integration/tasks-update.test.ts` — título corto y no texto. Falta creación con límites exactos. | NOT RUN | Parcial. |
| US-05-CA2 | Funcional | Especificación § US-05 | US-05 — Crear tarea en un proyecto | Prioridad solo LOW/MEDIUM/HIGH/CRITICAL. | `tasks-update.test.ts` — prioridad inválida `URGENT` en edición. `tasks.test.ts` — crea con HIGH. | NOT RUN | Parcial: falta prueba específica de creación con prioridad inválida. |
| US-05-CA3 | Funcional | Especificación § US-05 | US-05 — Crear tarea en un proyecto | Estado inicial siempre TODO. | `server/tests/tasks.test.ts` — nueva tarea espera TODO. No se encontró prueba que fuerce status DONE en creación. | NOT RUN | Parcial. |
| US-05-CA4 | Funcional | Especificación § US-05 | US-05 — Crear tarea en un proyecto | Puede asignarse a un miembro al crear; opcional. | `server/tests/tasks.test.ts` — crea tarea con assignee. `tasks-update.test.ts` valida miembro al asignar. | NOT RUN | Parcial: falta crear asignada a miembro/no miembro como criterios específicos. |
| US-05-CA5 | Seguridad / funcional | Especificación § US-05 | US-05 — Crear tarea en un proyecto | Solo miembros pueden crear; ajeno recibe 403. | `server/tests/integration/membership.test.ts` — ajeno recibe 403 al crear. | NOT RUN | Cubierto. |
| US-05-CA6 | Funcional | Especificación § US-05 | US-05 — Crear tarea en un proyecto | Tarea creada devuelve id y 201. | `server/tests/tasks.test.ts` y E2E crean tarea esperando 201. | NOT RUN | Cubierto parcialmente; falta validar prefijo `task-*`. |
| US-06-CA1 | Funcional | Especificación § US-06 | US-06 — Cambiar estado de una tarea | TODO→IN_PROGRESS, IN_PROGRESS→DONE e IN_PROGRESS→TODO son válidas. | `tasks-update.test.ts` verifica flujo y retorno; `tasks.test.ts` verifica TODO→IN_PROGRESS. | NOT RUN | Cubierto. |
| US-06-CA2 | Funcional | Especificación § US-06 | US-06 — Cambiar estado de una tarea | TODO→DONE no está permitido. | `tasks-update.test.ts` incluye transiciones inválidas, pero no se encontró una aserción separada que pase directamente TODO→DONE. | NOT RUN | Parcial. |
| US-06-CA3 | Funcional | Especificación § US-06 | US-06 — Cambiar estado de una tarea | No se puede salir de DONE. | `tasks-update.test.ts` — rechaza DONE→TODO con 422. | NOT RUN | Parcial: falta otro destino distinto de TODO. |
| US-06-CA4 | Funcional | Especificación § US-06 | US-06 — Cambiar estado de una tarea | Transición inválida devuelve 422 descriptivo. | `tasks-update.test.ts` — DONE→TODO 422 con código y mensaje. | NOT RUN | Cubierto para ese caso. |
| US-06-CA5 | Seguridad / funcional | Especificación § US-06 | US-06 — Cambiar estado de una tarea | Solo asignado o admin/owner puede cambiar estado. | `tasks-update.test.ts` cubre asignado, owner y miembro común. | NOT RUN | Cubierto. |
| US-06-CA6 | Seguridad | Especificación § US-06 | US-06 — Cambiar estado de una tarea | Quién cambia debe ser miembro vigente; ajeno recibe 403. | `tasks-update.test.ts` — ajeno recibe 403. `tasks-membership.test.ts` — ajeno modifica 403. | NOT RUN | Cubierto. |
| US-06-CA7 | Funcional / trazabilidad | Especificación § US-06 | US-06 — Cambiar estado de una tarea | Cambio queda en historial con autor y timestamp. | `tasks-update.test.ts` — consulta historial y autor; `tasks-detail.test.ts` — historial inicial. | NOT RUN | Parcial: falta verificar timestamp exacto y todos los cambios bajo concurrencia. |
| US-07-CA1 | Funcional | Especificación § US-07 | US-07 — Filtrar y buscar tareas | Filtrar por status. | `server/tests/tasks.test.ts`; `tasks-search.test.ts` no incluye test directo de status, solo TODO en el test básico. | NOT RUN | Parcial. |
| US-07-CA2 | Funcional | Especificación § US-07 | US-07 — Filtrar y buscar tareas | Filtrar por assignedTo. | `tasks-search.test.ts` — `filtra por asignado e informa el email`. | NOT RUN | Cubierto. |
| US-07-CA3 | Funcional | Especificación § US-07 | US-07 — Filtrar y buscar tareas | Filtrar por priority. | `tasks-search.test.ts` — filtra HIGH. | NOT RUN | Cubierto. |
| US-07-CA4 | Funcional | Especificación § US-07 | US-07 — Filtrar y buscar tareas | Buscar texto en título y descripción, sin distinguir mayúsculas. | `tasks-search.test.ts` — busca título/descripción y prueba mayúsculas/minúsculas. | NOT RUN | Parcial/contradicción: la prueba espera que `COMPRAR` no coincida con `Comprar`, mientras el criterio exige que no distinga mayúsculas. |
| US-07-CA5 | Funcional | Especificación § US-07 | US-07 — Filtrar y buscar tareas | Filtros combinables simultáneamente. | No se encontró una prueba específica con dos o más filtros combinados. | NOT RUN | Sin evidencia localizada. |
| US-07-CA6 | Funcional | Especificación § US-07 | US-07 — Filtrar y buscar tareas | Sin resultados devuelve array vacío, no 404. | `tasks-search.test.ts` — búsqueda sin coincidencias devuelve 200 y lista vacía. | NOT RUN | Cubierto. |
| US-07-CA7 | Rendimiento / funcional | Especificación § US-07 | US-07 — Filtrar y buscar tareas | Paginación: 20 por defecto, configurable, máximo 100. | `tasks-search.test.ts` — listado devuelve 20/0; límite 5 y límite 500 acotado a 100. Falta probar offset. | NOT RUN | Parcial. |
| US-07-CA8 | Funcional | Especificación § US-07 | US-07 — Filtrar y buscar tareas | Respuesta incluye total filtrado. | `tasks-search.test.ts` — total en listado y búsqueda. | NOT RUN | Cubierto parcialmente. |
| US-12-CA1 | Funcional | Especificación § US-12 | US-12 — Editar tarea | Editar título, descripción y prioridad. | `tasks-update.test.ts` — actualiza los tres. | NOT RUN | Cubierto. |
| US-12-CA2 | Funcional | Especificación § US-12 | US-12 — Editar tarea | Título entre 3 y 200 caracteres. | `tasks-update.test.ts` — título corto/no texto, falta máximo 200. | NOT RUN | Parcial. |
| US-12-CA3 | Funcional | Especificación § US-12 | US-12 — Editar tarea | Prioridad válida. | `tasks-update.test.ts` — rechaza prioridad inválida. | NOT RUN | Cubierto. |
| US-12-CA4 | Funcional | Especificación § US-12 | US-12 — Editar tarea | Estado incluido usa reglas US-06. | `tasks-update.test.ts` integra estado y transiciones. | NOT RUN | Cubierto indirectamente. |
| US-12-CA5 | Seguridad | Especificación § US-12 | US-12 — Editar tarea | Solo miembros; ajeno recibe 403 y conserva tarea. | `tasks-membership.test.ts` — modifica ajeno recibe 403 y título no cambia. | NOT RUN | Cubierto. |
| US-12-CA6 | Funcional | Especificación § US-12 | US-12 — Editar tarea | Campos ausentes conservan valor. | `tasks-update.test.ts` — body vacío conserva título y updatedAt. | NOT RUN | Parcial: falta para varios campos combinados. |
| US-12-CA7 | Funcional | Especificación § US-12 | US-12 — Editar tarea | Tarea inexistente devuelve 404. | `tasks-update.test.ts` y `tasks-membership.test.ts` prueban 404. | NOT RUN | Cubierto. |
| US-13-CA1 | Seguridad | Especificación § US-13 | US-13 — Eliminar tarea | Solo miembros; ajeno recibe 403. | `tasks-membership.test.ts` — ajeno recibe 403 y recurso sigue existiendo. | NOT RUN | Cubierto. |
| US-13-CA2 | Funcional | Especificación § US-13 | US-13 — Eliminar tarea | Borrado elimina comentarios, historial y etiquetas. | `tasks-detail.test.ts` — borra tarea y cuenta 0 en task/comment/history/taskTag. | NOT RUN | Cubierto. |
| US-13-CA3 | Funcional | Especificación § US-13 | US-13 — Eliminar tarea | DELETE exitoso devuelve 204 sin cuerpo. | `tasks-detail.test.ts` y `tasks-membership.test.ts` esperan 204. | NOT RUN | Cubierto en status; falta aserción explícita de cuerpo vacío. |
| US-13-CA4 | Funcional | Especificación § US-13 | US-13 — Eliminar tarea | Tarea inexistente devuelve 404. | `tasks-detail.test.ts` y `tasks-membership.test.ts` prueban 404. | NOT RUN | Cubierto. |
| US-13-CA5 | Funcional | Especificación § US-13 | US-13 — Eliminar tarea | Tarea DONE también puede eliminarse. | No se encontró una prueba específica de borrado en DONE. | NOT RUN | Sin evidencia localizada. |
| US-14-CA1 | Funcional | Especificación § US-14 | US-14 — Asignar tarea a un miembro | Solo asignar a miembro; ajeno devuelve 400. | `tasks-update.test.ts` — asigna miembro y rechaza outsider. | NOT RUN | Cubierto. |
| US-14-CA2 | Funcional | Especificación § US-14 | US-14 — Asignar tarea a un miembro | Puede reasignarse. | `tasks-update.test.ts` asigna y desasigna; no se encontró un cambio directo entre dos miembros. | NOT RUN | Parcial. |
| US-14-CA3 | Funcional | Especificación § US-14 | US-14 — Asignar tarea a un miembro | Desasignar con null. | `tasks-update.test.ts` — desasigna con null. | NOT RUN | Cubierto. |
| US-14-CA4 | Funcional | Especificación § US-14 | US-14 — Asignar tarea a un miembro | Cualquier miembro puede asignar. | No se encontró una prueba específica de miembro común asignando. | NOT RUN | Sin evidencia localizada. |
| US-14-CA5 | Funcional | Especificación § US-14 | US-14 — Asignar tarea a un miembro | Asignación no modifica estado. | No se encontró una prueba específica que compare ambos estados antes/después. | NOT RUN | Sin evidencia localizada. |
| US-14-CA6 | Funcional | Especificación § US-14 | US-14 — Asignar tarea a un miembro | Tarea inexistente devuelve 404. | `tasks-update.test.ts` prueba tarea inexistente para update. | NOT RUN | Parcial: corresponde al endpoint general, no a una prueba nombrada de asignación. |
| US-15-CA1 | Funcional | Especificación § US-15 | US-15 — Etiquetar tareas | Nombres se normalizan a minúsculas y sin espacios. | `tasks-detail.test.ts` — agrega ` urgente ` y espera `urgente`; agrega/retorna nombre. | NOT RUN | Cubierto. |
| US-15-CA2 | Funcional | Especificación § US-15 | US-15 — Etiquetar tareas | Mayúsculas no distinguen etiquetas. | `tasks-detail.test.ts` verifica ` urgente ` y reutiliza el ID, pero no usa `BUG`/`bug` directamente. | NOT RUN | Parcial. |
| US-15-CA3 | Funcional | Especificación § US-15 | US-15 — Etiquetar tareas | Misma etiqueta no duplica; segunda vuelve 200. | `tasks-detail.test.ts` espera reutilización y mismo ID, pero no verifica explícitamente 200. | NOT RUN | Parcial. |
| US-15-CA4 | Funcional | Especificación § US-15 | US-15 — Etiquetar tareas | Nombre de etiqueta 1–30 caracteres. | `tasks-detail.test.ts` prueba vacío, mayor de 30 y no texto. | NOT RUN | Cubierto parcialmente; falta longitud mínima válida y límite superior válido. |
| US-15-CA5 | Funcional | Especificación § US-15 | US-15 — Etiquetar tareas | Máximo 10 etiquetas; la 11 devuelve 400. | `tasks-detail.test.ts` — rechaza etiqueta 11 con 400. | NOT RUN | Cubierto. |
| US-15-CA6 | Funcional | Especificación § US-15 | US-15 — Etiquetar tareas | Quitar etiqueta inexistente devuelve 404. | `tasks-detail.test.ts` — dos casos de 404. | NOT RUN | Cubierto. |
| US-15-CA7 | Seguridad | Especificación § US-15 | US-15 — Etiquetar tareas | Solo miembros pueden etiquetar; ajeno recibe 403. | `tasks-detail.test.ts` — ajeno no puede etiquetar 403. | NOT RUN | Cubierto. |
| US-16-CA1 | Funcional | Especificación § US-16 | US-16 — Fecha de vencimiento de tarea | Fecha calendario sin hora. | `tasks-update.test.ts` y `ids.test.ts` trabajan formato YYYY-MM-DD. | NOT RUN | Cubierto parcialmente. |
| US-16-CA2 | Funcional | Especificación § US-16 | US-16 — Fecha de vencimiento de tarea | Se carga y devuelve como ISO fecha. | `tasks-update.test.ts` — valida formato devuelto. | NOT RUN | Cubierto parcialmente. |
| US-16-CA3 | No funcional / zona horaria | Especificación § US-16 | US-16 — Fecha de vencimiento de tarea | Misma fecha en UTC-3 y UTC. | `tasks-update.test.ts` admite fecha sin comparar zonas horarias explícitamente. `CODE_SMELLS.md` indica que se probó con UTC y UTC-3, pero no afirma el valor exacto por diferencia zonal. | NOT RUN | Parcial. |
| US-16-CA4 | Funcional | Especificación § US-16 | US-16 — Fecha de vencimiento de tarea | Fecha opcional. | `tasks-update.test.ts` — body vacío conserva fecha y `dueDate` puede quedar null. | NOT RUN | Parcial. |
| US-16-CA5 | Funcional | Especificación § US-16 | US-16 — Fecha de vencimiento de tarea | Se puede quitar con null. | `tasks-update.test.ts` — acepta null y devuelve null. | NOT RUN | Cubierto. |
| US-16-CA6 | Funcional | Especificación § US-16 | US-16 — Fecha de vencimiento de tarea | Formato inválido devuelve 400. | `tasks-update.test.ts` rechaza `31/12/2026`; `ids.test.ts` rechaza formatos inválidos. | NOT RUN | Cubierto. |
| US-16-CA7 | Funcional | Especificación § US-16 | US-16 — Fecha de vencimiento de tarea | Se admite fecha pasada y se considera vencida. | No se encontró una prueba específica de fecha pasada ni cálculo de vencida. | NOT RUN | Sin evidencia localizada. |
| US-16-CA8 | Seguridad | Especificación § US-16 | US-16 — Fecha de vencimiento de tarea | Solo miembros pueden modificar vencimiento; ajeno recibe 403. | `tasks-membership.test.ts` cubre modificación general/ajeno. No hay un caso específico que cambie solo `dueDate`. | NOT RUN | Parcial. |
| US-08-CA1 | Funcional | Especificación § US-08 | US-08 — Comentar en una tarea | Comentario entre 1 y 1000 caracteres. | No se encontró una prueba específica de límites. | NOT RUN | Sin evidencia localizada. |
| US-08-CA2 | Funcional / validación | Especificación § US-08 | US-08 — Comentar en una tarea | Validación se ejecuta en API. | No se encontró una prueba específica. | NOT RUN | Sin evidencia localizada. |
| US-08-CA3 | Funcional | Especificación § US-08 | US-08 — Comentar en una tarea | Registro automático de autor y timestamp. | `server/tests/comments.test.ts` crea comentarios, pero no valida autor ni timestamp. | NOT RUN | Sin evidencia suficiente. |
| US-08-CA4 | Funcional | Especificación § US-08 | US-08 — Comentar en una tarea | Comentarios se devuelven ascendente por fecha. | `comments.test.ts` solo verifica un comentario. | NOT RUN | Sin evidencia localizada. |
| US-08-CA5 | Seguridad | Especificación § US-08 | US-08 — Comentar en una tarea | Solo miembros pueden comentar; ajeno recibe 403. | No se encontró una prueba específica de comentarios por ajeno. | NOT RUN | Sin evidencia localizada. |
| US-08-CA6 | Seguridad | Especificación § US-08 | US-08 — Comentar en una tarea | Usuario elimina propios; ajeno recibe 403. | No se encontró prueba de DELETE de comentarios ni de autorización por autor. | NOT RUN | Sin evidencia localizada. |
| RNF-REN-1 | Rendimiento | Especificación § Requerimientos no funcionales | N/A — requisito transversal | Todo listado paginado sin colección completa sin límite. | `tasks-search.test.ts` prueba limit máximo y total; no se encontraron pruebas generales de todos los listados. | NOT RUN | Parcial. |
| RNF-REN-2 | Rendimiento | Especificación § Requerimientos no funcionales | N/A — requisito transversal | p95 del listado con 5.000 tareas y 20.000 comentarios <= 500 ms. | `performance/scenarios/api-load.k6.js`; `informe_k6/reporte_performance.md` registra mediciones y `p95 < 500 ms` no cumplido en seed grande. | BLOCKED | Evidencia histórica de ejecución, no ejecución propia. No se pudo ejecutar k6 en esta revisión. |
| RNF-REN-3 | Rendimiento / arquitectura | Especificación § Requerimientos no funcionales | N/A — requisito transversal | Consultas por request no crecen con cantidad de resultados. | `CODE_SMELLS.md` documenta posible N+1 y paginación no aplicada; no se encontró prueba automatizada de conteo de consultas. | NOT RUN | Sin evidencia; brecha directa. |
| RNF-CON-1 | Concurrencia | Especificación § Requerimientos no funcionales | N/A — requisito transversal | Dos modificaciones simultáneas no pierden cambios. | No se encontró una prueba de concurrencia. | NOT RUN | Sin evidencia localizada. |
| RNF-CON-2 | Concurrencia | Especificación § Requerimientos no funcionales | N/A — requisito transversal | Historial registra todas las transiciones concurrentes. | No se encontró una prueba concurrente de historial. | NOT RUN | Sin evidencia localizada. |
| RNF-SEG-1 | Seguridad | Especificación § Requerimientos no funcionales | N/A — requisito transversal | Entradas se usan como datos, nunca concatenadas a SQL. | `tasks-search-injection.test.ts` verifica inyección y comillas; búsqueda parametrizada documentada en `CODE_SMELLS.md`. | NOT RUN | Cubierto para búsqueda; falta cobertura transversal. |
| RNF-SEG-2 | Seguridad | Especificación § Requerimientos no funcionales | N/A — requisito transversal | Recurso de proyecto exige miembro vigente. | `membership.test.ts` y `tasks-membership.test.ts` cubren tareas/proyectos. | NOT RUN | Parcial: no prueba todos los endpoints de recursos. |
| RNF-SEG-3 | Seguridad | Especificación § Requerimientos no funcionales | N/A — requisito transversal | Errores no revelan cuentas, datos ajenos ni internos. | `jwt-token.test.ts` y `tasks-search-injection.test.ts`; no se encontró comparación exhaustiva de mensajes genéricos. | NOT RUN | Parcial. |
| RNF-SEG-4 | Seguridad | Especificación § Requerimientos no funcionales | N/A — requisito transversal | Contraseñas con hash y salt, nunca texto plano. | `server/prisma/seed.ts` usa `bcrypt.hash`; no se encontró test específico de persistencia de contraseñas. | NOT RUN | Sin evidencia automatizada específica. |
| RNF-TRAZ-1 | Trazabilidad | Especificación § Requerimientos no funcionales | N/A — requisito transversal | Cada criterio debe tener al menos un test. | Esta matriz relaciona criterios con evidencia; existen brechas explícitas. | NOT RUN | No cumplido mientras existan criterios sin prueba. |
| RNF-TRAZ-2 | Trazabilidad / BDD | Especificación § Requerimientos no funcionales | N/A — requisito transversal | Cada escenario Gherkin debe ser ejecutable. | No se encontraron archivos Gherkin/step definitions. | NOT RUN | Sin evidencia de automatización Gherkin. |

## 5. Resumen de cobertura

No se dispone de una ejecución local ni de un reporte completo por criterio. Por ello no se calculan porcentajes.

- Historias originales: **17** (US-01 a US-17).
- Criterios originales identificados: se trazan los criterios individualmente y quedan marcados con prueba, prueba parcial o ausencia de evidencia según lo inspeccionado.
- Evidencia automatizada: existe una suite Jest/Supertest, pruebas E2E con Playwright y pruebas axe-core.
- Ejecuciones verificadas directamente en esta revisión: **0**.
- Estado global disponible: documentación del repositorio registra suites históricas, pero no es una ejecución propia reproducible en este entorno.
- Pruebas encontradas: archivos principales bajo `server/tests/`, `server/tests/integration/` y `server/tests/e2e/`.

La revisión no declara PASS para ninguna prueba individual. Los estados históricos mencionados en el repositorio deben verificar commit, fecha y salida antes de usarse como resultado final.

## 6. Brechas y acciones pendientes

1. Completar US-01: formato y normalización de email, contraseña débil, duplicado, mensaje descriptivo, token en respuesta y contraseña no expuesta.
2. Completar US-02: bloqueo a 5 intentos, duración de 15 minutos, auto desbloqueo y mensaje genérico idéntico.
3. Completar US-17: respuesta genérica, expiración, token inexistente, invalidación previa, contraseña nueva y reinicio de bloqueo.
4. Completar US-03 y US-04: límites de nombres, descripción, owner/membership, duplicados al crear, campos de listado y proyectos archivados.
5. Completar US-09 y US-10: descripción máxima, campos parciales, borrado físico completo y cascada desde proyectos con verificación de registros asociados.
6. Completar US-11: liberación de asignaciones y bloqueo de ex-miembros que conservaban asignación.
7. Completar US-05: límites exactos, forzar estado inicial, creación con asignado y validaciones de prioridad/título.
8. Completar US-06: TODO→DONE directo, transiciones desde DONE, timestamp exacto y concurrencia.
9. Completar US-07: combinación real de filtros, búsqueda sin distinguir mayúsculas, offset y prueba negativa. Existe una contradicción concreta: el test espera que `COMPRAR` no encuentre `Comprar`, mientras el criterio exige búsqueda insensible a mayúsculas.
10. Completar US-08: límites API, autor/timestamp, orden cronológico, comentario ajeno y eliminación por propietario/otro usuario.
11. Completar US-13: borrar tarea en estado DONE.
12. Completar US-14: reasignación entre miembros, asignación por miembro común y asignación sin cambio de estado.
13. Completar US-15: distinción exacta entre mayúsculas, segunda llamada con status 200 y límites válidos.
14. Completar US-16: UTC/UTC-3 con valor exacto, fecha pasada/vencida y modificación solo por miembro.
15. Añadir pruebas para concurrencia, conteo de consultas, N+1, respuestas genéricas y almacenamiento seguro de contraseñas.
16. Añadir o formalizar escenarios Gherkin ejecutables; no se encontraron archivos Gherkin/step definitions.

## 7. Registro de ejecución

### Ejecución propia

No se ejecutaron suites en esta sesión. Por ello:

- **Resultado Jest/Supertest:** NOT RUN.
- **Resultado Playwright E2E:** NOT RUN.
- **Resultado axe-core:** NOT RUN.
- **Resultado k6:** NOT RUN/BLOCKED según entorno.
- **Commit evaluado documentalmente:** 403c9f359afd812753715f28cb23a81f71644100.

Comandos documentados por el proyecto:

- `npm test`
- `npm run test:coverage`
- `npm run test:e2e`
- `npx playwright test a11y`
- `k6 run -e VUS=1 -e DURATION=30s performance/scenarios/api-load.k6.js`

Los scripts de testing deben ejecutarse en un entorno preparado con Node, dependencias, base de datos Prisma, servicios API/frontend y Playwright/Chrome antes de cambiar estados a PASS o FAIL.

### Evidencia histórica no reproducida aquí

- GitHub Actions muestra runs históricos marcados como failure en la rama donde se desarrolló CI, por lo que no se representan aquí como PASS.
- El feedback del repositorio menciona resultados históricos de 13 pruebas E2E, pero no se tomó como resultado verificable actual sin fecha, salida completa y commit reproducible.
- El reporte k6 registra incumplimiento p95 en seed grande, pero no se pudo ejecutar k6 en esta revisión.
- El archivo `test-results/.last-run.json` indica `passed`, pero no contiene fecha ni relación suficiente con un commit; se dejó como NOT RUN para evitar confundir archivo residual con ejecución propia.

## 8. Relación ATDD, BDD y TDD

- **ATDD:** no se encontró evidencia suficiente de acuerdos registrados con Product Owner/cliente vinculados a esta matriz.
- **BDD:** la especificación contiene escenarios Gherkin, pero no se encontraron archivos Gherkin ni step definitions que los ejecuten automáticamente.
- **TDD:** existen tests de caracterización y refactors documentados en `CODE_SMELLS.md`, que muestran una práctica posterior de pruebas, pero no permiten afirmar cobertura completa de todo el backlog.

## 9. Referencias

- `taskflow_especificacion_requerimientos.docx`
- `README.md`
- `server/tests/`
- `server/tests/integration/`
- `server/tests/e2e/`
- `docs/seguridad/HISTORIA_USUARIO_SEC03.md`
- `docs/seguridad/README.md`
- `docs/clase12-m2-reporte.md`
- `CODE_SMELLS.md`
- `ADR-001-testing-por-capas.md`
- `FEEDBACK_CORRECCION.md`
- `package.json`
- `server/package.json`
- `playwright.config.ts`
- `performance/scenarios/api-load.k6.js`
- `informe_k6/reporte_performance.md`
