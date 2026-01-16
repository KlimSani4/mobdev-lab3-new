/**
 * users.ts - API маршруты для работы с пользователями
 *
 * REST API endpoints:
 * GET    /api/users/:id   - Получить профиль пользователя
 * PATCH  /api/users/:id   - Обновить профиль
 * GET    /api/users/:id/tasks - Задачи пользователя
 * PATCH  /api/users/:id/karma - Изменить карму
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../index.js';
import { z } from 'zod';

// Схема обновления профиля
const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  avatar: z.string().url().optional(),
  phone: z.string().optional(),
});

// Функция расчёта уровня по карме
function getKarmaLevel(karma: number): string {
  if (karma >= 500) return 'Легенда подъезда';
  if (karma >= 200) return 'Добряк';
  if (karma >= 50) return 'Сосед';
  return 'Новичок';
}

export async function userRoutes(server: FastifyInstance) {
  /**
   * GET /api/users/:id - Получить профиль пользователя
   */
  server.get('/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const { id } = request.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        phone: true,
        avatar: true,
        karma: true,
        level: true,
        createdAt: true,
        _count: {
          select: {
            tasks: true,
            responses: true,
          },
        },
      },
    });

    if (!user) {
      return reply.status(404).send({ error: 'Пользователь не найден' });
    }

    return user;
  });

  /**
   * PATCH /api/users/:id - Обновить профиль
   */
  server.patch('/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const { id } = request.params;
      const data = updateUserSchema.parse(request.body);

      const user = await prisma.user.update({
        where: { id },
        data,
        select: {
          id: true,
          name: true,
          phone: true,
          avatar: true,
          karma: true,
          level: true,
        },
      });

      return user;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: error.errors });
      }
      throw error;
    }
  });

  /**
   * GET /api/users/:id/tasks - Задачи пользователя
   */
  server.get('/:id/tasks', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const { id } = request.params;

    const tasks = await prisma.task.findMany({
      where: { authorId: id },
      include: {
        _count: { select: { responses: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return tasks;
  });

  /**
   * PATCH /api/users/:id/karma - Изменить карму
   * Body: { delta: number } - положительное или отрицательное изменение
   */
  server.patch('/:id/karma', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const { id } = request.params;
    const { delta } = request.body as { delta: number };

    if (typeof delta !== 'number') {
      return reply.status(400).send({ error: 'delta должен быть числом' });
    }

    // Получаем текущего пользователя
    const currentUser = await prisma.user.findUnique({ where: { id } });
    if (!currentUser) {
      return reply.status(404).send({ error: 'Пользователь не найден' });
    }

    // Вычисляем новую карму (не меньше 0)
    const newKarma = Math.max(0, currentUser.karma + delta);
    const newLevel = getKarmaLevel(newKarma);

    // Обновляем пользователя
    const user = await prisma.user.update({
      where: { id },
      data: {
        karma: newKarma,
        level: newLevel,
      },
      select: {
        id: true,
        name: true,
        karma: true,
        level: true,
      },
    });

    return user;
  });
}
