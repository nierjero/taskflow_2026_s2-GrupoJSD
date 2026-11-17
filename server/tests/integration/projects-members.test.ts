import { describe, expect, it } from '@jest/globals';
import request from 'supertest';
import { app, auth, createProject, registerUser } from '../helpers';
import { addMember, scenario } from './support';

/** Edición, borrado y miembros de proyectos (projects.controller). */
describe('Editar proyecto', () => {
  it('el owner cambia nombre y descripción', async () => {
    const { owner, project } = await scenario('prj-edit');

    const res = await request(app)
      .patch(`/api/projects/${project.id}`)
      .set(auth(owner.token))
      .send({ name: 'Nombre nuevo', description: 'Descripción nueva' });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ name: 'Nombre nuevo', description: 'Descripción nueva' });
  });

  it('rechaza un nombre demasiado corto', async () => {
    const { owner, project } = await scenario('prj-edit-short');

    const res = await request(app).patch(`/api/projects/${project.id}`).set(auth(owner.token)).send({ name: 'ab' });

    expect(res.status).toBe(400);
  });

  it('rechaza un nombre repetido entre los proyectos del mismo owner', async () => {
    const { owner, project } = await scenario('prj-edit-dup');
    await createProject(owner.token, 'Proyecto repetido');

    const res = await request(app)
      .patch(`/api/projects/${project.id}`)
      .set(auth(owner.token))
      .send({ name: 'Proyecto repetido' });

    expect(res.status).toBe(409);
  });

  it('un miembro que no es owner recibe 403', async () => {
    const { member, project } = await scenario('prj-edit-403');

    const res = await request(app).patch(`/api/projects/${project.id}`).set(auth(member.token)).send({ name: 'Intento' });

    expect(res.status).toBe(403);
    expect(res.body.error.message).toBe('Only the project owner can edit it');
  });

  it('alguien ajeno recibe 404 para no revelar que el proyecto existe', async () => {
    const { outsider, project } = await scenario('prj-edit-404');

    const res = await request(app).patch(`/api/projects/${project.id}`).set(auth(outsider.token)).send({ name: 'Intento' });

    expect(res.status).toBe(404);
  });

  it('responde 404 si el id no es válido', async () => {
    const { owner } = await scenario('prj-edit-badid');

    const res = await request(app).patch('/api/projects/abc').set(auth(owner.token)).send({ name: 'Intento' });

    expect(res.status).toBe(404);
  });
});

describe('Borrar proyecto', () => {
  it('el owner borra el proyecto', async () => {
    const { owner, project } = await scenario('prj-del');

    const res = await request(app).delete(`/api/projects/${project.id}`).set(auth(owner.token));
    const after = await request(app).get(`/api/projects/${project.id}/tasks`).set(auth(owner.token));

    expect(res.status).toBe(204);
    expect(after.status).toBe(404);
  });

  it('un miembro que no es owner recibe 403', async () => {
    const { member, project } = await scenario('prj-del-403');

    const res = await request(app).delete(`/api/projects/${project.id}`).set(auth(member.token));

    expect(res.status).toBe(403);
  });

  it('alguien ajeno recibe 404', async () => {
    const { outsider, project } = await scenario('prj-del-404');

    const res = await request(app).delete(`/api/projects/${project.id}`).set(auth(outsider.token));

    expect(res.status).toBe(404);
  });

  it('responde 404 si el proyecto no existe', async () => {
    const { owner } = await scenario('prj-del-none');

    const res = await request(app).delete('/api/projects/proj-99999').set(auth(owner.token));

    expect(res.status).toBe(404);
  });
});

describe('Miembros del proyecto', () => {
  it('el owner agrega a un usuario registrado como MEMBER', async () => {
    const { owner, project } = await scenario('mbr-add');
    const nuevo = await registerUser('mbr-add-nuevo@test.com');

    const res = await addMember(owner.token, project.id, 'MBR-add-nuevo@test.com');

    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      projectId: project.id,
      userId: nuevo.id,
      email: 'mbr-add-nuevo@test.com',
      role: 'MEMBER',
    });
  });

  it('el proyecto compartido aparece en la lista del nuevo miembro', async () => {
    const { member, project } = await scenario('mbr-list');

    const res = await request(app).get('/api/projects').set(auth(member.token));

    expect(res.body.map((p: { id: string }) => p.id)).toContain(project.id);
  });

  it('rechaza agregar a un usuario que ya es miembro', async () => {
    const { owner, member, project } = await scenario('mbr-dup');

    const res = await addMember(owner.token, project.id, member.email);

    expect(res.status).toBe(409);
  });

  it('rechaza agregar a un usuario que no está registrado', async () => {
    const { owner, project } = await scenario('mbr-unknown');

    const res = await addMember(owner.token, project.id, 'nadie@test.com');

    expect(res.status).toBe(404);
  });

  it('rechaza un email inválido', async () => {
    const { owner, project } = await scenario('mbr-bad-email');

    const res = await addMember(owner.token, project.id, 'no-es-un-email');

    expect(res.status).toBe(400);
  });

  it('un miembro que no es owner no puede agregar miembros', async () => {
    const { member, project } = await scenario('mbr-add-403');
    await registerUser('mbr-add-403-otro@test.com');

    const res = await addMember(member.token, project.id, 'mbr-add-403-otro@test.com');

    expect(res.status).toBe(403);
  });

  it('el owner quita a un miembro', async () => {
    const { owner, member, project } = await scenario('mbr-remove');

    const res = await request(app).delete(`/api/projects/${project.id}/members/${member.id}`).set(auth(owner.token));
    const after = await request(app).get(`/api/projects/${project.id}/tasks`).set(auth(member.token));

    expect(res.status).toBe(204);
    expect(after.status).toBe(403);
  });

  it('no se puede quitar al owner del proyecto', async () => {
    const { owner, project } = await scenario('mbr-remove-owner');

    const res = await request(app).delete(`/api/projects/${project.id}/members/${owner.id}`).set(auth(owner.token));

    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe('The project owner cannot be removed from the project');
  });

  it('responde 404 al quitar a alguien que no es miembro', async () => {
    const { owner, outsider, project } = await scenario('mbr-remove-404');

    const res = await request(app).delete(`/api/projects/${project.id}/members/${outsider.id}`).set(auth(owner.token));

    expect(res.status).toBe(404);
  });

  it('un miembro que no es owner no puede quitar miembros', async () => {
    const { owner, member, project } = await scenario('mbr-remove-403');

    const res = await request(app).delete(`/api/projects/${project.id}/members/${owner.id}`).set(auth(member.token));

    expect(res.status).toBe(403);
  });

  it('responde 404 si los ids no son válidos', async () => {
    const { owner, project } = await scenario('mbr-remove-badid');

    const res = await request(app).delete(`/api/projects/${project.id}/members/abc`).set(auth(owner.token));

    expect(res.status).toBe(404);
  });
});
