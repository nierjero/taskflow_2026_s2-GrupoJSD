import { describe, expect, it } from '@jest/globals';
import request from 'supertest';
import { app, auth, registerUser } from '../helpers';
import { scenario } from './support';

/** Middleware de membresía: requireProjectMember y requireTaskProjectMember. */
describe('Acceso a recursos de un proyecto', () => {
  it('un miembro puede listar las tareas del proyecto', async () => {
    const { member, project } = await scenario('mem-ok');

    const res = await request(app).get(`/api/projects/${project.id}/tasks`).set(auth(member.token));

    expect(res.status).toBe(200);
  });

  it('un ajeno recibe 403 al listar las tareas del proyecto', async () => {
    const { outsider, project } = await scenario('mem-403');

    const res = await request(app).get(`/api/projects/${project.id}/tasks`).set(auth(outsider.token));

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('un ajeno recibe 403 al crear una tarea en el proyecto', async () => {
    const { outsider, project } = await scenario('mem-403-create');

    const res = await request(app)
      .post(`/api/projects/${project.id}/tasks`)
      .set(auth(outsider.token))
      .send({ title: 'Tarea ajena' });

    expect(res.status).toBe(403);
  });

  it('responde 404 si el proyecto no existe', async () => {
    const { token } = await registerUser('mem-404@test.com');

    const res = await request(app).get('/api/projects/proj-99999/tasks').set(auth(token));

    expect(res.status).toBe(404);
    expect(res.body.error.message).toBe('Project not found');
  });

  it('responde 404 si el id del proyecto no es válido', async () => {
    const { token } = await registerUser('mem-badid@test.com');

    const res = await request(app).get('/api/projects/abc/tasks').set(auth(token));

    expect(res.status).toBe(404);
  });

  it('exige autenticación para acceder a las tareas de un proyecto', async () => {
    const { project } = await scenario('mem-401');

    const res = await request(app).get(`/api/projects/${project.id}/tasks`);

    expect(res.status).toBe(401);
  });
});
