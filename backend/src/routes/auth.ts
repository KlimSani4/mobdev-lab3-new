/**
 * auth.ts - API маршруты для аутентификации
 *
 * Простая аутентификация по номеру телефона.
 * В реальном приложении здесь была бы SMS верификация.
 *
 * POST /api/auth/register - Регистрация нового пользователя
 * POST /api/auth/login    - Вход существующего пользователя
 * GET  /api/auth/me       - Получить текущего пользователя (по токену)
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../index.js';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

// Секретный ключ для JWT (в продакшене брать из env)
const JWT_SECRET = process.env.JWT_SECRET || 'neighbors-plus-secret-key-change-in-production';
const SALT_ROUNDS = 10;

// Схемы валидации
const registerSchema = z.object({
  phone: z.string().min(10, 'Некорректный номер телефона'),
  name: z.string().min(2, 'Имя минимум 2 символа'),
  password: z.string().min(6, 'Пароль минимум 6 символов'),
});

const loginSchema = z.object({
  phone: z.string().min(10),
  password: z.string().min(1),
});

// Генерация JWT токена
function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

// Верификация токена
function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch {
    return null;
  }
}

export async function authRoutes(server: FastifyInstance) {
  /**
   * POST /api/auth/register - Регистрация
   */
  server.post('/register', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = registerSchema.parse(request.body);

      // Проверяем, что телефон не занят
      const existingUser = await prisma.user.findUnique({
        where: { phone: data.phone },
      });

      if (existingUser) {
        return reply.status(400).send({ error: 'Пользователь с таким телефоном уже существует' });
      }

      // Хешируем пароль
      // Примечание: в реальном приложении пароль хранился бы в отдельной таблице
      // Для простоты учебного проекта используем упрощённую схему
      const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

      // Создаём пользователя с хешированным паролем
      const user = await prisma.user.create({
        data: {
          phone: data.phone,
          name: data.name,
          password: hashedPassword,
        },
        select: {
          id: true,
          phone: true,
          name: true,
          karma: true,
          level: true,
          createdAt: true,
        },
      });

      // Генерируем токен
      const token = generateToken(user.id);

      return reply.status(201).send({ user, token });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: error.errors });
      }
      throw error;
    }
  });

  /**
   * POST /api/auth/login - Вход с проверкой пароля
   */
  server.post('/login', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = loginSchema.parse(request.body);

      // Ищем пользователя по телефону (включая пароль для проверки)
      const userWithPassword = await prisma.user.findUnique({
        where: { phone: data.phone },
      });

      if (!userWithPassword) {
        return reply.status(401).send({ error: 'Неверный телефон или пароль' });
      }

      // Проверяем пароль
      const isPasswordValid = await bcrypt.compare(data.password, userWithPassword.password);
      if (!isPasswordValid) {
        return reply.status(401).send({ error: 'Неверный телефон или пароль' });
      }

      // Возвращаем пользователя без пароля
      const user = {
        id: userWithPassword.id,
        phone: userWithPassword.phone,
        name: userWithPassword.name,
        avatar: userWithPassword.avatar,
        karma: userWithPassword.karma,
        level: userWithPassword.level,
        createdAt: userWithPassword.createdAt,
      };

      // Генерируем токен
      const token = generateToken(user.id);

      return { user, token };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: error.errors });
      }
      throw error;
    }
  });

  /**
   * GET /api/auth/me - Получить текущего пользователя
   * Требует Authorization: Bearer <token>
   */
  server.get('/me', async (request: FastifyRequest, reply: FastifyReply) => {
    // Получаем токен из заголовка
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return reply.status(401).send({ error: 'Требуется авторизация' });
    }

    const token = authHeader.slice(7);
    const payload = verifyToken(token);

    if (!payload) {
      return reply.status(401).send({ error: 'Невалидный токен' });
    }

    // Получаем пользователя
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        phone: true,
        name: true,
        avatar: true,
        karma: true,
        level: true,
        createdAt: true,
        _count: {
          select: { tasks: true, responses: true },
        },
      },
    });

    if (!user) {
      return reply.status(404).send({ error: 'Пользователь не найден' });
    }

    return user;
  });
}
