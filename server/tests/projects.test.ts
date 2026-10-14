import { test, expect } from '@playwright/test';
import request from 'supertest';
import { app, auth, registerUser } from './helpers';

test.describe('Proyectos', () => {
  test('crea un proyecto', async () => {
    const { token } = await registerUser('proj1@test.com');

    const res = await request(app)
      .post('/api/projects')
      .set(auth(token))
      .send({ name: 'Mi Proyecto', description: 'Descripción' });

    expect(res.status).toBe(201);
  });

  test('lista los proyectos del usuario', async () => {
    const { token } = await registerUser('proj2@test.com');
    await request(app).post('/api/projects').set(auth(token)).send({ name: 'Proyecto A' });
    await request(app).post('/api/projects').set(auth(token)).send({ name: 'Proyecto B' });

    const res = await request(app).get('/api/projects').set(auth(token));

    expect(res.body).toHaveLength(2);
  });

  test('rechaza crear un proyecto sin autenticación', async () => {
    const res = await request(app).post('/api/projects').send({ name: 'Sin token' });

    expect(res.status).toBe(401);
  });
});