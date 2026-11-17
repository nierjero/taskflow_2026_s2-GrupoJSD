import { afterEach, describe, expect, it } from '@jest/globals';
import { getJwtSecret } from '../../src/config';

describe('config.getJwtSecret', () => {
  const originalSecret = process.env.JWT_SECRET;
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    if (originalSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = originalSecret;
    process.env.NODE_ENV = originalEnv;
  });

  it('usa JWT_SECRET cuando está definida', () => {
    process.env.JWT_SECRET = 'clave-del-entorno';

    expect(getJwtSecret()).toBe('clave-del-entorno');
  });

  it('usa la clave de desarrollo si falta JWT_SECRET fuera de producción', () => {
    delete process.env.JWT_SECRET;
    process.env.NODE_ENV = 'development';

    expect(getJwtSecret()).toBe('taskflow-dev-secret');
  });

  it('trata una JWT_SECRET vacía como no definida', () => {
    process.env.JWT_SECRET = '';
    process.env.NODE_ENV = 'test';

    expect(getJwtSecret()).toBe('taskflow-dev-secret');
  });

  it('en producción falla si falta JWT_SECRET', () => {
    delete process.env.JWT_SECRET;
    process.env.NODE_ENV = 'production';

    expect(() => getJwtSecret()).toThrow('JWT_SECRET must be set');
  });

  it('en producción usa JWT_SECRET si está definida', () => {
    process.env.JWT_SECRET = 'clave-de-produccion';
    process.env.NODE_ENV = 'production';

    expect(getJwtSecret()).toBe('clave-de-produccion');
  });
});
