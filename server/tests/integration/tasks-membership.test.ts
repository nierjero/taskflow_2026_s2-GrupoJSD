import { describe, expect, it } from '@jest/globals';
import request from 'supertest';
import { app, auth } from '../helpers';
import { patchTask, scenario } from './support';

describe('Autorización de tareas: pertenencia al proyecto', () => {
  it('impide que un usuario ajeno modifique una tarea y conserva sus datos', async () => {
    const { owner, outsider, task } = await scenario('membership-patch-outsider');

    const denied = await patchTask(outsider.token, task.id, { title: 'Modificación no autorizada' });
    const unchanged = await request(app).get(`/api/tasks/${task.id}`).set(auth(owner.token));

    expect(denied.status).toBe(403);
    expect(unchanged.status).toBe(200);
    expect(unchanged.body.title).toBe('Tarea base');
  });

  it('impide que un usuario ajeno elimine una tarea y conserva el recurso', async () => {
    const { owner, outsider, task } = await scenario('membership-delete-outsider');

    const denied = await request(app).delete(`/api/tasks/${task.id}`).set(auth(outsider.token));
    const stillExists = await request(app).get(`/api/tasks/${task.id}`).set(auth(owner.token));

    expect(denied.status).toBe(403);
    expect(stillExists.status).toBe(200);
    expect(stillExists.body.id).toBe(task.id);
  });

  it('permite que un miembro del proyecto modifique una tarea', async () => {
    const { member, task } = await scenario('membership-patch-member');

    const response = await patchTask(member.token, task.id, { title: 'Título actualizado por miembro' });

    expect(response.status).toBe(200);
    expect(response.body.title).toBe('Título actualizado por miembro');
  });

  it('permite que un miembro del proyecto elimine una tarea', async () => {
    const { member, owner, task } = await scenario('membership-delete-member');

    const deleted = await request(app).delete(`/api/tasks/${task.id}`).set(auth(member.token));
    const missing = await request(app).get(`/api/tasks/${task.id}`).set(auth(owner.token));

    expect(deleted.status).toBe(204);
    expect(missing.status).toBe(404);
  });

  it('mantiene 404 para tareas inexistentes o con identificador inválido', async () => {
    const { owner } = await scenario('membership-not-found');

    const missing = await request(app).delete('/api/tasks/task-99999').set(auth(owner.token));
    const invalid = await request(app).patch('/api/tasks/abc').set(auth(owner.token)).send({ title: 'No existe' });

    expect(missing.status).toBe(404);
    expect(invalid.status).toBe(404);
  });
});
