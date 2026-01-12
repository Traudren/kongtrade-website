# Настройка DATABASE_URL на Vercel

## Проблема
Ошибка "Database connection error" возникает, когда `DATABASE_URL` на Vercel настроен неправильно.

## Решение

### 1. Получите Connection Pooling URL от Supabase

1. Зайдите в ваш проект на [Supabase Dashboard](https://app.supabase.com)
2. Перейдите в **Settings** → **Database**
3. Найдите секцию **Connection Pooling**
4. Скопируйте **Connection Pooling URL** (должен содержать `pooler.supabase.com:6543`)

**Важно:** Используйте именно Connection Pooling URL, а не прямой URL!

### 2. Настройте DATABASE_URL на Vercel

1. Зайдите в ваш проект на [Vercel Dashboard](https://vercel.com)
2. Перейдите в **Settings** → **Environment Variables**
3. Найдите переменную `DATABASE_URL`
4. Убедитесь, что значение:
   - Содержит `pooler.supabase.com:6543` (Connection Pooling)
   - Или `aws-0-eu-north-1.pooler.supabase.com:6543` (если используете EU North)
   - **НЕ** содержит `:5432` (прямое подключение)

### 3. Формат правильного DATABASE_URL

```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

Или:

```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
```

### 4. Перезапустите деплой

После изменения переменной окружения:
1. Перейдите в **Deployments**
2. Нажмите на три точки рядом с последним деплоем
3. Выберите **Redeploy**

Или просто сделайте новый коммит и пуш.

## Проверка

После деплоя проверьте логи:
1. Vercel Dashboard → ваш проект → **Deployments** → последний деплой
2. Откройте **Functions** → `/api/auth/register`
3. В логах не должно быть ошибок подключения

Если ошибка осталась, проверьте:
- Правильность пароля в DATABASE_URL
- Что Connection Pooling включен в Supabase
- Что проект не заблокирован в Supabase
