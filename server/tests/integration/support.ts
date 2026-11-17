import request from 'supertest';
import { app, auth, createProject, createTask, registerUser } from '../helpers';

/** Agrega a un usuario (por email) como miembro de un proyecto. */
export async function addMember(ownerToken: string, projectId: string, email: string) {
  return request(app)
    .post(`/api/projects/${projectId}/members`)
    .set(auth(ownerToken))
    .send({ email });
}

/**
 * Escenario base: un owner, un miembro común, un proyecto con ambos y una
 * tarea sin asignar creada por el owner. Cada llamada usa emails únicos porque
 * todos los tests de un archivo comparten la misma base SQLite.
 */
let counter = 0;

export async function scenario(tag: string) {
  const uid = `${tag}-${++counter}`;
  const emails = {
    owner: `${uid}-owner@test.com`,
    member: `${uid}-member@test.com`,
    outsider: `${uid}-outsider@test.com`,
  };
  const owner = { ...(await registerUser(emails.owner)), email: emails.owner };
  const member = { ...(await registerUser(emails.member)), email: emails.member };
  const outsider = { ...(await registerUser(emails.outsider)), email: emails.outsider };
  const project = await createProject(owner.token, `Proyecto ${uid}`);
  await addMember(owner.token, project.id, emails.member);
  const task = await createTask(owner.token, project.id, {
    title: 'Tarea base',
    description: 'Descripción base',
    priority: 'LOW',
  });
  return { owner, member, outsider, project, task };
}

export function patchTask(token: string, taskId: string, body: Record<string, unknown>) {
  return request(app).patch(`/api/tasks/${taskId}`).set(auth(token)).send(body);
}
