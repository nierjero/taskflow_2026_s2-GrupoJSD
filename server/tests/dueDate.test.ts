import { describe, expect, it } from "@jest/globals";
import request from "supertest";
import { app, auth, createProject, registerUser } from "./helpers";

describe("US-16 - Fecha de vencimiento de tarea", () => {
  it("Criterio 1: la fecha es un día calendario sin hora", async () => {
    const { token } = await registerUser("due-date-1@test.com");
    const project = await createProject(token, "Proyecto fecha 1");
    const fecha = "2030-04-17";

    const res = await request(app)
      .post(`/api/projects/${project.id}/tasks`)
      .set(auth(token))
      .send({ title: "Tarea fecha calendario", dueDate: fecha });

    expect(res.status).toBe(201);
    expect(res.body.dueDate).toBe(fecha);
    expect(res.body.dueDate).not.toContain("T");
  });

  it("Criterio 2: devuelve la fecha en formato YYYY-MM-DD", async () => {
    const { token } = await registerUser("due-date-2@test.com");
    const project = await createProject(token, "Proyecto fecha 2");

    const creada = await request(app)
      .post(`/api/projects/${project.id}/tasks`)
      .set(auth(token))
      .send({ title: "Tarea formato fecha" });

    expect(creada.status).toBe(201);

    const fecha = "2030-08-09";

    const res = await request(app)
      .patch(`/api/tasks/${creada.body.id}`)
      .set(auth(token))
      .send({ dueDate: fecha });

    expect(res.status).toBe(200);
    expect(res.body.dueDate).toBe(fecha);
    expect(res.body.dueDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("Criterio 3: conserva el día enviado al consultar la tarea", async () => {
    const { token } = await registerUser("due-date-3@test.com");
    const project = await createProject(token, "Proyecto fecha 3");

    const creada = await request(app)
      .post(`/api/projects/${project.id}/tasks`)
      .set(auth(token))
      .send({ title: "Tarea zona horaria" });

    expect(creada.status).toBe(201);

    const fecha = "2031-01-15";

    const modificacion = await request(app)
      .patch(`/api/tasks/${creada.body.id}`)
      .set(auth(token))
      .send({ dueDate: fecha });

    expect(modificacion.status).toBe(200);

    const consulta = await request(app)
      .get(`/api/projects/${project.id}/tasks`)
      .set(auth(token));

    expect(consulta.status).toBe(200);

    const tarea = consulta.body.items.find(
      (item: { id: string }) => item.id === creada.body.id,
    );

    expect(tarea).toBeDefined();
    expect(tarea.dueDate).toBe(fecha);
  });

  it("Criterio 4: permite crear una tarea sin fecha de vencimiento", async () => {
    const { token } = await registerUser("due-date-4@test.com");
    const project = await createProject(token, "Proyecto fecha 4");

    const res = await request(app)
      .post(`/api/projects/${project.id}/tasks`)
      .set(auth(token))
      .send({ title: "Tarea sin vencimiento" });

    expect(res.status).toBe(201);
    expect(res.body.dueDate).toBeNull();
  });

  it("Criterio 5: permite quitar la fecha enviando null", async () => {
    const { token } = await registerUser("due-date-5@test.com");
    const project = await createProject(token, "Proyecto fecha 5");

    const creada = await request(app)
      .post(`/api/projects/${project.id}/tasks`)
      .set(auth(token))
      .send({
        title: "Tarea con vencimiento",
        dueDate: "2030-05-20",
      });

    expect(creada.status).toBe(201);

    const res = await request(app)
      .patch(`/api/tasks/${creada.body.id}`)
      .set(auth(token))
      .send({ dueDate: null });

    expect(res.status).toBe(200);
    expect(res.body.dueDate).toBeNull();
  });

  it("Criterio 6: devuelve HTTP 400 para una fecha con formato inválido", async () => {
    const { token } = await registerUser("due-date-6@test.com");
    const project = await createProject(token, "Proyecto fecha 6");

    const creada = await request(app)
      .post(`/api/projects/${project.id}/tasks`)
      .set(auth(token))
      .send({ title: "Tarea fecha inválida" });

    expect(creada.status).toBe(201);

    const res = await request(app)
      .patch(`/api/tasks/${creada.body.id}`)
      .set(auth(token))
      .send({ dueDate: "15/09/2030" });

    expect(res.status).toBe(400);
    expect(res.body.mensaje).toBe(
      "dueDate must be a calendar date in YYYY-MM-DD format",
    );
  });

  it("Criterio 7: permite asignar una fecha pasada", async () => {
    const { token } = await registerUser("due-date-7@test.com");
    const project = await createProject(token, "Proyecto fecha 7");

    const res = await request(app)
      .post(`/api/projects/${project.id}/tasks`)
      .set(auth(token))
      .send({
        title: "Tarea vencida",
        dueDate: "2000-01-01",
      });

    expect(res.status).toBe(201);
    expect(res.body.dueDate).toBe("2000-01-01");
  });

  it("Criterio 8: impide que un usuario externo modifique la fecha", async () => {
    const { token: tokenMiembro } = await registerUser(
      "due-date-member@test.com",
    );

    const { token: tokenExterno } = await registerUser(
      "due-date-outsider@test.com",
    );

    const project = await createProject(tokenMiembro, "Proyecto autorización");

    const creada = await request(app)
      .post(`/api/projects/${project.id}/tasks`)
      .set(auth(tokenMiembro))
      .send({ title: "Tarea protegida" });

    expect(creada.status).toBe(201);

    const modificacionMiembro = await request(app)
      .patch(`/api/tasks/${creada.body.id}`)
      .set(auth(tokenMiembro))
      .send({ dueDate: "2030-11-12" });

    expect(modificacionMiembro.status).toBe(200);

    const modificacionExterno = await request(app)
      .patch(`/api/tasks/${creada.body.id}`)
      .set(auth(tokenExterno))
      .send({ dueDate: "2030-11-13" });

    expect(modificacionExterno.status).toBe(403);
  });
});
