/**
 * Скрипт для заполнения БД реалистичными данными
 * Запуск: node scripts/seed-data.js
 */

const API_URL = 'http://95.217.198.43:8765/api';

// Реалистичные русские имена
const FIRST_NAMES = [
  'Александр', 'Михаил', 'Дмитрий', 'Андрей', 'Сергей', 'Алексей', 'Николай', 'Иван', 'Максим', 'Евгений',
  'Анна', 'Мария', 'Елена', 'Ольга', 'Наталья', 'Екатерина', 'Татьяна', 'Ирина', 'Светлана', 'Юлия',
  'Артём', 'Владимир', 'Павел', 'Константин', 'Роман', 'Виктор', 'Денис', 'Игорь', 'Олег', 'Вадим',
  'Дарья', 'Полина', 'Кристина', 'Валерия', 'Алина', 'Виктория', 'Марина', 'Людмила', 'Галина', 'Надежда'
];

const LAST_NAMES = [
  'Иванов', 'Петров', 'Сидоров', 'Козлов', 'Новиков', 'Морозов', 'Волков', 'Соколов', 'Лебедев', 'Кузнецов',
  'Попов', 'Смирнов', 'Васильев', 'Павлов', 'Семёнов', 'Голубев', 'Виноградов', 'Богданов', 'Воробьёв', 'Федоров',
  'Михайлов', 'Беляев', 'Тарасов', 'Белов', 'Комаров', 'Орлов', 'Киселёв', 'Макаров', 'Андреев', 'Ковалёв'
];

// Задачи по категориям с реалистичными описаниями
const TASKS_DATA = {
  repair: [
    { title: 'Починить кран на кухне', description: 'Капает кран на кухне, нужна замена прокладки или картриджа. Инструменты есть, нужна помощь с работой.' },
    { title: 'Повесить полку в коридоре', description: 'Купил полку в IKEA, нужно повесить в коридоре. Стена бетонная, нужен перфоратор.' },
    { title: 'Заменить розетку в комнате', description: 'Розетка искрит, нужна замена. Желательно электрик с опытом.' },
    { title: 'Собрать шкаф-купе', description: 'Привезли шкаф, нужна помощь в сборке. Инструкция есть, займёт часа 3-4.' },
    { title: 'Починить дверной замок', description: 'Заедает замок входной двери, ключ проворачивается с трудом.' },
    { title: 'Установить смеситель в ванной', description: 'Купил новый смеситель, старый протекает. Нужна помощь с установкой.' },
    { title: 'Заделать трещину в стене', description: 'Появилась трещина на стене в спальне, нужно заделать и покрасить.' },
    { title: 'Починить стиральную машину', description: 'Стиралка не сливает воду, возможно засор. Нужен кто-то разбирающийся.' },
    { title: 'Поменять лампочки в подъезде', description: 'На нашем этаже перегорели лампочки, УК не реагирует. Нужна лестница.' },
    { title: 'Утеплить окна на зиму', description: 'Дует из окон, нужно заклеить или установить утеплитель.' },
    { title: 'Починить унитаз', description: 'Постоянно течёт вода в унитазе, нужна замена арматуры бачка.' },
    { title: 'Повесить люстру', description: 'Новая люстра, нужно снять старую и повесить новую. Потолок натяжной.' },
    { title: 'Установить кондиционер', description: 'Купил сплит-систему, нужен монтаж. Оплата по договорённости.' },
    { title: 'Отремонтировать балконную дверь', description: 'Дверь на балкон плохо закрывается, перекосилась.' },
    { title: 'Прочистить засор в раковине', description: 'Вода плохо уходит в раковине на кухне, нужна прочистка.' },
  ],
  delivery: [
    { title: 'Забрать продукты из Пятёрочки', description: 'Нужно забрать заказ из магазина на соседней улице. Примерно 2 пакета.' },
    { title: 'Доставить документы в МФЦ', description: 'Нужно отвезти пакет документов в МФЦ на Ленина. Срочно, до 17:00.' },
    { title: 'Забрать посылку с почты', description: 'Пришла посылка, не могу забрать сам. Почта на Пушкина 15.' },
    { title: 'Купить лекарства в аптеке', description: 'Заболел, нужны лекарства из аптеки. Список отправлю, деньги переведу заранее.' },
    { title: 'Отвезти вещи в химчистку', description: 'Нужно отвезти пальто и костюм в химчистку на Мира. Заберу сам потом.' },
    { title: 'Забрать заказ из пункта выдачи', description: 'Заказ в Wildberries на Гагарина, не успеваю забрать до закрытия.' },
    { title: 'Доставить торт на день рождения', description: 'Заказал торт в кондитерской, нужно доставить по адресу. Аккуратно!' },
    { title: 'Отнести ключи родственникам', description: 'Нужно передать ключи от квартиры родителям в соседний дом.' },
    { title: 'Купить корм для кота', description: 'Закончился корм, нужен Royal Canin из зоомагазина на углу.' },
    { title: 'Забрать очки из оптики', description: 'Готовы очки в оптике на Советской, не могу забрать сам.' },
    { title: 'Доставить цветы', description: 'Нужно забрать букет из цветочного и доставить по адресу. К 18:00.' },
    { title: 'Отвезти ноутбук в ремонт', description: 'Нужно отвезти ноутбук в сервис на проспекте. Тяжело нести самому.' },
  ],
  pets: [
    { title: 'Выгулять собаку вечером', description: 'Лабрадор, дружелюбный. Нужно погулять 30-40 минут в парке рядом.' },
    { title: 'Присмотреть за котом на выходные', description: 'Уезжаю на дачу, нужно покормить кота 2 раза в день. Лоток почистить.' },
    { title: 'Отвезти собаку к ветеринару', description: 'Нужно отвезти пёсика на прививку. Ветклиника в 10 минутах езды.' },
    { title: 'Выгул собаки утром', description: 'Нужен выгул с 7 до 8 утра, сам не успеваю перед работой.' },
    { title: 'Передержка попугая', description: 'Улетаю в отпуск на неделю, нужно присмотреть за попугаем. Клетка и корм дам.' },
    { title: 'Помыть собаку', description: 'Большая собака, самому сложно. Нужна помощь с мытьём и сушкой.' },
    { title: 'Покормить рыбок', description: 'Уезжаю на 3 дня, нужно зайти покормить рыбок. Ключи оставлю.' },
    { title: 'Выгул щенка днём', description: 'Щенку 4 месяца, нужно вывести погулять пока я на работе. 15-20 минут.' },
    { title: 'Присмотреть за хомяком', description: 'На время отпуска нужно забрать хомяка к себе. Неприхотливый.' },
    { title: 'Сопроводить кота к грумеру', description: 'Нужно отвезти кота на стрижку и забрать через 2 часа.' },
  ],
  other: [
    { title: 'Помочь с переездом', description: 'Переезжаю в соседний подъезд, нужна помощь перенести вещи. Примерно на 2 часа.' },
    { title: 'Посидеть с ребёнком', description: 'Нужно присмотреть за ребёнком (5 лет) пару часов. Спокойный, любит мультики.' },
    { title: 'Помочь с компьютером', description: 'Компьютер тормозит, нужна помощь почистить и настроить. Возможно переустановка.' },
    { title: 'Объяснить математику школьнику', description: 'Сын в 7 классе, не понимает алгебру. Нужны пара занятий.' },
    { title: 'Помочь разобрать вещи', description: 'После ремонта много коробок, нужна помощь разобрать и расставить.' },
    { title: 'Полить цветы', description: 'Уезжаю на неделю, нужно поливать цветы через день. Много растений.' },
    { title: 'Встретить курьера', description: 'Жду доставку мебели завтра с 10 до 14, сам не могу быть дома.' },
    { title: 'Помочь оформить документы', description: 'Нужна помощь заполнить заявление на Госуслугах. Не разбираюсь.' },
    { title: 'Научить пользоваться смартфоном', description: 'Бабушке подарили телефон, нужно показать как пользоваться.' },
    { title: 'Помочь вынести мусор', description: 'После ремонта много строительного мусора, нужна помощь вынести.' },
    { title: 'Сфотографировать для документов', description: 'Нужно фото на документы, есть хороший фотоаппарат?' },
    { title: 'Помочь написать резюме', description: 'Ищу работу, нужна помощь составить резюме. Опыт в продажах.' },
    { title: 'Перевести текст с английского', description: 'Нужно перевести инструкцию к технике, 2 страницы.' },
    { title: 'Измерить давление', description: 'Нет тонометра, чувствую себя плохо. Может у кого есть?' },
    { title: 'Одолжить стремянку', description: 'Нужна стремянка на пару часов, поменять лампочку.' },
  ]
};

const URGENCIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

// Генерация случайного телефона
function randomPhone() {
  return '+7' + Math.floor(9000000000 + Math.random() * 999999999);
}

// Случайный элемент массива
function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Случайное число в диапазоне
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Генерация случайной даты за последние N дней
function randomDate(daysBack) {
  const date = new Date();
  date.setDate(date.getDate() - randomInt(0, daysBack));
  date.setHours(randomInt(8, 22), randomInt(0, 59), 0, 0);
  return date.toISOString();
}

// HTTP запрос
async function apiRequest(endpoint, method = 'GET', body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const response = await fetch(`${API_URL}${endpoint}`, options);

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error ${response.status}: ${error}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

// Создание пользователя
async function createUser(name, phone) {
  try {
    const result = await apiRequest('/auth/register', 'POST', {
      name,
      phone,
      password: 'password123'
    });
    console.log(`  + Создан пользователь: ${name} (${phone})`);
    return { ...result.user, token: result.token };
  } catch (e) {
    // Если пользователь существует, пробуем войти
    try {
      const result = await apiRequest('/auth/login', 'POST', { phone, password: 'password123' });
      console.log(`  ~ Пользователь существует: ${name}`);
      return { ...result.user, token: result.token };
    } catch (e2) {
      console.log(`  ! Ошибка с пользователем ${name}: ${e2.message}`);
      return null;
    }
  }
}

// Создание задачи
async function createTask(task, authorId, token) {
  try {
    const result = await apiRequest('/tasks', 'POST', {
      title: task.title,
      description: task.description,
      category: task.category,
      urgency: task.urgency,
      reward: task.reward,
      authorId
    }, token);
    console.log(`    + Задача: ${task.title.substring(0, 40)}...`);
    return result;
  } catch (e) {
    console.log(`    ! Ошибка создания задачи: ${e.message}`);
    return null;
  }
}

// Отклик на задачу
async function respondToTask(taskId, userId, message, token) {
  try {
    await apiRequest(`/tasks/${taskId}/respond`, 'POST', { userId, message }, token);
    return true;
  } catch (e) {
    return false;
  }
}

// Главная функция
async function seed() {
  console.log('=== Начинаю заполнение БД ===\n');

  // 1. Создаём пользователей
  console.log('1. Создание пользователей...');
  const users = [];

  for (let i = 0; i < 20; i++) {
    const firstName = randomItem(FIRST_NAMES);
    const lastName = randomItem(LAST_NAMES);
    // Склоняем фамилию для женских имён
    const isWoman = ['Анна', 'Мария', 'Елена', 'Ольга', 'Наталья', 'Екатерина', 'Татьяна', 'Ирина', 'Светлана', 'Юлия', 'Дарья', 'Полина', 'Кристина', 'Валерия', 'Алина', 'Виктория', 'Марина', 'Людмила', 'Галина', 'Надежда'].includes(firstName);
    const fullLastName = isWoman ? lastName.replace(/ов$/, 'ова').replace(/ев$/, 'ева').replace(/ин$/, 'ина') : lastName;

    const name = `${firstName} ${fullLastName}`;
    const phone = randomPhone();

    const user = await createUser(name, phone);
    if (user) users.push(user);

    // Небольшая задержка чтобы не перегружать сервер
    await new Promise(r => setTimeout(r, 100));
  }

  console.log(`\nСоздано ${users.length} пользователей\n`);

  if (users.length === 0) {
    console.log('Не удалось создать пользователей, выход.');
    return;
  }

  // 2. Создаём задачи
  console.log('2. Создание задач...');
  const tasks = [];

  for (const [category, categoryTasks] of Object.entries(TASKS_DATA)) {
    console.log(`\n  Категория: ${category}`);

    for (const taskTemplate of categoryTasks) {
      const author = randomItem(users);

      const task = {
        ...taskTemplate,
        category: category.toUpperCase(),
        urgency: randomItem(URGENCIES),
        reward: Math.random() > 0.3 ? randomInt(1, 50) * 100 : 0, // 70% задач с оплатой
      };

      const created = await createTask(task, author.id, author.token);
      if (created) {
        tasks.push({ ...created, authorId: author.id });
      }

      await new Promise(r => setTimeout(r, 100));
    }
  }

  console.log(`\nСоздано ${tasks.length} задач\n`);

  // 3. Добавляем отклики
  console.log('3. Добавление откликов на задачи...');

  const responseMessages = [
    'Готов помочь!',
    'Могу сделать сегодня вечером',
    'Есть опыт, обращайтесь',
    'Свободен в выходные',
    'Сделаю качественно и быстро',
    'Живу рядом, могу помочь',
    'Давно этим занимаюсь',
    'Без проблем, пишите в личку',
    'Могу завтра с утра',
    'Есть все инструменты',
  ];

  let responsesCount = 0;

  for (const task of tasks) {
    // 60% задач получают отклики
    if (Math.random() > 0.4) {
      const numResponses = randomInt(1, 4);

      for (let i = 0; i < numResponses; i++) {
        // Выбираем случайного пользователя (не автора)
        const responders = users.filter(u => u.id !== task.authorId);
        if (responders.length === 0) continue;

        const responder = randomItem(responders);
        const message = randomItem(responseMessages);

        const success = await respondToTask(task.id, responder.id, message, responder.token);
        if (success) responsesCount++;

        await new Promise(r => setTimeout(r, 50));
      }
    }
  }

  console.log(`\nДобавлено ${responsesCount} откликов\n`);

  console.log('=== Готово! ===');
  console.log(`Пользователей: ${users.length}`);
  console.log(`Задач: ${tasks.length}`);
  console.log(`Откликов: ${responsesCount}`);
}

// Запуск
seed().catch(console.error);
