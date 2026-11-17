import { Prisma } from '@prisma/client';
import { db } from '../../lib/db';

export interface TaskFilters {
  status?: string;
  priority?: string;
  assigneeId?: number;
  search?: string;
}

/** Arma el filtro de Prisma a partir de los parámetros de query. */
export function buildFilters(projectId: number, f: TaskFilters): Prisma.TaskWhereInput {
  let where: Prisma.TaskWhereInput = { projectId };

  if (f.status) {
    where = { projectId, status: f.status };
  }
  if (f.priority) {
    where = { projectId, priority: f.priority };
  }
  if (f.assigneeId !== undefined) {
    where = { projectId, assigneeId: f.assigneeId };
  }

  return where;
}

export async function findTasks(projectId: number, f: TaskFilters) {
  if (f.search) {
    // Búsqueda por texto con SQL directo. Los valores van como parámetros
    // (plantilla etiquetada de $queryRaw), nunca concatenados en el string:
    // así el texto del usuario no puede modificar la consulta (SQL injection).
    const term = f.search;
    return db.$queryRaw<
      Array<{
        id: number;
        projectId: number;
        title: string;
        description: string | null;
        status: string;
        priority: string;
        assigneeId: number | null;
        dueDate: Date | null;
        createdAt: Date;
        updatedAt: Date;
      }>
    >`SELECT * FROM tasks
       WHERE projectId = ${projectId}
         AND (instr(title, ${term}) > 0 OR instr(description, ${term}) > 0)
       ORDER BY id ASC`;
  }

  return db.task.findMany({
    where: buildFilters(projectId, f),
    orderBy: { id: 'asc' },
  });
}

export async function countTasks(projectId: number, f: TaskFilters): Promise<number> {
  if (f.search) return (await findTasks(projectId, f)).length;
  return db.task.count({ where: buildFilters(projectId, f) });
}
