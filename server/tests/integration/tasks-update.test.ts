import { describe, expect, it } from '@jest/globals';
import request from 'supertest';
import { app, auth } from '../helpers';
import { patchTask, scenario } from './support';

/**
 * Tests de caracterización de PATCH /api/tasks/:taskId (service.updateTask).
 * Se escriben ANTES del refactor "Extract Method" de updateTask (smell S3 de
 * CODE_SMELLS.md) y deben pasar igual antes y después.
 */
describe('Actualizar tarea: validaciones de campos', () => {
  it('actualiza título, descripción y prioridad', async () => {
    const { owner, task } = await scenario('upd-fields');

    const res = await patchTask(owner.token, task.id, {
      title: 'Título nuevo',
      description: 'Otra descripción',
      priority: 'HIGH',
    });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: task.id,
      title: 'Título nuevo',
      description: 'Otra descripción',
      priority: 'HIGH',
    });
  });

  it('con un body vacío devuelve la tarea sin cambios', async () => {
    const { owner, task } = await scenario('upd-empty');

    const res = await patchTask(owner.token, task.id, {});

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Tarea base');
    expect(res.body.updatedAt).toBe(task.updatedAt);
  });

  it.each([
    ['título demasiado corto', { title: 'ab' }],
    ['título que no es texto', { title: 123 }],
    ['descripción de más de 500 caracteres', { description: 'x'.repeat(501) }],
    ['descripción que no es texto', { description: 42 }],
    ['prioridad inexistente', { priority: 'URGENT' }],
    ['fecha con formato inválido', { dueDate: '31/12/2026' }],
    ['estado inexistente', { status: 'ARCHIVED' }],
  ])('rechaza con 400: %s', async (_caso, body) => {
    const { owner, task } = await scenario('upd-invalid');

    const res = await patchTask(owner.token, task.id, body);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('permite borrar la descripción con null', async () => {
    const { owner, task } = await scenario('upd-desc-null');

    const res = await patchTask(owner.token, task.id, { description: null });

    expect(res.status).toBe(200);
    expect(res.body.description).toBeNull();
  });

  it('acepta una fecha de vencimiento válida y permite quitarla con null', async () => {
    const { owner, task } = await scenario('upd-due');

    const set = await patchTask(owner.token, task.id, { dueDate: '2026-12-31' });
    const cleared = await patchTask(owner.token, task.id, { dueDate: null });

    expect(set.status).toBe(200);
    expect(set.body.dueDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(cleared.status).toBe(200);
    expect(cleared.body.dueDate).toBeNull();
  });

  it('responde 404 si la tarea no existe', async () => {
    const { owner } = await scenario('upd-404');

    const res = await patchTask(owner.token, 'task-99999', { title: 'Nuevo título' });

    expect(res.status).toBe(404);
  });

  it('responde 404 si el id de la tarea no es válido', async () => {
    const { owner } = await scenario('upd-badid');

    const res = await patchTask(owner.token, 'abc', { title: 'Nuevo título' });

    expect(res.status).toBe(404);
  });
});

describe('Actualizar tarea: asignado', () => {
  it('asigna la tarea a un miembro del proyecto', async () => {
    const { owner, member, task } = await scenario('upd-assign');

    const res = await patchTask(owner.token, task.id, { assigneeId: member.id });

    expect(res.status).toBe(200);
    expect(res.body.assigneeId).toBe(member.id);
  });

  it('quita el asignado con null', async () => {
    const { owner, member, task } = await scenario('upd-unassign');
    await patchTask(owner.token, task.id, { assigneeId: member.id });

    const res = await patchTask(owner.token, task.id, { assigneeId: null });

    expect(res.status).toBe(200);
    expect(res.body.assigneeId).toBeNull();
  });

  it('rechaza asignar a alguien que no es miembro del proyecto', async () => {
    const { owner, outsider, task } = await scenario('upd-assign-out');

    const res = await patchTask(owner.token, task.id, { assigneeId: outsider.id });

    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe('The assignee must be a member of the project');
  });

  it('rechaza un id de asignado inválido', async () => {
    const { owner, task } = await scenario('upd-assign-bad');

    const res = await patchTask(owner.token, task.id, { assigneeId: 'nadie' });

    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe('assigneeId must be a valid user id');
  });
});

describe('Actualizar tarea: cambios de estado', () => {
  it('el asignado puede pasar la tarea de TODO a IN_PROGRESS y queda en el historial', async () => {
    const { owner, member, task } = await scenario('upd-st-assignee');
    await patchTask(owner.token, task.id, { assigneeId: member.id });

    const res = await patchTask(member.token, task.id, { status: 'IN_PROGRESS' });
    const history = await request(app).get(`/api/tasks/${task.id}/history`).set(auth(member.token));

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('IN_PROGRESS');
    expect(history.body.map((h: { fromStatus: string | null; toStatus: string }) => [h.fromStatus, h.toStatus])).toEqual([
      [null, 'TODO'],
      ['TODO', 'IN_PROGRESS'],
    ]);
    expect(history.body[1].changedBy).toBe(member.id);
  });

  it('el owner del proyecto puede cambiar el estado aunque no sea el asignado', async () => {
    const { owner, member, task } = await scenario('upd-st-owner');
    await patchTask(owner.token, task.id, { assigneeId: member.id });

    const res = await patchTask(owner.token, task.id, { status: 'IN_PROGRESS' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('IN_PROGRESS');
  });

  it('un miembro común que no es el asignado no puede cambiar el estado', async () => {
    const { member, task } = await scenario('upd-st-member');

    const res = await patchTask(member.token, task.id, { status: 'IN_PROGRESS' });

    expect(res.status).toBe(403);
    expect(res.body.error.message).toBe('Only the assignee or a project admin can change the status');
  });

  it('para quien no es asignado ni admin, el permiso se evalúa antes que la transición', async () => {
    const { owner, member, task } = await scenario('upd-st-order');
    await patchTask(owner.token, task.id, { status: 'IN_PROGRESS' });
    await patchTask(owner.token, task.id, { status: 'DONE' });

    // DONE -> TODO es una transición inválida, pero primero se rechaza por permisos.
    const res = await patchTask(member.token, task.id, { status: 'TODO' });

    expect(res.status).toBe(403);
  });

  it('el asignado que pide una transición inválida recibe 422', async () => {
    const { owner, member, task } = await scenario('upd-st-assignee-invalid');
    await patchTask(owner.token, task.id, { assigneeId: member.id });
    await patchTask(member.token, task.id, { status: 'IN_PROGRESS' });
    await patchTask(member.token, task.id, { status: 'DONE' });

    const res = await patchTask(member.token, task.id, { status: 'IN_PROGRESS' });

    expect(res.status).toBe(422);
  });

  it('con varios campos inválidos informa el primero en el orden título, prioridad, fecha, asignado, estado', async () => {
    const { owner, task } = await scenario('upd-order');

    const res = await patchTask(owner.token, task.id, {
      status: 'ARCHIVED',
      assigneeId: 'nadie',
      dueDate: 'mañana',
      priority: 'URGENT',
    });

    expect(res.status).toBe(400);
    expect(res.body.error.message).toMatch(/^Priority must be one of/);
  });

  it('alguien ajeno al proyecto no puede cambiar el estado', async () => {
    const { outsider, task } = await scenario('upd-st-outsider');

    const res = await patchTask(outsider.token, task.id, { status: 'IN_PROGRESS' });

    expect(res.status).toBe(403);
  });

  it('completa el flujo TODO -> IN_PROGRESS -> DONE', async () => {
    const { owner, task } = await scenario('upd-st-flow');

    await patchTask(owner.token, task.id, { status: 'IN_PROGRESS' });
    const res = await patchTask(owner.token, task.id, { status: 'DONE' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('DONE');
  });

  it('permite volver de IN_PROGRESS a TODO', async () => {
    const { owner, task } = await scenario('upd-st-back');
    await patchTask(owner.token, task.id, { status: 'IN_PROGRESS' });

    const res = await patchTask(owner.token, task.id, { status: 'TODO' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('TODO');
  });

  it('rechaza reabrir una tarea terminada (DONE -> TODO) con 422', async () => {
    const { owner, task } = await scenario('upd-st-reopen');
    await patchTask(owner.token, task.id, { status: 'IN_PROGRESS' });
    await patchTask(owner.token, task.id, { status: 'DONE' });

    const res = await patchTask(owner.token, task.id, { status: 'TODO' });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('INVALID_TRANSITION');
    expect(res.body.error.message).toBe('Cannot move a task from DONE to TODO');
  });

  it('pedir el mismo estado no cambia nada ni agrega historial', async () => {
    const { owner, task } = await scenario('upd-st-same');

    const res = await patchTask(owner.token, task.id, { status: 'TODO' });
    const history = await request(app).get(`/api/tasks/${task.id}/history`).set(auth(owner.token));

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('TODO');
    expect(history.body).toHaveLength(1);
  });

  it('aplica a la vez varios campos y el cambio de estado', async () => {
    const { owner, task } = await scenario('upd-st-combo');

    const res = await patchTask(owner.token, task.id, {
      title: 'Todo junto',
      priority: 'CRITICAL',
      status: 'IN_PROGRESS',
    });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ title: 'Todo junto', priority: 'CRITICAL', status: 'IN_PROGRESS' });
  });
});
