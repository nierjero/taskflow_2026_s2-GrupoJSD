/**
 * Configuración leída del entorno. Se consulta en el momento de usarla (no al
 * importar el módulo) para que no dependa del orden en que se cargan los
 * archivos ni de cuándo se carga el .env.
 */

// Solo para desarrollo y tests locales. Nunca debe usarse en producción.
const DEV_JWT_SECRET = 'taskflow-dev-secret';

/**
 * Clave con la que se firman y verifican los JWT.
 * - Si JWT_SECRET está definida, se usa.
 * - Fuera de producción, sin JWT_SECRET, se usa la clave de desarrollo.
 * - En producción, sin JWT_SECRET, falla: es preferible no arrancar a firmar
 *   tokens con una clave pública que cualquiera puede leer en el repositorio.
 */
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set when NODE_ENV=production');
  }
  return DEV_JWT_SECRET;
}
