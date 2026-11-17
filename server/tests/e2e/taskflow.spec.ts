import {
  test,
  expect,
  loginUI,
  abrirProyecto,
  auth,
  API_URL,
} from "./fixtures";

import { BoardPage } from "./pages/BoardPage";
import { TaskCard } from "./components/TaskCard";
import { TaskDetailPage } from "./pages/TaskDetailPage";
test.describe("TaskFlow - E2E", () => {
  test("login exitoso", async ({ page, usuario }) => {
    await loginUI(page, usuario);
    await expect(page.getByTestId("projects-page")).toBeVisible();
    await expect(page.getByTestId("empty-state")).toBeVisible();
  });

  test("login fallido con contraseña incorrecta", async ({ page, usuario }) => {
    await page.goto("/login");
    await page.getByTestId("login-email-input").fill(usuario.email);
    await page.getByTestId("login-password-input").fill("wrong-password");

    const [res] = await Promise.all([
      page.waitForResponse(
        (r) =>
          r.url().includes("/api/auth/login") &&
          r.request().method() === "POST",
      ),
      page.getByTestId("login-submit").click(),
    ]);

    expect([400, 401]).toContain(res.status());
    await expect(page.getByTestId("login-page")).toBeVisible();
  });

  test("crear proyecto con datos válidos", async ({ page, usuario }) => {
    await loginUI(page, usuario);

    const nombre = `Proyecto Playwright ${Date.now()}`;
    await page.getByTestId("project-name-input").fill(nombre);
    await page
      .getByTestId("project-description-input")
      .fill("Proyecto de prueba");

    const [res] = await Promise.all([
      page.waitForResponse(
        (r) =>
          r.url().includes("/api/projects") && r.request().method() === "POST",
      ),
      page.getByTestId("project-create-submit").click(),
    ]);

    expect(res.status()).toBe(201);
    await expect(
      page.getByTestId("project-card-name").filter({ hasText: nombre }),
    ).toBeVisible();
  });

  test("crear proyecto con nombre vacío debe fallar", async ({
    request,
    usuario,
  }) => {
    const res = await request.post(`${API_URL}/projects`, {
      headers: auth(usuario.token),
      data: { name: "", description: "Sin nombre" },
    });

    expect([400, 422]).toContain(res.status());
  });

  test("crear tarea desde el tablero", async ({ page, usuario, proyecto }) => {
    await loginUI(page, usuario);

    const board = new BoardPage(page);
    await board.openProjectByName(proyecto.name);

    const titulo = `Tarea E2E ${Date.now()}`;

    const response = await board.createTask({
      title: titulo,
      description: "Descripción de la tarea",
      priority: "HIGH",
      dueDate: "2026-12-31",
    });

    expect(response.status()).toBe(201);

    const card = new TaskCard(page, titulo);
    await card.expectVisible(titulo);
  });

  test("crear tarea sin título debe rechazar la validación", async ({
    request,
    usuario,
    proyecto,
  }) => {
    const res = await request.post(`${API_URL}/projects/${proyecto.id}/tasks`, {
      headers: auth(usuario.token),
      data: { title: "", description: "Tarea inválida" },
    });

    expect([400, 422]).toContain(res.status());
  });

  test("editar tarea y agregar etiqueta", async ({
    page,
    usuario,
    proyecto,
    tarea,
  }) => {
    await loginUI(page, usuario);

    const board = new BoardPage(page);
    await board.openProjectByName(proyecto.name);

    const card = new TaskCard(page, tarea.title);
    await card.open();

    const detail = new TaskDetailPage(page);
    await detail.waitForLoad();

    const saveResponse = await detail.edit({
      title: "Tarea editada",
      priority: "LOW",
    });

    expect(saveResponse.status()).toBe(200);

    const tagResponse = await detail.addTag("importante");
    expect(tagResponse.status()).toBe(201);
  });

  test("agregar comentario en tarea", async ({
    page,
    usuario,
    proyecto,
    tarea,
  }) => {
    await loginUI(page, usuario);
    await abrirProyecto(page, proyecto.name);

    await page
      .getByTestId("task-card-title")
      .filter({ hasText: tarea.title })
      .click();
    await expect(page.getByTestId("task-detail-page")).toBeVisible();

    await page.getByTestId("comment-add-input").fill("Comentario de prueba");

    const [res] = await Promise.all([
      page.waitForResponse(
        (r) =>
          r.url().includes("/api/tasks/") &&
          r.url().includes("/comments") &&
          r.request().method() === "POST",
      ),
      page.getByTestId("comment-add-button").click(),
    ]);

    expect(res.status()).toBe(201);
    await expect(page.getByTestId("comment-list")).toContainText(
      "Comentario de prueba",
    );
  });
});
