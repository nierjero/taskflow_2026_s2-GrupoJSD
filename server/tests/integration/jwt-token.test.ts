import { describe, expect, it } from '@jest/globals';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { app, auth, registerUser } from '../helpers';

/**
 * Tests de caracterización del manejo de JWT (se escriben ANTES del refactor
 * de la clave JWT, ver CODE_SMELLS.md, smell S1). Fijan el comportamiento
 * observable que el refactor no puede cambiar.
 */
describe('JWT: emisión y verificación de tokens', () => {
  const secret = process.env.JWT_SECRET as string; // lo fija tests/setup.ts

  it('firma el token del login con JWT_SECRET y 24 horas de vida', async () => {
    // Arrange / Act
    const { token, id } = await registerUser('jwt1@test.com');
    const payload = jwt.verify(token, secret) as jwt.JwtPayload;

    // Assert
    expect(payload.email).toBe('jwt1@test.com');
    expect(payload.userId).toBe(Number(id.replace('user-', '')));
    expect((payload.exp as number) - (payload.iat as number)).toBe(24 * 60 * 60);
  });

  it('acepta un token válido en un endpoint protegido', async () => {
    const { token } = await registerUser('jwt2@test.com');

    const res = await request(app).get('/api/projects').set(auth(token));

    expect(res.status).toBe(200);
  });

  it('rechaza un token firmado con otra clave', async () => {
    const forged = jwt.sign({ userId: 1, email: 'x@test.com' }, 'otra-clave');

    const res = await request(app).get('/api/projects').set(auth(forged));

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
    expect(res.body.error.message).toBe('Invalid or expired token');
  });

  it('rechaza un token firmado con la clave de desarrollo por defecto', async () => {
    const forged = jwt.sign({ userId: 1, email: 'x@test.com' }, 'taskflow-dev-secret');

    const res = await request(app).get('/api/projects').set(auth(forged));

    expect(res.status).toBe(401);
  });

  it('rechaza un token vencido', async () => {
    const expired = jwt.sign({ userId: 1, email: 'x@test.com' }, secret, { expiresIn: -10 });

    const res = await request(app).get('/api/projects').set(auth(expired));

    expect(res.status).toBe(401);
    expect(res.body.error.message).toBe('Invalid or expired token');
  });

  it('rechaza una petición sin cabecera Authorization', async () => {
    const res = await request(app).get('/api/projects');

    expect(res.status).toBe(401);
    expect(res.body.error.message).toBe('Authentication required');
  });

  it('rechaza una cabecera Authorization que no es Bearer', async () => {
    const res = await request(app).get('/api/projects').set('Authorization', 'Basic abc');

    expect(res.status).toBe(401);
    expect(res.body.error.message).toBe('Authentication required');
  });
});
