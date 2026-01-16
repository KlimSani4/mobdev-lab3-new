/**
 * seed.ts - Заполнение базы данных начальными данными
 *
 * Запуск: npm run db:seed
 * Создаёт тестовых пользователей и задачи для разработки
 *
 * ТЕСТОВЫЕ ДАННЫЕ ДЛЯ ВХОДА:
 * - Телефон: +79991234567, Пароль: password
 * - Телефон: +79997654321, Пароль: password
 * - Телефон: +79995551234, Пароль: password
 */

import { PrismaClient, Category, TaskStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Начинаем заполнение базы данных...');

  // Хешируем пароль для тестовых пользователей
  const passwordHash = await bcrypt.hash('password', 10);

  // Очищаем существующие данные
  await prisma.response.deleteMany();
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();

  // Создаём пользователей с паролями
  const users = await Promise.all([
    prisma.user.create({
      data: {
        phone: '+79991234567',
        name: 'Иван Иванов',
        password: passwordHash,
        karma: 150,
        level: 'Сосед',
      },
    }),
    prisma.user.create({
      data: {
        phone: '+79997654321',
        name: 'Мария Петрова',
        password: passwordHash,
        karma: 350,
        level: 'Добряк',
      },
    }),
    prisma.user.create({
      data: {
        phone: '+79995551234',
        name: 'Алексей Сидоров',
        password: passwordHash,
        karma: 25,
        level: 'Новичок',
      },
    }),
  ]);

  console.log(`✅ Создано ${users.length} пользователей`);

  // Создаём задачи
  const tasks = await Promise.all([
    prisma.task.create({
      data: {
        title: 'Починить кран на кухне',
        description: 'Течёт кран на кухне, нужна помощь сантехника или того, кто умеет чинить. Инструменты есть.',
        category: Category.REPAIR,
        status: TaskStatus.OPEN,
        reward: 500,
        authorId: users[0].id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Выгулять собаку',
        description: 'Уезжаю на выходные, нужен кто-то кто сможет выгулять собаку 2 раза в день. Порода - лабрадор, добрый.',
        category: Category.PETS,
        status: TaskStatus.OPEN,
        authorId: users[1].id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Забрать посылку с почты',
        description: 'Не могу сам дойти до почты - болею. Нужно забрать посылку, почта в соседнем доме.',
        category: Category.DELIVERY,
        status: TaskStatus.IN_PROGRESS,
        reward: 200,
        authorId: users[2].id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Помочь собрать шкаф IKEA',
        description: 'Купил шкаф в IKEA, нужна помощь в сборке. Займёт примерно 2 часа. Угощу пиццей!',
        category: Category.OTHER,
        status: TaskStatus.OPEN,
        authorId: users[0].id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Полить цветы',
        description: 'Уезжаю в отпуск на неделю. Нужно полить цветы 2 раза - в среду и субботу. Ключи оставлю.',
        category: Category.OTHER,
        status: TaskStatus.OPEN,
        authorId: users[1].id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Повесить карниз',
        description: 'Нужно повесить карниз для штор в спальне. Есть дрель и дюбели.',
        category: Category.REPAIR,
        status: TaskStatus.COMPLETED,
        reward: 300,
        authorId: users[2].id,
      },
    }),
  ]);

  console.log(`✅ Создано ${tasks.length} задач`);

  // Создаём отклики
  const responses = await Promise.all([
    prisma.response.create({
      data: {
        taskId: tasks[0].id,
        userId: users[1].id,
        message: 'Могу помочь! Есть опыт сантехнических работ.',
      },
    }),
    prisma.response.create({
      data: {
        taskId: tasks[2].id,
        userId: users[0].id,
        message: 'Схожу на почту, мне по пути.',
        status: 'ACCEPTED',
      },
    }),
  ]);

  console.log(`✅ Создано ${responses.length} откликов`);

  console.log('🎉 База данных успешно заполнена!');
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
