# Исправление проблемы с неработающими кнопками в Telegram

## Проблема
Кнопки "Подтвердить" и "Отменить" отображаются, но не работают при нажатии.

## Причина
Webhook не настроен для Telegram бота, поэтому Telegram не может отправить callback на ваш сервер.

## Решение

### Шаг 1: Проверьте текущий статус webhook

**Для Binance бота:**
```bash
curl "https://api.telegram.org/bot8309802088:AAG_HRvqhCt-USSViH172EUaI4VwrucTKU0/getWebhookInfo"
```

**Для Bybit бота:**
```bash
curl "https://api.telegram.org/bot7585793273:AAFw5sP4xz0WnFYL2P3Vgm4jRjef_RgRKGc/getWebhookInfo"
```

### Шаг 2: Настройте webhook для Binance бота

**Вариант A: Через браузер (самый простой)**

Откройте в браузере эту ссылку:
```
https://api.telegram.org/bot8309802088:AAG_HRvqhCt-USSViH172EUaI4VwrucTKU0/setWebhook?url=https://www.kongtrade.com/api/telegram/webhook
```

Должен вернуться ответ:
```json
{"ok":true,"result":true,"description":"Webhook was set"}
```

**Вариант B: Через curl (в терминале)**

```bash
curl -X POST "https://api.telegram.org/bot8309802088:AAG_HRvqhCt-USSViH172EUaI4VwrucTKU0/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.kongtrade.com/api/telegram/webhook"}'
```

### Шаг 3: Настройте webhook для Bybit бота (если используете)

```
https://api.telegram.org/bot7585793273:AAFw5sP4xz0WnFYL2P3Vgm4jRjef_RgRKGc/setWebhook?url=https://www.kongtrade.com/api/telegram/webhook
```

### Шаг 4: Проверьте, что webhook работает

После настройки проверьте статус:
```bash
curl "https://api.telegram.org/bot8309802088:AAG_HRvqhCt-USSViH172EUaI4VwrucTKU0/getWebhookInfo"
```

Должен вернуться:
```json
{
  "ok": true,
  "result": {
    "url": "https://www.kongtrade.com/api/telegram/webhook",
    "has_custom_certificate": false,
    "pending_update_count": 0
  }
}
```

### Шаг 5: Проверьте логи Vercel

1. Откройте Vercel Dashboard → ваш проект
2. Перейдите в **Deployments** → последний деплой → **Logs**
3. Нажмите на кнопку в Telegram
4. Проверьте логи - должны появиться записи:
   - `📥 Telegram webhook received:`
   - `🔘 Callback query received:`
   - `✅ Callback query answered:`

## Если webhook не работает

### Проблема 1: Webhook URL недоступен

Проверьте, что endpoint доступен:
```bash
curl -X POST https://www.kongtrade.com/api/telegram/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

Должен вернуться `{"ok":true}`

### Проблема 2: SSL сертификат

Telegram требует HTTPS. Убедитесь, что ваш домен использует HTTPS (Vercel автоматически предоставляет SSL).

### Проблема 3: Неправильный URL

Убедитесь, что URL точно: `https://www.kongtrade.com/api/telegram/webhook`
(без слеша в конце, с https, правильный домен)

## Тестирование

1. Создайте тестовый платеж
2. Должно прийти сообщение в Telegram с кнопками
3. Нажмите на кнопку
4. Проверьте логи Vercel - должны быть записи о callback
5. Сообщение должно обновиться с результатом

## Отладка

Если кнопки все еще не работают:

1. **Проверьте webhook статус:**
   ```bash
   curl "https://api.telegram.org/bot8309802088:AAG_HRvqhCt-USSViH172EUaI4VwrucTKU0/getWebhookInfo"
   ```

2. **Проверьте логи Vercel:**
   - Deployments → Logs
   - Ищите ошибки в `/api/telegram/webhook`

3. **Проверьте, что endpoint доступен:**
   - Откройте `https://www.kongtrade.com/api/telegram/webhook` в браузере
   - Должен вернуться `{"ok":true}` или ошибка (но не 404)

4. **Проверьте токен бота:**
   - Убедитесь, что токен правильный
   - Проверьте, что бот активен

## Быстрое решение

Просто откройте в браузере:
```
https://api.telegram.org/bot8309802088:AAG_HRvqhCt-USSViH172EUaI4VwrucTKU0/setWebhook?url=https://www.kongtrade.com/api/telegram/webhook
```

После этого кнопки должны заработать!

