import { test as base, expect, type Page } from '@playwright/test';

export const API_URL = process.env.API_URL ?? 'http://localhost:5173/api';
export const PASSWORD = 'Password1';

export type Usuario = { email: string; password: string; token: string };
export type Proyecto = { id: string; name: string };
export type Tarea = { id: string; title: string };

const unico = () => `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
export const auth = (token: string) => ({ Authorization: `Bearer ${token}` });

export const test = base.extend<{
  usuario: Usuario;
  proyecto: Proyecto;
  tarea: Tarea;
}>({
  usuario: async ({ request }, use) => {
    const email = `e2e-${unico()}@test.com`;

    const reg = await request.post(`${API_URL}/auth/register`, {
      data: { email, password: PASSWORD },
    });
    expect(reg.ok(), `register falló: ${reg.status()} ${await reg.text()}`).toBeTruthy();

    const login = await request.post(`${API_URL}/auth/login`, {
      data: { email, password: PASSWORD },
    });
    expect(login.ok(), `login API falló: ${login.status()} ${await login.text()}`).toBeTruthy();
    const body = await login.json();

    await use({ email, password: PASSWORD, token: body.token ?? body.accessToken });
  },

  proyecto: async ({ request, usuario }, use) => {
    const name = `Proyecto ${unico()}`;
    const res = await request.post(`${API_URL}/projects`, {
      headers: auth(usuario.token),
      data: { name, description: 'Proyecto de prueba E2E' },
    });
    expect(res.status(), `crear proyecto: ${await res.text()}`).toBe(201);
    const body = await res.json();
    const p = body.project ?? body;
    await use({ id: p.id, name });
  },

  tarea: async ({ request, usuario, proyecto }, use) => {
    const title = `Tarea ${unico()}`;
    const res = await request.post(`${API_URL}/projects/${proyecto.id}/tasks`, {
      headers: auth(usuario.token),
      data: { title, description: 'Tarea de prueba E2E', priority: 'MEDIUM' },
    });
    expect(res.status(), `crear tarea: ${await res.text()}`).toBe(201);
    const body = await res.json();
    const t = body.task ?? body;
    await use({ id: t.id, title });
  },
});

export { expect };

export async function loginUI(page: Page, usuario: Pick<Usuario, 'email' | 'password'>) {
  await page.goto('/login');
  await expect(page.getByTestId('login-page')).toBeVisible();
  await page.getByTestId('login-email-input').fill(usuario.email);
  await page.getByTestId('login-password-input').fill(usuario.password);

  const [res] = await Promise.all([
    page.waitForResponse(
      (r) => r.url().includes('/api/auth/login') && r.request().method() === 'POST'
    ),
    page.getByTestId('login-submit').click(),
  ]);
  expect(res.status()).toBe(200);
  await expect(page.getByTestId('projects-page')).toBeVisible();
}

export async function abrirProyecto(page: Page, nombre: string) {
  await page.getByTestId('project-card-name').filter({ hasText: nombre }).click();
  await expect(page.getByTestId('board-page')).toBeVisible();
}
