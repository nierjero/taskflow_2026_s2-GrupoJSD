# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: taskflow.spec.ts >> TaskFlow - E2E >> login exitoso
- Location: server/tests/e2e/taskflow.spec.ts:5:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator:  getByTestId('project-list')
Expected: visible
Received: hidden
Timeout:  10000ms

Call log:
  - Expect "toBeVisible" getByTestId('project-list') with timeout 10000ms
  - waiting for getByTestId('project-list')
    24 × locator resolved to <ul class="list" data-testid="project-list"></ul>
       - unexpected value "hidden"

```

```yaml
- banner:
  - link "TaskFlow":
    - /url: /projects
  - text: e2e-1792537738413-574627@test.com
  - button "Salir"
- main:
  - heading "Proyectos" [level=1]
  - text: Nombre
  - textbox "Nombre"
  - text: Descripción
  - textbox "Descripción"
  - button "Crear proyecto"
  - list
  - paragraph: Todavía no hay proyectos.
```

# Test source

```ts
  1   | import { test, expect, loginUI, abrirProyecto, auth, API_URL } from './fixtures';
  2   | 
  3   | test.describe('TaskFlow - E2E', () => {
  4   |   
  5   |   test('login exitoso', async ({ page, usuario }) => {
  6   |     await loginUI(page, usuario); // espera POST /auth/login = 200
> 7   |     await expect(page.getByTestId('project-list')).toBeVisible();
      |                                                    ^ Error: expect(locator).toBeVisible() failed
  8   |   });
  9   | 
  10  |   test('login fallido con contraseña incorrecta', async ({ page, usuario }) => {
  11  |     await page.goto('/login');
  12  |     await page.getByTestId('login-email-input').fill(usuario.email);
  13  |     await page.getByTestId('login-password-input').fill('wrong-password');
  14  | 
  15  |     const [res] = await Promise.all([
  16  |       page.waitForResponse(
  17  |         (r) => r.url().includes('/api/auth/login') && r.request().method() === 'POST'
  18  |       ),
  19  |       page.getByTestId('login-submit').click(),
  20  |     ]);
  21  | 
  22  |     expect([400, 401]).toContain(res.status());
  23  |     await expect(page.getByTestId('login-page')).toBeVisible();
  24  |   });
  25  | 
  26  |   
  27  |   test('crear proyecto con datos válidos', async ({ page, usuario }) => {
  28  |     await loginUI(page, usuario);
  29  | 
  30  |     const nombre = `Proyecto Playwright ${Date.now()}`;
  31  |     await page.getByTestId('project-name-input').fill(nombre);
  32  |     await page.getByTestId('project-description-input').fill('Proyecto de prueba');
  33  | 
  34  |     const [res] = await Promise.all([
  35  |       page.waitForResponse(
  36  |         (r) => r.url().includes('/api/projects') && r.request().method() === 'POST'
  37  |       ),
  38  |       page.getByTestId('project-create-submit').click(),
  39  |     ]);
  40  | 
  41  |     expect(res.status()).toBe(201);
  42  |     await expect(
  43  |       page.getByTestId('project-card-name').filter({ hasText: nombre })
  44  |     ).toBeVisible();
  45  |   });
  46  | 
  47  |   
  48  |   test('crear proyecto con nombre vacío debe fallar', async ({ request, usuario }) => {
  49  |     const res = await request.post(`${API_URL}/projects`, {
  50  |       headers: auth(usuario.token),
  51  |       data: { name: '', description: 'Sin nombre' },
  52  |     });
  53  | 
  54  |     
  55  |     expect([400, 422]).toContain(res.status());
  56  |   });
  57  | 
  58  |   
  59  |   test('crear tarea desde el tablero', async ({ page, usuario, proyecto }) => {
  60  |     await loginUI(page, usuario);
  61  |     await abrirProyecto(page, proyecto.name);
  62  | 
  63  |     const titulo = `Tarea E2E ${Date.now()}`;
  64  |     await page.getByTestId('task-create-title-input').fill(titulo);
  65  |     await page.getByTestId('task-create-description-input').fill('Descripción de la tarea');
  66  |     await page.getByTestId('task-create-priority-select').selectOption('HIGH');
  67  |     await page.getByTestId('task-create-assignee-select').selectOption({ label: usuario.email });
  68  |     await page.getByTestId('task-create-duedate-input').fill('2026-12-31');
  69  | 
  70  |     const [res] = await Promise.all([
  71  |       page.waitForResponse(
  72  |         (r) =>
  73  |           r.url().includes('/api/projects/') &&
  74  |           r.url().includes('/tasks') &&
  75  |           r.request().method() === 'POST'
  76  |       ),
  77  |       page.getByTestId('task-create-submit').click(),
  78  |     ]);
  79  | 
  80  |     expect(res.status()).toBe(201);
  81  |     await expect(page.getByTestId('task-card-title').filter({ hasText: titulo })).toBeVisible();
  82  |   });
  83  | 
  84  |   test('crear tarea sin título debe rechazar la validación', async ({
  85  |     request,
  86  |     usuario,
  87  |     proyecto,
  88  |   }) => {
  89  |     const res = await request.post(`${API_URL}/projects/${proyecto.id}/tasks`, {
  90  |       headers: auth(usuario.token),
  91  |       data: { title: '', description: 'Tarea inválida' },
  92  |     });
  93  | 
  94  |     
  95  |     expect([400, 422]).toContain(res.status());
  96  |   });
  97  | 
  98  |   test('editar tarea y agregar etiqueta', async ({ page, usuario, proyecto, tarea }) => {
  99  |     await loginUI(page, usuario);
  100 |     await abrirProyecto(page, proyecto.name);
  101 | 
  102 |     await page.getByTestId('task-card-title').filter({ hasText: tarea.title }).click();
  103 |     await expect(page.getByTestId('task-detail-page')).toBeVisible();
  104 | 
  105 |     await page.getByTestId('task-title-input').fill('Tarea editada');
  106 |     await page.getByTestId('task-priority-select').selectOption('LOW');
  107 | 
```