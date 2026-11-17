import { describe, expect, it } from '@jest/globals';
import request from 'supertest';
import { db } from '../../src/lib/db';
import { app, auth } from '../helpers';
import { scenario } from './support';

/** Detalle, etiquetas, historial y borrado de tareas (tasks.controller / tasks.service). */
describe('Detalle de tarea', () => {
  it('devuelve la tarea con sus etiquetas', async () => {
    const { owner, task } = await scenario('det-get');
    await request(app).post(`/api/tasks/${task.id}/tags`).set(auth(owner.token)).send({ name: 'backend' });

    const res = await request(app).get(`/api/tasks/${task.id}`).set(auth(owner.token));

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: task.id, title: 'Tarea base' });
    expect(res.body.tags).toEqual([expect.objectContaining({ name: 'backend' })]);
  });

  it('responde 404 si la tarea no existe', async () => {
    const { owner } = await scenario('det-404');

    const res = await request(app).get('/api/tasks/task-99999').set(auth(owner.token));

    expect(res.status).toBe(404);
  });

  it('responde 403 a alguien que no es miembro del proyecto', async () => {
    const { outsider, task } = await scenario('det-403');

    const res = await request(app).get(`/api/tasks/${task.id}`).set(auth(outsider.token));

    expect(res.status).toBe(403);
    expect(res.body.error.message).toBe('You are not a member of this project');
  });

  it('responde 404 si el id no es válido', async () => {
    const { owner } = await scenario('det-badid');

    const res = await request(app).get('/api/tasks/abc').set(auth(owner.token));

    expect(res.status).toBe(404);
  });

  it('exige autenticación', async () => {
    const { task } = await scenario('det-401');

    const res = await request(app).get(`/api/tasks/${task.id}`);

    expect(res.status).toBe(401);
  });
});

describe('Etiquetas', () => {
  it('agrega una etiqueta y la reutiliza si ya existe con ese nombre', async () => {
    const { owner, task } = await scenario('tag-add');

    const first = await request(app).post(`/api/tasks/${task.id}/tags`).set(auth(owner.token)).send({ name: 'urgente' });
    const second = await request(app).post(`/api/tasks/${task.id}/tags`).set(auth(owner.token)).send({ name: ' urgente ' });

    expect(first.status).toBe(201);
    expect(first.body.name).toBe('urgente');
    expect(second.body.id).toBe(first.body.id);
  });

  it.each([
    ['vacío', { name: '   ' }],
    ['de más de 30 caracteres', { name: 'x'.repeat(31) }],
    ['que no es texto', { name: 5 }],
    ['ausente', {}],
  ])('rechaza un nombre %s', async (_caso, body) => {
    const { owner, task } = await scenario('tag-invalid');

    const res = await request(app).post(`/api/tasks/${task.id}/tags`).set(auth(owner.token)).send(body);

    expect(res.status).toBe(400);
  });

  it('rechaza la etiqueta número 11 de una tarea', async () => {
    const { owner, task } = await scenario('tag-max');
    for (let i = 1; i <= 10; i++) {
      await request(app).post(`/api/tasks/${task.id}/tags`).set(auth(owner.token)).send({ name: `tag-${i}` });
    }

    const res = await request(app).post(`/api/tasks/${task.id}/tags`).set(auth(owner.token)).send({ name: 'tag-11' });

    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe('A task can have at most 10 tags');
  });

  it('quita una etiqueta de la tarea', async () => {
    const { owner, task } = await scenario('tag-remove');
    const tag = await request(app).post(`/api/tasks/${task.id}/tags`).set(auth(owner.token)).send({ name: 'borrar' });

    const res = await request(app).delete(`/api/tasks/${task.id}/tags/${tag.body.id}`).set(auth(owner.token));
    const detail = await request(app).get(`/api/tasks/${task.id}`).set(auth(owner.token));

    expect(res.status).toBe(204);
    expect(detail.body.tags).toEqual([]);
  });

  it('responde 404 al quitar una etiqueta que la tarea no tiene', async () => {
    const { owner, task } = await scenario('tag-remove-404');

    const res = await request(app).delete(`/api/tasks/${task.id}/tags/tag-99999`).set(auth(owner.token));

    expect(res.status).toBe(404);
    expect(res.body.error.message).toBe('The task does not have that tag');
  });

  it('responde 404 si el id de la etiqueta no es válido', async () => {
    const { owner, task } = await scenario('tag-remove-badid');

    const res = await request(app).delete(`/api/tasks/${task.id}/tags/xyz`).set(auth(owner.token));

    expect(res.status).toBe(404);
  });

  it('un ajeno al proyecto no puede etiquetar', async () => {
    const { outsider, task } = await scenario('tag-403');

    const res = await request(app).post(`/api/tasks/${task.id}/tags`).set(auth(outsider.token)).send({ name: 'x' });

    expect(res.status).toBe(403);
  });
});

describe('Historial', () => {
  it('registra la creación de la tarea', async () => {
    const { owner, task } = await scenario('hist-create');

    const res = await request(app).get(`/api/tasks/${task.id}/history`).set(auth(owner.token));

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toMatchObject({
      taskId: task.id,
      changedBy: owner.id,
      fromStatus: null,
      toStatus: 'TODO',
    });
  });

  it('responde 404 si el id no es válido', async () => {
    const { owner } = await scenario('hist-badid');

    const res = await request(app).get('/api/tasks/abc/history').set(auth(owner.token));

    expect(res.status).toBe(404);
  });
});

describe('Borrado de tareas', () => {
  it('borra la tarea junto con sus comentarios, historial y etiquetas', async () => {
    const { owner, task } = await scenario('del-cascade');
    const taskId = Number(task.id.replace('task-', ''));
    await request(app).post(`/api/tasks/${task.id}/comments`).set(auth(owner.token)).send({ body: 'Comentario' });
    await request(app).post(`/api/tasks/${task.id}/tags`).set(auth(owner.token)).send({ name: 'x' });

    const res = await request(app).delete(`/api/tasks/${task.id}`).set(auth(owner.token));

    expect(res.status).toBe(204);
    expect(await db.task.count({ where: { id: taskId } })).toBe(0);
    expect(await db.comment.count({ where: { taskId } })).toBe(0);
    expect(await db.taskHistory.count({ where: { taskId } })).toBe(0);
    expect(await db.taskTag.count({ where: { taskId } })).toBe(0);
  });

  it('responde 404 si la tarea no existe', async () => {
    const { owner } = await scenario('del-404');

    const res = await request(app).delete('/api/tasks/task-99999').set(auth(owner.token));

    expect(res.status).toBe(404);
  });

  it('responde 404 si el id no es válido', async () => {
    const { owner } = await scenario('del-badid');

    const res = await request(app).delete('/api/tasks/abc').set(auth(owner.token));

    expect(res.status).toBe(404);
  });
});
