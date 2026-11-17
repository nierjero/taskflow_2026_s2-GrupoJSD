# Revisión de seguridad — TaskFlow

Este directorio reúne la evidencia de los puntos de Seguridad + accesibilidad. La corrección de accesibilidad y sus cinco pruebas `axe-core` existentes se mantienen sin cambios.

## Estado de los hallazgos manuales

| ID | Hallazgo | Estado | Evidencia |
|---|---|---|---|
| SEC-01 | Reutilización de token de recuperación de contraseña | Corregido | `resetPassword` rechaza tokens con `usedAt`; test de regresión en `server/tests/auth.test.ts`. |
| SEC-02 | El contador de intentos fallidos no se reiniciaba tras login exitoso | Corregido | `login` reinicia `failedAttempts` y `lockedUntil`; test de regresión en `server/tests/auth.test.ts`. |
| SEC-03 | Un usuario autenticado que no pertenece al proyecto puede modificar o borrar sus tareas | Remediado en rutas | `PATCH /api/tasks/:taskId` y `DELETE /api/tasks/:taskId` aplican `requireTaskProjectMember`; cobertura en `server/tests/integration/tasks-membership.test.ts`. |

SEC-01 y SEC-02 se conservan en el análisis CVSS como riesgos identificados y corregidos, no como vulnerabilidades abiertas de la versión actual. SEC-03 cuenta con la historia de usuario de remediación en `HISTORIA_USUARIO_SEC03.md`, middleware de autorización aplicado a las rutas y cinco pruebas de integración. La ejecución local de esas pruebas debe confirmarse antes de darla por validada.

## OWASP ZAP Baseline

**Escaneo ejecutado:** 17 de noviembre de 2026, con OWASP ZAP 2.17.0, contra `http://host.docker.internal:5173` (frontend Vite en entorno de desarrollo).

| Métrica | Resultado |
|---|---:|
| URLs analizadas | 7 |
| Riesgo alto | 0 |
| Riesgo medio | 3 |
| Riesgo bajo | 4 |
| Informativo | 2 |
| Pruebas PASS | 60 |
| Pruebas FAIL | 0 |

### Alertas registradas

| Nivel informado | Alerta | Instancias |
|---|---|---:|
| Medio | Content Security Policy (CSP) Header Not Set | 3 |
| Medio | Cross-Domain Misconfiguration (CORS) | 5 |
| Medio | Missing Anti-clickjacking Header | 2 |
| Bajo | Cross-Origin-Embedder-Policy (COEP) Missing or Invalid | 3 |
| Bajo | Cross-Origin-Opener-Policy (COOP) Missing or Invalid | 3 |
| Bajo | Permissions Policy Header Not Set | 5 |
| Bajo | X-Content-Type-Options Header Missing | 5 |
| Informativo | Modern Web Application | 3 |
| Informativo | Storable but Non-Cacheable Content | 5 |

Los hallazgos de cabeceras y CORS deben evaluarse en la configuración de despliegue. Este escaneo se realizó sobre el servidor de desarrollo de Vite, por lo que no permite concluir que la configuración de producción tenga las mismas cabeceras ni demuestra por sí solo la seguridad de la API. El baseline realiza spider y análisis pasivo; no equivale a un pentest ni a un escaneo activo autenticado. Las alertas deben revisarse antes de clasificarlas como vulnerabilidades explotables o falsos positivos.

Los reportes generados por la ejecución están en:

- `zap-baseline-report.html`: informe legible de ZAP.
- `zap-baseline-report.json`: resultados estructurados para análisis.

### Repetir el escaneo

1. Instalar Docker (Docker Desktop en macOS/Windows o Docker Engine en Linux).
2. Arrancar el frontend y comprobar que responde en `http://127.0.0.1:5173`.
3. Desde otra terminal, en la raíz del repositorio, ejecutar `bash scripts/zap-baseline.sh`.
4. Revisar los dos reportes en `docs/seguridad/`.

El contenedor usa `host.docker.internal` para llegar al host. En Linux el script agrega el alias al gateway de Docker. Para cambiar el puerto/destino, se pueden configurar `ZAP_TARGET` (URL vista desde el contenedor) y `ZAP_HEALTH_URL` (URL comprobada desde la máquina local), por ejemplo:

```bash
ZAP_TARGET=http://host.docker.internal:5173 ZAP_HEALTH_URL=http://127.0.0.1:5173 bash scripts/zap-baseline.sh
```
