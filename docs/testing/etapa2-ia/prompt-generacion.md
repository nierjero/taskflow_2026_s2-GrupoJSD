ROL:
Actúa como ingeniero de QA especializado en testing de APIs con Jest y Supertest.

CONTEXTO:
TaskFlow utiliza Express, TypeScript, Prisma, Jest y Supertest.
Los tests existentes están en server/tests/tasks.test.ts.
Utiliza las funciones auxiliares existentes y respeta el estilo del proyecto.

INSTRUCCIÓN:
Genera tests automatizados para US-16 - Fecha de vencimiento de tarea.

CRITERIOS:
1. La fecha es un día calendario, sin hora.
2. Se utiliza formato YYYY-MM-DD.
3. La fecha no cambia independientemente de la zona horaria.
4. La fecha es opcional.
5. Se puede eliminar enviando null.
6. Un formato inválido devuelve HTTP 400.
7. Se admiten fechas pasadas.
8. Solo los miembros del proyecto pueden modificar la fecha; los demás reciben HTTP 403.

RESTRICCIONES:
- No inventes endpoints ni reglas.
- No modifiques código de producción.
- No elimines tests existentes.
- Cada test debe comprobar resultados concretos.
- Informa si la implementación contradice algún criterio.

FORMATO:
Un archivo server/tests/dueDate.test.ts con un test identificable por criterio.
Explica qué verifica cada test y señala posibles defectos.
