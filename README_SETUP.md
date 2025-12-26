# Инструкция по локальному запуску KongTrade

## Шаг 1: Настройка переменных окружения

Создайте файл `.env` в корне проекта со следующим содержимым:

```env
# Database - замените на вашу строку подключения к PostgreSQL
DATABASE_URL="postgresql://user:password@localhost:5432/kongtrade_db?schema=public"

# NextAuth - URL вашего приложения
NEXTAUTH_URL="http://localhost:3000"

# NextAuth - секретный ключ (сгенерируйте случайную строку)
# Можно использовать команду: openssl rand -base64 32
NEXTAUTH_SECRET="your-secret-key-here-generate-a-random-string"

# Node Environment
NODE_ENV="development"
```

**Важно:** Замените `user`, `password`, `localhost`, `5432` и `kongtrade_db` на ваши реальные данные подключения к базе данных PostgreSQL.

## Шаг 2: Установка зависимостей

```bash
npm install --legacy-peer-deps
```

или

```bash
yarn install
```

## Шаг 3: Настройка базы данных

### 3.1. Убедитесь, что PostgreSQL запущен

```bash
# Проверка статуса PostgreSQL (macOS)
brew services list | grep postgresql

# Или запустите PostgreSQL
brew services start postgresql
```

### 3.2. Создайте базу данных

```bash
# Войдите в PostgreSQL
psql postgres

# Создайте базу данных
CREATE DATABASE kongtrade_db;

# Выйдите
\q
```

### 3.3. Примените миграции Prisma

```bash
npx prisma migrate dev --name init
```

Это создаст все необходимые таблицы в базе данных.

### 3.4. Сгенерируйте Prisma Client

```bash
npx prisma generate
```

## Шаг 4: (Опционально) Создайте администратора

```bash
npm run create-admin
```

Или используйте скрипт:

```bash
npm run init-admin
```

## Шаг 5: Запуск сервера разработки

```bash
npm run dev
```

Приложение будет доступно по адресу: http://localhost:3000

## Полезные команды

- `npm run dev` - запуск dev сервера
- `npm run build` - сборка для production
- `npm run start` - запуск production сервера
- `npx prisma studio` - визуальный редактор базы данных
- `npm run create-admin` - создание админ-аккаунта

## Решение проблем

### Ошибка подключения к базе данных
- Убедитесь, что PostgreSQL запущен
- Проверьте правильность DATABASE_URL в `.env`
- Убедитесь, что база данных существует

### Ошибка Prisma Client
```bash
npx prisma generate
```

### Порт 3000 занят
Запустите на другом порту:
```bash
PORT=3001 npm run dev
```

