import request from 'supertest';
import { app } from './helpers';

//
describe('Auth', () => {
  it('registra un usuario nuevo', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'ana@test.com', password: 'Password1' });

    expect(res.status).toBe(201);
  });

  it('inicia sesión con credenciales válidas', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'login@test.com', password: 'Password1' });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@test.com', password: 'Password1' });

    expect(res.status).toBe(200);
  });

  it('rechaza el login con contraseña incorrecta', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'wrong@test.com', password: 'Password1' });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'wrong@test.com', password: 'Otracosa9' });

    expect(res.status).toBe(401);
  });

  it('rechaza reutilizar un token de recuperación de contraseña', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'reset-reuse@test.com', password: 'Password1' });

    const forgot = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'reset-reuse@test.com' });

    expect(forgot.status).toBe(200);
    expect(forgot.body.token).toBeDefined();

    const firstReset = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: forgot.body.token, newPassword: 'NewPassword1' });

    expect(firstReset.status).toBe(200);

    const reusedReset = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: forgot.body.token, newPassword: 'AnotherPassword1' });

    expect(reusedReset.status).toBe(400);
  });
});
