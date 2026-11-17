# Revisión de seguridad — TaskFlow

Este directorio completa los puntos pendientes del feedback de Seguridad + accesibilidad. La corrección de accesibilidad y sus cinco pruebas `axe-core` existentes no se modifican.

## Estado de los hallazgos manuales

| ID | Hallazgo | Estado en `main` | Evidencia actual |
|---|---|---|---|
| SEC-01 | Reutilización de token de recuperación de contraseña | Corregido | `resetPassword` rechaza tokens con `usedAt`; el test de regresión está en `server/tests/auth.test.ts`. |
| SEC-02 | El contador de intentos fallidos no se reiniciaba tras login exitoso | Corregido | `login` reinicia `failedAttempts` y `lockedUntil`; el test de regresión está en `server/tests/auth.test.ts`. |
| SEC-03 | Un usuario autenticado que no pertenece al proyecto puede modificar o borrar sus tareas | Pendiente de remediación | `PATCH /api/tasks/:taskId` y `DELETE /api/tasks/:taskId` no aplican `requireTaskProjectMember`; ver `CODE_SMELLS.md`, sección S6. |

Los hallazgos SEC-01 y SEC-02 se conservan en el análisis CVSS como riesgos identificados y corregidos, no como vulnerabilidades abiertas de la versión actual. SEC-03 permanece abierto y tiene una historia de usuario de remediación.

## OWASP ZAP Baseline

El escaneo debe ejecutarse con la aplicación local levantada. Desde la raíz del repositorio:

1. Instalar Docker (Docker Desktop en macOS/Windows o Docker Engine en Linux).
2. Arrancar TaskFlow con `npm run dev` y verificar que el frontend responde en `http://localhost:5173`.
3. En otra terminal, ejecutar `bash scripts/zap-baseline.sh`.
4. Revisar los resultados en `docs/seguridad/zap-baseline-report.html` y `docs/seguridad/zap-baseline-report.json`.

El contenedor usa `host.docker.internal` para llegar al host. En Linux el script agrega el alias al gateway de Docker. Para cambiar el puerto/destino, se pueden configurar `ZAP_TARGET` (URL vista desde el contenedor) y `ZAP_HEALTH_URL` (URL comprobada desde la máquina local), por ejemplo:

```bash
ZAP_TARGET=http://host.docker.internal:5173 ZAP_HEALTH_URL=http://127.0.0.1:5173 bash scripts/zap-baseline.sh
```

El baseline ejecuta spider y análisis pasivo. No equivale a un pentest ni a un escaneo activo autenticado. Los falsos positivos deben revisarse manualmente y documentarse antes de marcarlos como descartados.

**Importante:** no se incluye un reporte ficticio. El HTML/JSON se genera al ejecutar el script contra una instancia real; hasta entonces, el escaneo figura como pendiente de ejecución.
