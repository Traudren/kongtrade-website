# Настройка Telegram Webhook для обработки кнопок

## Что было реализовано

1. ✅ Telegram уведомления с inline кнопками "Подтвердить" и "Отменить"
2. ✅ Обработка callback'ов от кнопок
3. ✅ Автоматическое создание конфигурационных файлов (`user_bybit_config.txt` или `user_binance_config.txt`)
4. ✅ Отслеживание попыток оплаты (максимум 3)
5. ✅ Блокировка пользователя на 24 часа после 3 неудачных попыток
6. ✅ Автоматическая активация подписки при подтверждении

## Настройка Webhook

Для работы кнопок в Telegram нужно настроить webhook, чтобы Telegram мог отправлять callback'и на ваш сервер.

### Вариант 1: Настройка через API (рекомендуется)

Используйте один из ваших Telegram ботов:

**Для Bybit бота:**
```bash
curl -X POST "https://api.telegram.org/bot7585793273:AAFw5sP4xz0WnFYL2P3Vgm4jRjef_RgRKGc/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.kongtrade.com/api/telegram/webhook"
  }'
```

**Для Binance бота:**
```bash
curl -X POST "https://api.telegram.org/bot8309802088:AAG_HRvqhCt-USSViH172EUaI4VwrucTKU0/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.kongtrade.com/api/telegram/webhook"
  }'
```

### Вариант 2: Настройка через браузер

1. Откройте в браузере:
   - Для Bybit: `https://api.telegram.org/bot7585793273:AAFw5sP4xz0WnFYL2P3Vgm4jRjef_RgRKGc/setWebhook?url=https://www.kongtrade.com/api/telegram/webhook`
   - Для Binance: `https://api.telegram.org/bot8309802088:AAG_HRvqhCt-USSViH172EUaI4VwrucTKU0/setWebhook?url=https://www.kongtrade.com/api/telegram/webhook`

2. Должен вернуться ответ: `{"ok":true,"result":true,"description":"Webhook was set"}`

### Проверка webhook

Проверить статус webhook:
```bash
curl "https://api.telegram.org/bot7585793273:AAFw5sP4xz0WnFYL2P3Vgm4jRjef_RgRKGc/getWebhookInfo"
```

## Как это работает

### 1. Когда пользователь создает платеж:
- Создается запись в БД со статусом `PENDING`
- Отправляется уведомление в Telegram с двумя кнопками
- Сохраняется ID сообщения в БД

### 2. При нажатии "✅ Подтвердить":
- Статус платежа меняется на `COMPLETED`
- Статус подписки меняется на `ACTIVE`
- Устанавливаются даты начала и окончания подписки
- Создается конфигурационный файл:
  - `user_bybit_config.txt` если биржа Bybit
  - `user_binance_config.txt` если биржа Binance
- Сбрасывается счетчик попыток оплаты
- Сообщение в Telegram обновляется с подтверждением

### 3. При нажатии "❌ Отменить":
- Статус платежа меняется на `FAILED`
- Увеличивается счетчик попыток оплаты
- Если попыток >= 3, пользователь блокируется на 24 часа
- Сообщение в Telegram обновляется с информацией об отмене

## Формат конфигурационного файла

Файлы создаются в директории `user_configs/`:

**user_bybit_config.txt:**
```
user_name = 'Имя пользователя'
api_key = 'API ключ'
api_secret = 'API секрет'
profit_limit = '25'  // или '40', или 'unlim' в зависимости от плана
sub_period = '30'    // или '90' в зависимости от типа подписки
```

**user_binance_config.txt:**
```
user_name = 'Имя пользователя'
api_key = 'API ключ'
api_secret = 'API секрет'
profit_limit = '25'
sub_period = '30'
```

## Profit Limit по планам

- **Basic**: `25` (до 25% от депозита)
- **Professional**: `40` (до 40% от депозита)
- **Premium**: `unlim` (без ограничений)

## Sub Period

- **Monthly**: `30` дней
- **Quarterly**: `90` дней

## Блокировка пользователей

- После каждой отмены платежа счетчик попыток увеличивается
- После 3 отмен пользователь блокируется на 24 часа
- При попытке создать новый платеж во время блокировки возвращается ошибка 403
- При успешной оплате счетчик попыток сбрасывается

## Важные замечания

1. **Webhook URL должен быть HTTPS** - Vercel автоматически предоставляет HTTPS
2. **Оба бота должны быть настроены** - если используете оба бота (Bybit и Binance)
3. **Проверьте права доступа** - убедитесь, что webhook endpoint доступен публично
4. **Логирование** - все действия логируются в консоль Vercel

## Отладка

Если кнопки не работают:

1. Проверьте webhook:
   ```bash
   curl "https://api.telegram.org/bot7585793273:AAFw5sP4xz0WnFYL2P3Vgm4jRjef_RgRKGc/getWebhookInfo"
   ```

2. Проверьте логи Vercel:
   - Deployments → последний деплой → Logs
   - Ищите ошибки в `/api/telegram/webhook`

3. Проверьте, что endpoint доступен:
   ```bash
   curl -X POST https://www.kongtrade.com/api/telegram/webhook \
     -H "Content-Type: application/json" \
     -d '{"test": true}'
   ```

## Безопасность

⚠️ **Важно**: Webhook endpoint должен проверять, что запросы приходят от Telegram. В текущей реализации это не реализовано, но можно добавить проверку токена или IP адресов Telegram.

Для production рекомендуется добавить проверку:
- IP адресов Telegram (список: https://core.telegram.org/bots/webhooks)
- Или использовать секретный токен в callback_data

