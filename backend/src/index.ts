/**
 * index.ts - Точка входа сервера Fastify
 *
 * Fastify - это быстрый веб-фреймворк для Node.js.
 * Здесь настраивается сервер, подключаются плагины и маршруты.
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import { PrismaClient } from '@prisma/client';
import { taskRoutes } from './routes/tasks.js';
import { userRoutes } from './routes/users.js';
import { authRoutes } from './routes/auth.js';

// Создание экземпляра Prisma Client для работы с БД
export const prisma = new PrismaClient();

// Создание экземпляра Fastify с логированием
const server = Fastify({
  logger: true, // Включаем логирование запросов
});

// Настройка CORS для доступа с мобильного приложения
server.register(cors, {
  origin: true, // Разрешаем все origins (для разработки)
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
});

// Регистрация маршрутов API
server.register(taskRoutes, { prefix: '/api/tasks' });
server.register(userRoutes, { prefix: '/api/users' });
server.register(authRoutes, { prefix: '/api/auth' });

// Health check endpoint
server.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Корневой маршрут с информацией об API
server.get('/', async () => {
  return {
    name: 'Neighbors+ API',
    version: '1.0.0',
    endpoints: {
      tasks: '/api/tasks',
      users: '/api/users',
      auth: '/api/auth',
      health: '/health',
    },
  };
});

// Порт сервера из переменной окружения или 3000 по умолчанию
const PORT = parseInt(process.env.PORT || '3000', 10);

// Запуск сервера
const start = async () => {
  try {
    // Подключаемся к БД
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL');

    // Запускаем сервер
    const address = await server.listen({
      port: PORT,
      host: '0.0.0.0', // Слушаем на всех интерфейсах
    });

    console.log(`🚀 Server running at ${address}`);
  } catch (err) {
    server.log.error(err);
    await prisma.$disconnect();
    process.exit(1);
  }
};

// Graceful shutdown - корректное завершение при остановке
const shutdown = async () => {
  console.log('Shutting down...');
  await prisma.$disconnect();
  await server.close();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

start();
