# Informe de estado - TaskFlow

## 1. Resumen

Se incorporaron pruebas automatizadas para la historia US-16 mediante asistencia de IA. La ejecución inicial detectó problemas en el manejo de fechas y en la autorización de modificaciones.

El repositorio cuenta con un workflow de GitHub Actions para automatizar controles de calidad.

## 2. Estado de las pruebas

Historia: US-16 - Fecha de vencimiento de tarea.

- Tests ejecutados: 8.
- Tests aprobados: 2.
- Tests fallidos: 6.
- Criterios con resultados satisfactorios: 4 y 5.
- Criterios con defectos detectados: 1, 2, 3, 7 y 8.
- Criterio 6: HTTP 400 correcto, pero falló la comprobación del mensaje.

## 3. Métricas seleccionadas

### Métrica 1 - Resultado de ejecución

2 de 8 tests aprobados: 25%.
6 de 8 tests fallidos: 75%.

Esta métrica permite identificar cuántos comportamientos necesitan revisión.

### Métrica 2 - Cobertura de código

Según la ejecución de cobertura:

- Sentencias: 49,64%.
- Ramas: 22,54%.
- Funciones: 42,30%.
- Líneas: 53,16%.

El resultado está por debajo del umbral del workflow: 70% de líneas y 40% de ramas.

### Métrica 3 - Cobertura de requisitos

Se generaron 8 tests para 8 criterios de aceptación de US-16.

Sin embargo, tener un test por criterio no significa que todos los requisitos estén correctamente implementados.

Se detectaron problemas en los criterios 1, 2, 3, 7 y 8.

## 4. Métrica descartada

Se descarta la cantidad total de tests como indicador aislado de calidad.

Tener más tests no garantiza que los requisitos estén correctamente cubiertos ni que las pruebas detecten defectos.

## 5. Defectos detectados

- Desplazamiento de un día al guardar y devolver fechas.
- Conversión de fechas dependiente de la zona horaria.
- Falta de control de autorización al modificar dueDate.
- Diferencia entre la estructura de error esperada y la recibida por el test del criterio 6.

## 6. Riesgos pendientes

- Los usuarios externos podrían modificar fechas de tareas.
- Las fechas podrían mostrarse con un día incorrecto.
- La cobertura general del servidor está por debajo del umbral configurado.
- Es necesario revisar la estructura de errores para completar la validación del criterio 6.

## 7. Recomendación

NO LIBERAR.

Los resultados muestran defectos funcionales y de autorización que afectan requisitos de aceptación. Se recomienda corregirlos y repetir las pruebas antes de considerar la liberación.

## 8. Fuente de datos

- server/tests/dueDate.test.ts
- docs/testing/etapa2-ia/resultados/ejecucion-inicial.txt
- docs/testing/etapa2-ia/resultados/cobertura.txt
- .github/workflows/ci.yml

Nota: la cobertura indicada corresponde a la ejecución global de Jest con el archivo dueDate.test.ts, no exclusivamente a ese archivo.
