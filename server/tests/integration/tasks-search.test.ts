import { describe, expect, it } from '@jest/globals';
import request from 'supertest';
import { app, auth, createProject, createTask, registerUser } from '../helpers';

/**
 * Tests de caracterización del listado de tareas, en particular de la
 * búsqueda por texto (tasks.repository.findTasks), que se escriben ANTES de
 * pasar la consulta SQL a parámetros (smell S2 de CODE_SMELLS.md).
 */
async function projectWithTasks(tag: string) {
  const { token } = await registerUser(`${tag}@test.com`);
  const project = await createProject(token, `Proyecto ${tag}`);
  const pan = await createTask(token, project.id, { title: 'Comprar pan', priority: 'LOW' });
  const luz = await createTask(token, project.id, {
    title: 'Pagar la luz',
    description: 'Vence con el pan de mañana',
    priority: 'HIGH',
  });
  const gas = await createTask(token, project.id, { title: 'Cambiar garrafa', priority: 'HIGH' });
  return { token, project, pan, luz, gas };
}

function list(token: string, projectId: string, query: Record<string, string>) {
  return request(app).get(`/api/projects/${projectId}/tasks`).set(auth(token)).query(query);
}

describe('Listado de tareas por proyecto', () => {
  it('lista todas las tareas en orden de creación con la forma paginada', async () => {
    const { token, project, pan, luz, gas } = await projectWithTasks('list-all');

    const res = await list(token, project.id, {});

    expect(res.status).toBe(200);
    expect(res.body.items.map((t: { id: string }) => t.id)).toEqual([pan.id, luz.id, gas.id]);
    expect(res.body).toMatchObject({ total: 3, limit: 20, offset: 0 });
    expect(res.body.items[0]).toMatchObject({ assignee: null, commentCount: 0 });
  });

  it('filtra por prioridad', async () => {
    const { token, project, luz, gas } = await projectWithTasks('list-prio');

    const res = await list(token, project.id, { priority: 'HIGH' });

    expect(res.body.items.map((t: { id: string }) => t.id)).toEqual([luz.id, gas.id]);
  });

  it('filtra por asignado e informa el email del asignado', async () => {
    const { token, project, pan } = await projectWithTasks('list-assignee');
    const me = await request(app).get('/api/projects').set(auth(token));
    const ownerId = me.body[0].ownerId as string;
    await request(app).patch(`/api/tasks/${pan.id}`).set(auth(token)).send({ assigneeId: ownerId });

    const res = await list(token, project.id, { assignedTo: ownerId });

    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0].assignee).toEqual({ id: ownerId, email: 'list-assignee@test.com' });
  });

  it('cuenta los comentarios de cada tarea', async () => {
    const { token, project, pan } = await projectWithTasks('list-comments');
    await request(app).post(`/api/tasks/${pan.id}/comments`).set(auth(token)).send({ body: 'Hola' });

    const res = await list(token, project.id, {});

    expect(res.body.items[0].commentCount).toBe(1);
  });

  it('informa el límite pedido y lo acota a 100', async () => {
    const { token, project } = await projectWithTasks('list-limit');

    const low = await list(token, project.id, { limit: '5' });
    const high = await list(token, project.id, { limit: '500' });

    expect(low.body.limit).toBe(5);
    expect(high.body.limit).toBe(100);
  });
});

describe('Búsqueda por texto', () => {
  it('encuentra tareas por título o por descripción', async () => {
    const { token, project, pan, luz } = await projectWithTasks('search-basic');

    const res = await list(token, project.id, { search: 'pan' });

    expect(res.status).toBe(200);
    expect(res.body.items.map((t: { id: string }) => t.id)).toEqual([pan.id, luz.id]);
    expect(res.body.total).toBe(2);
  });

  it('devuelve las tareas serializadas igual que el listado normal', async () => {
    const { token, project, pan } = await projectWithTasks('search-shape');

    const res = await list(token, project.id, { search: 'Comprar' });

    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0]).toMatchObject({
      id: pan.id,
      projectId: project.id,
      title: 'Comprar pan',
      status: 'TODO',
      priority: 'LOW',
      assignee: null,
      commentCount: 0,
    });
    expect(new Date(res.body.items[0].createdAt).toISOString()).toBe(res.body.items[0].createdAt);
  });

  it('distingue mayúsculas de minúsculas', async () => {
    const { token, project } = await projectWithTasks('search-case');

    const res = await list(token, project.id, { search: 'COMPRAR' });

    expect(res.body.items).toEqual([]);
  });

  it('devuelve una lista vacía si nada coincide', async () => {
    const { token, project } = await projectWithTasks('search-none');

    const res = await list(token, project.id, { search: 'zzz-no-existe' });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ items: [], total: 0 });
  });

  it('solo busca dentro del proyecto consultado', async () => {
    const a = await projectWithTasks('search-scope-a');
    const other = await createProject(a.token, 'Otro proyecto');
    await createTask(a.token, other.id, { title: 'Comprar pan en otro proyecto' });

    const res = await list(a.token, a.project.id, { search: 'Comprar' });

    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0].projectId).toBe(a.project.id);
  });

  it('encuentra texto con caracteres especiales de SQL escritos de forma literal', async () => {
    const { token, project } = await projectWithTasks('search-special');
    const special = await createTask(token, project.id, { title: "Revisar el caso de O'Brien 100%" });

    const res = await list(token, project.id, { search: '100%' });

    expect(res.status).toBe(200);
    expect(res.body.items.map((t: { id: string }) => t.id)).toEqual([special.id]);
  });
});
