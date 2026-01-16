/**
 * tasks.ts - API маршруты для работы с задачами
 *
 * REST API endpoints:
 * GET    /api/tasks       - Список всех задач
 * GET    /api/tasks/:id   - Одна задача по ID
 * POST   /api/tasks       - Создание задачи
 * PATCH  /api/tasks/:id   - Обновление задачи
 * DELETE /api/tasks/:id   - Удаление задачи
 * POST   /api/tasks/:id/respond - Откликнуться на задачу
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../index.js';
import { z } from 'zod';

// Схема валидации для создания задачи (Zod)
const createTaskSchema = z.object({
  title: z.string().min(3, 'Название минимум 3 символа'),
  description: z.string().min(10, 'Описание минимум 10 символов'),
  category: z.enum(['REPAIR', 'DELIVERY', 'PETS', 'OTHER']),
  reward: z.number().optional(),
  imageUrl: z.string().url().optional(),
  authorId: z.string().uuid(),
});

// Схема для обновления задачи
const updateTaskSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'COMPLETED']).optional(),
  reward: z.number().optional(),
});

// Схема для query параметров
const querySchema = z.object({
  category: z.enum(['REPAIR', 'DELIVERY', 'PETS', 'OTHER']).optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'COMPLETED']).optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
});

export async function taskRoutes(server: FastifyInstance) {
  /**
   * GET /api/tasks - Получить список задач
   * Query params: category, status, limit, offset
   */
  server.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const query = querySchema.parse(request.query);

      // Формируем условия фильтрации
      const where: any = {};
      if (query.category) where.category = query.category;
      if (query.status) where.status = query.status;

      // Запрос к БД с пагинацией
      const tasks = await prisma.task.findMany({
        where,
        include: {
          author: {
            select: { id: true, name: true, avatar: true, karma: true },
          },
          _count: { select: { responses: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: query.limit,
        skip: query.offset,
      });

      // Общее количество для пагинации
      const total = await prisma.task.count({ where });

      return { tasks, total, limit: query.limit, offset: query.offset };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: error.errors });
      }
      throw error;
    }
  });

  /**
   * GET /api/tasks/:id - Получить задачу по ID
   */
  server.get('/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const { id } = request.params;

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, name: true, avatar: true, karma: true, phone: true },
        },
        responses: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true, karma: true },
            },
          },
        },
      },
    });

    if (!task) {
      return reply.status(404).send({ error: 'Задача не найдена' });
    }

    return task;
  });

  /**
   * POST /api/tasks - Создать новую задачу
   */
  server.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = createTaskSchema.parse(request.body);

      const task = await prisma.task.create({
        data: {
          title: data.title,
          description: data.description,
          category: data.category,
          reward: data.reward,
          imageUrl: data.imageUrl,
          authorId: data.authorId,
        },
        include: {
          author: {
            select: { id: true, name: true, avatar: true },
          },
        },
      });

      return reply.status(201).send(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: error.errors });
      }
      throw error;
    }
  });

  /**
   * PATCH /api/tasks/:id - Обновить задачу
   */
  server.patch('/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const { id } = request.params;
      const data = updateTaskSchema.parse(request.body);

      const task = await prisma.task.update({
        where: { id },
        data,
        include: {
          author: {
            select: { id: true, name: true, avatar: true },
          },
        },
      });

      return task;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: error.errors });
      }
      throw error;
    }
  });

  /**
   * DELETE /api/tasks/:id - Удалить задачу
   */
  server.delete('/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const { id } = request.params;

    await prisma.task.delete({ where: { id } });

    return reply.status(204).send();
  });

  /**
   * POST /api/tasks/:id/respond - Откликнуться на задачу
   */
  server.post('/:id/respond', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const { id } = request.params;
    const { userId, message } = request.body as { userId: string; message?: string };

    // Проверяем, что задача существует и открыта
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      return reply.status(404).send({ error: 'Задача не найдена' });
    }
    if (task.status !== 'OPEN') {
      return reply.status(400).send({ error: 'Задача уже не принимает отклики' });
    }

    // Создаём отклик (upsert чтобы избежать дубликатов)
    const response = await prisma.response.upsert({
      where: {
        taskId_userId: { taskId: id, userId: userId },
      },
      create: {
        taskId: id,
        userId,
        message,
      },
      update: {
        message,
      },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    return reply.status(201).send(response);
  });
}
