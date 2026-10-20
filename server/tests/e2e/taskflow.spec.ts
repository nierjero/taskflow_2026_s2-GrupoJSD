import { test, expect, loginUI, abrirProyecto, auth, API_URL } from './fixtures';

test.describe('TaskFlow - E2E', () => {
  
  test('login exitoso', async ({ page, usuario }) => {
    await loginUI(page, usuario); // espera POST /auth/login = 200
    await expect(page.getByTestId('project-list')).toBeVisible();
  });

  test('login fallido con contraseña incorrecta', async ({ page, usuario }) => {
    await page.goto('/login');
    await page.getByTestId('login-email-input').fill(usuario.email);
    await page.getByTestId('login-password-input').fill('wrong-password');

    const [res] = await Promise.all([
      page.waitForResponse(
        (r) => r.url().includes('/api/auth/login') && r.request().method() === 'POST'
      ),
      page.getByTestId('login-submit').click(),
    ]);

    expect([400, 401]).toContain(res.status());
    await expect(page.getByTestId('login-page')).toBeVisible();
  });

  
  test('crear proyecto con datos válidos', async ({ page, usuario }) => {
    await loginUI(page, usuario);

    const nombre = `Proyecto Playwright ${Date.now()}`;
    await page.getByTestId('project-name-input').fill(nombre);
    await page.getByTestId('project-description-input').fill('Proyecto de prueba');

    const [res] = await Promise.all([
      page.waitForResponse(
        (r) => r.url().includes('/api/projects') && r.request().method() === 'POST'
      ),
      page.getByTestId('project-create-submit').click(),
    ]);

    expect(res.status()).toBe(201);
    await expect(
      page.getByTestId('project-card-name').filter({ hasText: nombre })
    ).toBeVisible();
  });

  
  test('crear proyecto con nombre vacío debe fallar', async ({ request, usuario }) => {
    const res = await request.post(`${API_URL}/projects`, {
      headers: auth(usuario.token),
      data: { name: '', description: 'Sin nombre' },
    });

    
    expect([400, 422]).toContain(res.status());
  });

  
  test('crear tarea desde el tablero', async ({ page, usuario, proyecto }) => {
    await loginUI(page, usuario);
    await abrirProyecto(page, proyecto.name);

    const titulo = `Tarea E2E ${Date.now()}`;
    await page.getByTestId('task-create-title-input').fill(titulo);
    await page.getByTestId('task-create-description-input').fill('Descripción de la tarea');
    await page.getByTestId('task-create-priority-select').selectOption('HIGH');
    await page.getByTestId('task-create-assignee-select').selectOption({ label: usuario.email });
    await page.getByTestId('task-create-duedate-input').fill('2026-12-31');

    const [res] = await Promise.all([
      page.waitForResponse(
        (r) =>
          r.url().includes('/api/projects/') &&
          r.url().includes('/tasks') &&
          r.request().method() === 'POST'
      ),
      page.getByTestId('task-create-submit').click(),
    ]);

    expect(res.status()).toBe(201);
    await expect(page.getByTestId('task-card-title').filter({ hasText: titulo })).toBeVisible();
  });

  test('crear tarea sin título debe rechazar la validación', async ({
    request,
    usuario,
    proyecto,
  }) => {
    const res = await request.post(`${API_URL}/projects/${proyecto.id}/tasks`, {
      headers: auth(usuario.token),
      data: { title: '', description: 'Tarea inválida' },
    });

    
    expect([400, 422]).toContain(res.status());
  });

  test('editar tarea y agregar etiqueta', async ({ page, usuario, proyecto, tarea }) => {
    await loginUI(page, usuario);
    await abrirProyecto(page, proyecto.name);

    await page.getByTestId('task-card-title').filter({ hasText: tarea.title }).click();
    await expect(page.getByTestId('task-detail-page')).toBeVisible();

    await page.getByTestId('task-title-input').fill('Tarea editada');
    await page.getByTestId('task-priority-select').selectOption('LOW');

    const [saveRes] = await Promise.all([
      page.waitForResponse(
        (r) => r.url().includes('/api/tasks/') && r.request().method() === 'PATCH'
      ),
      page.getByTestId('task-save-button').click(),
    ]);
    expect(saveRes.status()).toBe(200);

    await page.getByTestId('tag-add-input').fill('importante');

    const [tagRes] = await Promise.all([
      page.waitForResponse(
        (r) =>
          r.url().includes('/api/tasks/') &&
          r.url().includes('/tags') &&
          r.request().method() === 'POST'
      ),
      page.getByTestId('tag-add-button').click(),
    ]);
    expect(tagRes.status()).toBe(201);

    await expect(page.getByTestId('tag-list')).toContainText('importante');
  });

  test('agregar comentario en tarea', async ({ page, usuario, proyecto, tarea }) => {
    await loginUI(page, usuario);
    await abrirProyecto(page, proyecto.name);

    await page.getByTestId('task-card-title').filter({ hasText: tarea.title }).click();
    await expect(page.getByTestId('task-detail-page')).toBeVisible();

    await page.getByTestId('comment-add-input').fill('Comentario de prueba');

    const [res] = await Promise.all([
      page.waitForResponse(
        (r) =>
          r.url().includes('/api/tasks/') &&
          r.url().includes('/comments') &&
          r.request().method() === 'POST'
      ),
      page.getByTestId('comment-add-button').click(),
    ]);

    expect(res.status()).toBe(201);
    await expect(page.getByTestId('comment-list')).toContainText('Comentario de prueba');
  });
});