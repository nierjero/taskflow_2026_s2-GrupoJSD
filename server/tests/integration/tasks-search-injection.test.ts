import { describe, expect, it } from '@jest/globals';
import request from 'supertest';
import { app, auth, createProject, createTask, registerUser } from '../helpers';

/**
 * Regresión de SQL injection en la búsqueda por texto (smell S2 de
 * CODE_SMELLS.md). Estos tests FALLABAN con la consulta armada por
 * concatenación de strings ($queryRawUnsafe) y pasan con la consulta
 * parametrizada.
 */
function search(token: string, projectId: string, term: string) {
  return request(app).get(`/api/projects/${projectId}/tasks`).set(auth(token)).query({ search: term });
}

describe('Búsqueda por texto: entradas hostiles', () => {
  it('un payload de inyección no devuelve tareas de proyectos ajenos', async () => {
    const atacante = await registerUser('inj-atacante@test.com');
    const victima = await registerUser('inj-victima@test.com');
    const propio = await createProject(atacante.token, 'Proyecto del atacante');
    const ajeno = await createProject(victima.token, 'Proyecto de la víctima');
    await createTask(atacante.token, propio.id, { title: 'Tarea propia' });
    await createTask(victima.token, ajeno.id, { title: 'Secreto de la víctima' });

    const res = await search(atacante.token, propio.id, "x') > 0) OR (1=1) --");

    expect(res.status).toBe(200);
    expect(JSON.stringify(res.body)).not.toContain('Secreto de la víctima');
    expect(res.body.items).toEqual([]);
  });

  it('encuentra texto con comillas simples como texto literal', async () => {
    const { token } = await registerUser('inj-comilla@test.com');
    const project = await createProject(token, 'Proyecto comillas');
    const brien = await createTask(token, project.id, { title: "Llamar a O'Brien" });
    await createTask(token, project.id, { title: 'Otra tarea' });

    const res = await search(token, project.id, "O'Brien");

    expect(res.status).toBe(200);
    expect(res.body.items.map((t: { id: string }) => t.id)).toEqual([brien.id]);
  });

  it("un intento de borrar la tabla ('; DROP TABLE tasks; --) no rompe ni borra nada", async () => {
    const { token } = await registerUser('inj-drop@test.com');
    const project = await createProject(token, 'Proyecto drop');
    const task = await createTask(token, project.id, { title: 'Tarea que debe sobrevivir' });

    const attack = await search(token, project.id, "'; DROP TABLE tasks; --");
    const after = await request(app).get(`/api/projects/${project.id}/tasks`).set(auth(token));

    expect(attack.status).toBe(200);
    expect(attack.body.items).toEqual([]);
    expect(after.body.items.map((t: { id: string }) => t.id)).toEqual([task.id]);
  });
});
