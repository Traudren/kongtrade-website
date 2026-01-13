# Диагностика Telegram Webhook

## Проблема
Webhook настроен, но Telegram не отправляет запросы. В логах Vercel нет запросов от Telegram.

## Проверка webhook info

Выполните эти команды и пришлите полный ответ:

### 1. Проверка Bybit бота:
```
https://api.telegram.org/bot7585793273:AAFw5sP4xz0WnFYL2P3Vgm4jRjef_RgRKGc/getWebhookInfo
```

### 2. Проверка Binance бота:
```
https://api.telegram.org/bot8309802088:AAG_HRvqhCt-USSViH172EUaI4VwrucTKU0/getWebhookInfo
```

**Важно:** Пришлите полный JSON ответ, особенно поля:
- `url` - какой URL установлен
- `pending_update_count` - сколько неотправленных обновлений
- `last_error_date` - дата последней ошибки
- `last_error_message` - текст последней ошибки
- `max_connections` - максимальное количество соединений

## Возможные решения

### Решение 1: Переустановка webhook с полными параметрами

**Для Bybit:**
```
https://api.telegram.org/bot7585793273:AAFw5sP4xz0WnFYL2P3Vgm4jRjef_RgRKGc/setWebhook?url=https://kongtrade.com/api/telegram/webhook&allowed_updates=["callback_query","message"]&drop_pending_updates=true
```

**Для Binance:**
```
https://api.telegram.org/bot8309802088:AAG_HRvqhCt-USSViH172EUaI4VwrucTKU0/setWebhook?url=https://kongtrade.com/api/telegram/webhook&allowed_updates=["callback_query","message"]&drop_pending_updates=true
```

### Решение 2: Проверка SSL сертификата

Telegram требует валидный SSL сертификат. Проверьте:
```
https://www.ssllabs.com/ssltest/analyze.html?d=kongtrade.com
```

### Решение 3: Временное отключение webhook для теста

Попробуйте временно отключить webhook и использовать getUpdates:

**Отключить webhook:**
```
https://api.telegram.org/bot7585793273:AAFw5sP4xz0WnFYL2P3Vgm4jRjef_RgRKGc/deleteWebhook?drop_pending_updates=true
```

**Проверить getUpdates (работает только если webhook отключен):**
```
https://api.telegram.org/bot7585793273:AAFw5sP4xz0WnFYL2P3Vgm4jRjef_RgRKGc/getUpdates
```

Если getUpdates работает, значит проблема в webhook URL или доступности.

### Решение 4: Проверка доступности URL для Telegram

Telegram должен иметь доступ к вашему URL. Проверьте:
1. URL должен быть HTTPS (не HTTP)
2. URL должен быть публично доступен
3. URL должен возвращать 200 OK для GET запросов

## Что нужно сделать сейчас:

1. **Выполните getWebhookInfo для обоих ботов** и пришлите полные ответы
2. **Попробуйте переустановить webhook** с параметрами из Решения 1
3. **Проверьте SSL сертификат** на kongtrade.com
4. **Попробуйте временно отключить webhook** и использовать getUpdates для проверки
