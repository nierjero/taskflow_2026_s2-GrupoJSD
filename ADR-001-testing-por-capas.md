# ADR-001: Testing por capas

## Estado

Aceptado

## Contexto

TaskFlow tiene una API y una interfaz web. Probar todo desde la interfaz sería más lento y dificultaría encontrar el origen de los errores.

## Decisión

Se organizará el testing en capas:

- **API:** pruebas de endpoints y lógica del backend.
- **E2E:** pruebas de los flujos principales desde la interfaz.
- **Fixtures:** preparación reutilizable de datos y estado.

## Consecuencias

Los tests serán más rápidos, claros y fáciles de mantener. Se descarta probar todo únicamente desde la UI o usar una estructura plana, porque serían opciones menos eficientes a medida que el proyecto crezca.