# Инструкция по деплою на Vercel

## Шаг 1: Подготовка проекта

Проект уже настроен для Vercel. Файл `vercel.json` содержит необходимую конфигурацию.

## Шаг 2: Создание аккаунта на Vercel

1. Перейдите на https://vercel.com
2. Нажмите **Sign Up**
3. Войдите через **GitHub** (рекомендуется, для автоматического деплоя)

## Шаг 3: Подключение репозитория

### Вариант A: Через Vercel Dashboard (Рекомендуется)

1. После входа в Vercel Dashboard нажмите **Add New Project**
2. Выберите ваш GitHub репозиторий `Traudren/kongtrade-website`
3. Vercel автоматически определит Next.js проект

### Вариант B: Через Vercel CLI

```bash
# Установите Vercel CLI глобально
npm i -g vercel

# Войдите в аккаунт
vercel login

# Деплой (первый раз)
vercel

# Production деплой
vercel --prod
```

## Шаг 4: Настройка переменных окружения

В Vercel Dashboard:

1. Откройте ваш проект
2. Перейдите в **Settings** → **Environment Variables**
3. Добавьте следующие переменные:

### Обязательные переменные:

```env
DATABASE_URL=postgresql://user:password@host:5432/database?schema=public
NEXTAUTH_URL=https://your-project.vercel.app
NEXTAUTH_SECRET=your-secret-key-here-generate-a-random-string
NODE_ENV=production
```

### Как получить значения:

#### DATABASE_URL
- Используйте существующую базу данных PostgreSQL
- Или создайте новую на:
  - **Vercel Postgres** (интеграция в Vercel Dashboard)
  - **Supabase** (https://supabase.com) - бесплатный план
  - **Neon** (https://neon.tech) - бесплатный план
  - **Railway** (https://railway.app) - $5 кредитов/мес

#### NEXTAUTH_URL
- После первого деплоя Vercel предоставит URL вида: `https://your-project.vercel.app`
- Используйте этот URL

#### NEXTAUTH_SECRET
- Сгенерируйте случайную строку:
  ```bash
  openssl rand -base64 32
  ```
- Или используйте онлайн генератор: https://generate-secret.vercel.app/32

### Настройка для разных окружений:

Vercel позволяет настроить переменные для:
- **Production** (production деплои)
- **Preview** (pull request деплои)
- **Development** (локальная разработка)

Рекомендуется добавить переменные для всех окружений.

## Шаг 5: Настройка базы данных

### Если используете Vercel Postgres:

1. В Vercel Dashboard → ваш проект → **Storage** → **Create Database**
2. Выберите **Postgres**
3. Vercel автоматически создаст переменную `POSTGRES_URL`
4. Используйте её как `DATABASE_URL` или добавьте алиас:

```env
DATABASE_URL=$POSTGRES_URL
```

### Если используете внешнюю базу данных:

1. Убедитесь, что база данных доступна из интернета
2. Добавьте `DATABASE_URL` в Environment Variables
3. Примените миграции Prisma (см. Шаг 6)

## Шаг 6: Применение миграций Prisma

После первого деплоя нужно применить миграции базы данных.

### Вариант A: Через Vercel CLI (Рекомендуется)

```bash
# Установите Vercel CLI
npm i -g vercel

# Подключите проект
vercel link

# Примените миграции
vercel env pull .env.local
npx prisma migrate deploy
```

### Вариант B: Через Vercel Dashboard

1. Перейдите в **Settings** → **Build & Development Settings**
2. Добавьте в **Build Command**:
   ```
   npx prisma generate && npx prisma migrate deploy && next build
   ```
3. Это автоматически применит миграции при каждом деплое

### Вариант C: Вручную через подключение к БД

```bash
# Подключитесь к вашей базе данных
psql $DATABASE_URL

# Или используйте Prisma Studio
npx prisma studio
```

## Шаг 7: Первый деплой

1. После настройки всех переменных окружения нажмите **Deploy**
2. Vercel автоматически:
   - Установит зависимости
   - Сгенерирует Prisma Client
   - Соберет Next.js приложение
   - Задеплоит на CDN

3. Дождитесь завершения деплоя (обычно 2-5 минут)

## Шаг 8: Настройка домена (Опционально)

1. В Vercel Dashboard → **Settings** → **Domains**
2. Добавьте ваш домен
3. Следуйте инструкциям для настройки DNS записей

## Шаг 9: Автоматический деплой

Vercel автоматически деплоит при:
- Push в `main` branch → Production деплой
- Pull Request → Preview деплой
- Push в другие ветки → Preview деплой

## Настройка Build Command (если нужно)

Если нужно изменить команду сборки:

1. **Settings** → **Build & Development Settings**
2. **Build Command**: 
   ```
   npm install --legacy-peer-deps && npx prisma generate && npm run build
   ```
3. **Install Command** (опционально):
   ```
   npm install --legacy-peer-deps
   ```

## Проверка деплоя

После успешного деплоя:

1. Откройте URL вашего проекта
2. Проверьте, что сайт загружается
3. Проверьте консоль браузера на ошибки
4. Проверьте логи в Vercel Dashboard → **Deployments** → выберите деплой → **Logs**

## Решение проблем

### Ошибка: "Prisma Client not generated"

**Решение:**
- Убедитесь, что в Build Command есть `npx prisma generate`
- Или добавьте в `vercel.json`:
  ```json
  {
    "buildCommand": "npx prisma generate && next build"
  }
  ```

### Ошибка: "Database connection failed"

**Решение:**
- Проверьте `DATABASE_URL` в Environment Variables
- Убедитесь, что база данных доступна из интернета
- Проверьте firewall настройки базы данных

### Ошибка: "NEXTAUTH_URL is not set"

**Решение:**
- Добавьте `NEXTAUTH_URL` в Environment Variables
- Используйте полный URL: `https://your-project.vercel.app`

### Медленная сборка

**Решение:**
- Используйте Vercel's Build Cache
- Убедитесь, что `.next` и `node_modules` в `.gitignore`
- Рассмотрите использование `--legacy-peer-deps` только если необходимо

## Полезные команды Vercel CLI

```bash
# Локальный деплой для тестирования
vercel

# Production деплой
vercel --prod

# Просмотр логов
vercel logs

# Просмотр переменных окружения
vercel env ls

# Добавление переменной окружения
vercel env add DATABASE_URL

# Удаление переменной окружения
vercel env rm DATABASE_URL
```

## Сравнение с Netlify

| Функция | Netlify | Vercel |
|---------|---------|--------|
| Next.js оптимизация | ✅ | ✅✅ (лучше) |
| Автоматический деплой | ✅ | ✅ |
| Preview deployments | ✅ | ✅ |
| Serverless Functions | ✅ | ✅ |
| Edge Functions | ❌ | ✅ |
| CDN | ✅ | ✅✅ (быстрее) |
| Бесплатный план | 300 кредитов/мес | Неограниченные деплои |

## Дополнительные ресурсы

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Prisma on Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)

