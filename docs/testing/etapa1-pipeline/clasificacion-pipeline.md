# Ejercicio 1B - Clasificación de resultados del pipeline

Proyecto: TaskFlow
Workflow: CI de calidad (informativo)
Herramienta: GitHub Actions

## 1. Resultados del pipeline

| Etapa | Resultado | Clasificación | Evidencia |
|---|---|---|---|
| Build del servidor | Aprobado | Sin errores detectados | Job Build del servidor exitoso |
| Lint (ESLint) | Fallido | C. Calidad de código | comments.service.ts:7, 16 y 26 |
| Tests | Fallido | A. Bug real | Fallos en pruebas automatizadas |
| Cobertura | Fallido | B. Falta de tests/cobertura | No alcanza 70% de líneas y 40% de ramas |
| Build del cliente | Aprobado | Sin errores detectados | Job Build del cliente exitoso |

## 2. Detalle de ESLint

Archivo: server/src/modules/comments/comments.service.ts

- Línea 7: uso de any.
- Línea 16: variable e declarada pero nunca utilizada.
- Línea 26: uso de any.

Clasificación: C. Calidad de código.

También se detectaron dos warnings en:
server/src/middleware/errors.ts

## 3. Análisis de las pruebas

La ejecución inicial de US-16 detectó:

- Criterios 1, 2 y 3: desplazamiento de un día en las fechas.
- Criterio 4: aprobado.
- Criterio 5: aprobado.
- Criterio 6: HTTP 400 correcto, pero falló la comprobación del mensaje.
- Criterio 7: fecha pasada aceptada, pero con desplazamiento de un día.
- Criterio 8: un usuario externo pudo modificar una tarea.

Clasificación: A. Bug real, excepto el problema de aserción del criterio 6, que requiere revisión.

## 4. Análisis de cobertura

La ejecución inicial registró:

- Líneas: 53,16%.
- Ramas: 22,54%.
- Sentencias: 49,64%.
- Funciones: 42,30%.

El workflow exige:

- 70% de líneas.
- 40% de ramas.

Clasificación: B. Falta de cobertura.

## 5. Conclusión

El pipeline funciona y permite identificar problemas de calidad.

Se detectaron errores de ESLint, defectos funcionales en US-16 y cobertura inferior al umbral establecido.

En este ejercicio se documentan los resultados sin modificar la implementación ni eliminar pruebas que detectan defectos reales.
