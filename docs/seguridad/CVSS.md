# Evaluación CVSS 3.1 — Hallazgos SEC-01 a SEC-03

Se utiliza CVSS v3.1, como solicita el feedback. Los vectores describen el escenario de explotación del hallazgo antes de su corrección. El puntaje no sustituye el análisis de contexto del sistema.

| ID | Hallazgo | Vector CVSS 3.1 | Puntaje | Severidad | Estado actual |
|---|---|---|---:|---|---|
| SEC-01 | Token de recuperación reutilizable después de cambiar la contraseña | `CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:N/I:H/A:N` | **6.5** | Media | Corregido |
| SEC-02 | Contador de intentos fallidos no reiniciado tras autenticación correcta | `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:L` | **5.3** | Media | Corregido |
| SEC-03 | Falta de autorización por membresía al modificar o borrar tareas | `CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:N/I:H/A:H` | **8.1** | Alta | Pendiente |

## Justificación por hallazgo

### SEC-01 — Reutilización del token de recuperación

- **AV:N:** el endpoint de recuperación/reset se consume por HTTP.
- **AC:L:** no se requieren condiciones técnicas adicionales una vez que se dispone del token.
- **PR:N:** el endpoint de reset no requiere una sesión autenticada; el token actúa como credencial de autorización.
- **UI:R:** el escenario requiere que el titular solicite el restablecimiento y que el token llegue a estar disponible para quien lo reutiliza (por ejemplo, si queda expuesto).
- **S:U:** el impacto queda dentro de la cuenta afectada.
- **C:N/I:H/A:N:** no se obtiene lectura directa de datos; sí se puede volver a cambiar la contraseña y comprometer la integridad/control de la cuenta; no se asigna impacto de disponibilidad independiente.

**Corrección comprobable en `main`:** `resetPassword` rechaza registros con `usedAt` definido y marca el token como usado dentro de la transacción. `server/tests/auth.test.ts` verifica que el segundo uso devuelve 400.

### SEC-02 — Contador de intentos fallidos

- **AV:N/AC:L/PR:N/UI:N:** un tercero puede enviar intentos de autenticación por red sin autenticarse ni requerir interacción de la víctima.
- **S:U:** el efecto se limita a la cuenta de TaskFlow.
- **C:N/I:N/A:L:** el impacto es una denegación temporal de acceso por bloqueo de la cuenta; no se atribuye lectura ni modificación de datos.

**Corrección comprobable en `main`:** después de un login válido, `login` actualiza `failedAttempts: 0` y `lockedUntil: null`. `server/tests/auth.test.ts` verifica una secuencia de tres fallos, login correcto, otros tres fallos y un login correcto final.

### SEC-03 — Ausencia de autorización de membresía en PATCH/DELETE

- **AV:N:** las rutas vulnerables son endpoints HTTP.
- **AC:L:** no se requieren condiciones especiales.
- **PR:L:** el atacante necesita una cuenta autenticada, pero no pertenecer al proyecto de la tarea objetivo.
- **UI:N:** no hace falta interacción de otro usuario.
- **S:U:** el impacto se mantiene dentro de la aplicación.
- **C:N/I:H/A:H:** las rutas no exponen directamente datos adicionales, pero permiten alterar o eliminar tareas ajenas; el borrado también elimina comentarios, historial y etiquetas asociados.

**Estado comprobado en `main`:** `server/src/modules/tasks/tasks.routes.ts` aplica `authenticate` globalmente, pero las rutas `PATCH /:taskId` y `DELETE /:taskId` no aplican `requireTaskProjectMember('taskId')`. La propuesta de corrección es agregar ese middleware a ambas rutas y probar que un usuario autenticado que no pertenece al proyecto recibe 403, sin afectar a sus miembros.

## Referencias

- SEC-01: [reporte original del hallazgo](https://github.com/nierjero/taskflow_2026_s2-GrupoJSD/issues/1) (PR/issue de origen).
- SEC-02: [reporte original del hallazgo](https://github.com/nierjero/taskflow_2026_s2-GrupoJSD/issues/2) (PR/issue de origen).
- SEC-03: [`CODE_SMELLS.md`, sección S6](../../CODE_SMELLS.md#s6-patchdelete-de-tareas-sin-verificar-membresía).
- Estándar: [FIRST — CVSS v3.1](https://www.first.org/cvss/v3.1/specification-document).

Los puntajes son una evaluación técnica del escenario descrito; deben revisarse si cambian las condiciones de explotación o el impacto real.
