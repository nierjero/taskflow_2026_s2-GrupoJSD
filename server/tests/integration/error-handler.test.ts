import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import request from 'supertest';
import { app } from '../helpers';

/**
 * Caracteriza el manejador de errores (smell S4 de CODE_SMELLS.md): ante un
 * error inesperado el cliente recibe un mensaje genérico, sin detalles
 * internos. El detalle crudo solo va al log del servidor.
 */
describe('Manejador de errores', () => {
  let logged: jest.SpiedFunction<typeof console.error>;

  beforeEach(() => {
    logged = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    logged.mockRestore();
  });

  it('responde 404 con el formato de error para un endpoint inexistente', async () => {
    const res = await request(app).get('/api/no-existe');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      error: { code: 'NOT_FOUND', message: 'Endpoint not found', details: [] },
    });
  });

  it('no expone el error crudo al cliente ante un fallo inesperado', async () => {
    // Un JSON mal formado hace fallar el parser antes de llegar a las rutas.
    const res = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send('{"email": ');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      error: { code: 'INTERNAL', message: 'Unexpected server error', details: [] },
    });
    expect(JSON.stringify(res.body)).not.toMatch(/SyntaxError|JSON|at .*\.js|stack/i);
    expect(logged).toHaveBeenCalledTimes(1);
  });
});
