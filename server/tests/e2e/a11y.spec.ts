import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import { API_URL, abrirProyecto, auth, expect, loginUI, test } from './fixtures';

const ruleToVerify = process.env.A11Y_VERIFY_RULE;
const viewsToVerify = new Set(
  (process.env.A11Y_VERIFY_VIEWS ?? '')
    .split(',')
    .map((view) => view.trim())
    .filter(Boolean),
);

async function audit(page: Page, view: string) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  console.log(`\n=== ${view}: ${results.violations.length} regla(s) violada(s) ===`);

  for (const violation of results.violations) {
    const wcag = violation.tags.filter((tag) => tag.startsWith('wcag'));
    console.log(`[${violation.impact ?? 'sin impacto'}] ${violation.id} — ${violation.help}`);
    console.log(`Criterios/tags WCAG: ${wcag.join(', ')}`);

    for (const node of violation.nodes) {
      console.log(`  · ${node.target.join(', ')}`);
    }
  }

  if (ruleToVerify && viewsToVerify.has(view)) {
    const remaining = results.violations.filter(
      (violation) => violation.id === ruleToVerify,
    );

    expect(
      remaining,
      `La regla "${ruleToVerify}" todavía aparece en "${view}"`,
    ).toHaveLength(0);
  }
}

test('axe: Login', async ({ page }) => {
  await page.goto('/login');
  await audit(page, 'Login');
});

test('axe: Registro', async ({ page }) => {
  await page.goto('/login');
  await page.getByTestId('login-mode-toggle').click();
  await audit(page, 'Registro');
});

test('axe: Proyectos', async ({ page, usuario }) => {
  await loginUI(page, usuario);
  await audit(page, 'Proyectos');
});

test('axe: Tablero', async ({ page, usuario, proyecto }) => {
  await loginUI(page, usuario);
  await abrirProyecto(page, proyecto.name);
  await audit(page, 'Tablero');
});

test('axe: Detalle de tarea', async ({ page, request, usuario, proyecto, tarea }) => {
  // Agrega una etiqueta de prueba para que también se audite el botón de quitarla.
  const tagResponse = await request.post(`${API_URL}/tasks/${tarea.id}/tags`, {
    headers: auth(usuario.token),
    data: { name: 'Etiqueta de prueba axe' },
  });
  expect(tagResponse.status(), await tagResponse.text()).toBe(201);

  await loginUI(page, usuario);
  await page.goto(`/projects/${proyecto.id}/tasks/${tarea.id}`);
  await expect(page.getByTestId('task-detail-page')).toBeVisible();
  await audit(page, 'Detalle de tarea');
});
