# Historia de usuario — Remediación SEC-03

**ID:** US-SEC-03  
**Título:** Restringir la modificación y eliminación de tareas a miembros del proyecto  
**Prioridad:** Alta  
**Riesgo asociado:** CVSS 3.1 8.1 (Alta)

## Historia

Como integrante de un proyecto, quiero que solamente los miembros de ese proyecto puedan modificar o eliminar sus tareas, para evitar que un usuario autenticado ajeno al proyecto altere o destruya información que no le pertenece.

## Criterios de aceptación

1. Dado un usuario autenticado que pertenece al proyecto de una tarea, cuando ejecuta `PATCH /api/tasks/:taskId`, el sistema permite la operación si el cuerpo cumple las validaciones existentes.
2. Dado un usuario autenticado que pertenece al proyecto de una tarea, cuando ejecuta `DELETE /api/tasks/:taskId`, el sistema permite eliminarla según las reglas actuales.
3. Dado un usuario autenticado que **no** pertenece al proyecto de la tarea, cuando ejecuta `PATCH /api/tasks/:taskId`, el sistema responde `403 FORBIDDEN` y no modifica ningún campo ni crea registros de historial.
4. Dado un usuario autenticado que **no** pertenece al proyecto de la tarea, cuando ejecuta `DELETE /api/tasks/:taskId`, el sistema responde `403 FORBIDDEN` y no elimina la tarea, sus comentarios, su historial ni sus etiquetas.
5. Dado un usuario autenticado que intenta operar sobre un identificador de tarea inexistente o inválido, el sistema conserva la respuesta `404 NOT_FOUND` definida por el middleware existente.
6. Las rutas de lectura, etiquetas e historial conservan su autorización actual; el cambio no debe debilitar ni alterar esas reglas.

## Tareas técnicas

- [ ] Agregar `requireTaskProjectMember('taskId')` a `PATCH /:taskId` y `DELETE /:taskId` en `server/src/modules/tasks/tasks.routes.ts`.
- [ ] Agregar pruebas de integración para PATCH y DELETE con miembro y no miembro.
- [ ] Verificar que el rechazo devuelve 403 y no produce cambios en la base de datos.
- [ ] Ejecutar la suite de integración completa y los tests E2E relevantes.

## Fuera de alcance

No se cambian las reglas de negocio de edición, transición de estados ni eliminación para los miembros autorizados. La historia corrige exclusivamente la falta de autorización por pertenencia al proyecto.
