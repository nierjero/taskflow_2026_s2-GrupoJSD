import { createApp } from './app';
import { getJwtSecret } from './config';

// Falla al arrancar (y no en el primer login) si falta JWT_SECRET en producción.
getJwtSecret();

const PORT = Number(process.env.PORT) || 3000;

createApp().listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`TaskFlow API escuchando en http://localhost:${PORT}/api`);
});
