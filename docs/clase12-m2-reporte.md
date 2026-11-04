# Testing de seguridad y accesibilidad

## Dependencias

Se ejecutó npm audit sobre el proyecto. El reporte indicó 8 vulnerabilidades: 1 moderate, 6 high y 1 critical. Estos resultados pueden cambiar cuando se actualicen las dependencias, por lo que reflejan solo el momento en que se corrió la auditoría.

De todas las vulnerabilidades, se analizaron dos, ambas dependencias transitivas de Express.
La primera es proxy-addr, en las versiones 1.1.0 a 2.0.7, clasificada como critical. Para esta npm indica un arreglo directo con npm audit fix, sin necesidad de --force.
La segunda es path-to-regexp, en versiones anteriores a la 0.1.13, clasificada como high. Npm propone npm audit fix --force, que instalaría express@4.22.3, una versión fuera del rango declarado en el proyecto. Como ese cambio modifica la versión declarada, conviene revisar la compatibilidad y correr las pruebas del servidor antes de aplicarlo.

## Headers de seguridad

Se inspeccionaron los headers de las respuestas de /api/health y /api/projects, y el resultado fue el mismo en ambos. La segunda respondió 200 OK con un token válido.

No aparece Content-Security-Policy, por lo que el servidor no define ninguna política CSP. Tampoco aparece Strict-Transport-Security, aunque en este caso la prueba se hizo por HTTP local y no por HTTPS, así que la ausencia de HSTS no es del todo concluyente. Faltan además X-Frame-Options, que protege contra el embebido de la aplicación en un iframe, y X-Content-Type-Options, que debería llevar la directiva nosniff.

Aparecen dos headers que sí conviene revisar. X-Powered-By vale Express, lo cual expone la tecnología del servidor. Access-Control-Allow-Origin vale *, lo que significa que CORS permite solicitudes desde cualquier origen.

### Hallazgos
SEC-01: dependencias transitivas vulnerables en producción

Este hallazgo tiene severidad critical para proxy-addr y high para path-to-regexp. Consiste en que npm audit detectó vulnerabilidades en dependencias transitivas del servidor Express. La evidencia es la propia salida de npm audit, que identificó a proxy-addr como critical, con arreglo mediante npm audit fix, y a path-to-regexp como high, con un arreglo forzado que propone una versión de Express fuera del rango declarado.

El impacto real depende de la exposición la aplicación a las condiciones que describe cada aviso y de cómo se usen las dependencias afectadas. Como remediación se propone actualizar las dependencias afectadas, revisar con cuidado el cambio que sugiere npm y ejecutar las pruebas del servidor antes de desplegar.

SEC-02: headers de seguridad ausentes y CORS permisivo

Las respuestas inspeccionadas no incluyen CSP, HSTS, X-Frame-Options ni X-Content-Type-Options, y además anuncian X-Powered-By: Express y Access-Control-Allow-Origin: *.

Para reproducirlo se ejecuta curl -I http://localhost:3000/api/health, luego curl -I http://localhost:3000/api/projects con un token válido. En ambos casos se recibió 200 OK, con X-Powered-By: Express y Access-Control-Allow-Origin: *, mientras que los otros cuatro headers no estaban presentes.

El impacto es doble. Por un lado, la configuración revela la tecnología del servidor y no muestra varias defensas habituales. Por otro, CORS con * permite solicitudes desde cualquier origen del navegador. Como remediación se propone configurar los headers adecuados para el despliegue, ocultar X-Powered-By y restringir CORS a los orígenes que realmente deban acceder a la API.

## Control de seguridad verificado

Se probó el inicio de sesión de Ana y la consulta de /api/projects. Lo esperado era que las credenciales válidas permitieran iniciar sesión y consultar la ruta protegida, y que una ruta protegida sin token fuera rechazada. Lo obtenido fue que el login respondió 200 OK y que /api/projects también respondió 200 OK con el token de Ana.

## Control de seguridad de autenticación requerida

Se probó solicitar GET /api/projects sin enviar la cabecera Authorization. Lo esperado era que la API rechazara la solicitud, y ocurrió: respondió 401 Unauthorized, con un cuerpo que incluye el código UNAUTHORIZED y el mensaje Authentication required. Este comportamiento lo explica el middleware authenticate, ubicado en server/src/middleware/auth.ts, que rechaza toda solicitud que no traiga una cabecera Bearer.

### Hallazgos
SEC-03: un usuario ajeno puede modificar y eliminar tareas

La severidad de este hallazgo fue considerada high, porque un usuario autenticado que no pertenece al proyecto pudo alterar y eliminar tareas ajenas.

La API rechazó las solicitudes de lectura de Bob, pero le permitió modificar y eliminar tareas del proyecto de Ana. Es decir, el control de membresía está aplicado en las rutas de lectura y falta en las de escritura.

Para reproducirlo, primero se inicia sesión como Ana y se crea un proyecto con tareas descartables. Luego se inicia sesión como Bob, que no es miembro del proyecto, y se solicitan GET /api/projects/{projectId}/tasks y GET /api/tasks/{taskId}. Después Bob envía PATCH /api/tasks/{taskId} con el cuerpo {"title":"Cambio de título por Bob"}. Por último, con el ID de otra tarea descartable, envía DELETE /api/tasks/{taskId}.

Los dos GET respondieron 403 Forbidden, que es lo correcto. El PATCH respondió 200 OK y cambió el título de la tarea. El DELETE respondió 204 No Content, evidenciando que la tarea fue eliminada.

El impacto es que un usuario autenticado sin acceso al proyecto puede modificar y borrar tareas ajenas. Esto afecta la integridad de los datos, porque se pueden alterar, y también su disponibilidad, porque se pueden destruir. Como remediación se propone verificar en el servidor la membresía y los permisos del usuario antes de actualizar o eliminar una tarea, y agregar pruebas de integración que confirmen dos cosas: que un usuario no miembro recibe un rechazo, y que la tarea no cambia ni desaparece.

La evidencia proviene de una prueba local sobre proj-4 y task-13.

## Auditoría de accesibilidad

Se ejecutó npx playwright test a11y. En la auditoría inicial, axe no reportó violaciones en Login, Registro, Proyectos ni Tablero. En Detalle de tarea reportó la regla label, con impacto critical según axe, para el campo de etiquetas (input[data-testid="tag-add-input"]) y el campo de comentarios (textarea[data-testid="comment-add-input"]). El criterio relacionado es WCAG 2.1, 4.1.2, nivel A.

Se agregaron nombres accesibles a ambos campos en client/src/pages/TaskDetailPage.tsx. Al campo de etiquetas se le asignó aria-label="Nombre de la etiqueta" y al de comentarios aria-label="Escribir comentario".

La verificación con A11Y_VERIFY_RULE=label A11Y_VERIFY_VIEWS="Detalle de tarea" npx playwright test a11y pasó: axe no reportó la regla label en esa vista. En la auditoría posterior, las cinco vistas dieron cero reglas violadas y Playwright terminó con 5 pruebas aprobadas.

### Hallazgos

ACC-01: campo de etiquetas sin nombre accesible

Este hallazgo corresponde al criterio de éxito 4.1.2 (Name, Role, Value) de WCAG 2.1, de nivel A, y al principio Robusto de POUR. Fue detectado con axe-core en la vista Detalle de tarea, donde axe reportó que el campo para añadir etiquetas no tenía un nombre accesible. Se corrigió agregando aria-label="Nombre de la etiqueta". En la verificación, la regla label dejó de aparecer en Detalle de tarea.

ACC-02: campo de comentarios sin nombre accesible

Este hallazgo corresponde también al criterio 4.1.2 (Name, Role, Value) de WCAG 2.1, de nivel A, y al principio Robusto de POUR. Fue detectado con axe-core en la vista Detalle de tarea, donde axe reportó que el campo de comentarios no tenía un nombre accesible. Se corrigió agregando aria-label="Escribir comentario". En la verificación, la regla label dejó de aparecer en Detalle de tarea.

User story de accesibilidad

Como persona que usa un lector de pantalla, quiero que los campos de etiquetas y comentarios tengan nombres accesibles, para poder identificarlos y utilizarlos.

Los criterios de aceptación son tres. Primero, axe no reporta la regla label en Detalle de tarea. Segundo, el campo de etiquetas tiene el nombre accesible “Nombre de la etiqueta”. Tercero, el campo de comentarios tiene el nombre accesible “Escribir comentario”.
