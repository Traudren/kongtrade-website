# Руководство по интеграции торгового бота KongTrade

## 📋 Обзор архитектуры

### Текущая структура:
1. **Веб-сайт (Next.js)** - управление пользователями, подписками, конфигурациями
2. **База данных (Supabase/PostgreSQL)** - хранение всех данных
3. **Торговый бот (Alibaba сервер)** - выполнение торговых операций

### Поток данных:
```
Пользователь → Веб-сайт → База данных → API → Торговый бот
```

---

## 🔌 API Endpoint для бота

### URL:
```
GET https://www.kongtrade.com/api/bot/users
```

### Аутентификация:
Используйте Bearer token в заголовке:
```http
Authorization: Bearer YOUR_BOT_API_KEY
```

### Пример запроса (Python):
```python
import requests

API_URL = "https://www.kongtrade.com/api/bot/users"
API_KEY = "your_bot_api_key_here"

headers = {
    "Authorization": f"Bearer {API_KEY}"
}

response = requests.get(API_URL, headers=headers)
data = response.json()

if data["success"]:
    users = data["users"]
    for user in users:
        print(f"User: {user['user_name']}")
        print(f"Exchange: {user['exchange']}")
        print(f"API Key: {user['api_key']}")
        print(f"Profit Limit: {user['subscription']['profit_limit']}")
```

### Пример запроса (Node.js):
```javascript
const fetch = require('node-fetch');

const API_URL = 'https://www.kongtrade.com/api/bot/users';
const API_KEY = 'your_bot_api_key_here';

async function getUsers() {
  const response = await fetch(API_URL, {
    headers: {
      'Authorization': `Bearer ${API_KEY}`
    }
  });
  
  const data = await response.json();
  
  if (data.success) {
    return data.users;
  }
  
  throw new Error(data.error);
}
```

---

## 📦 Формат ответа API

### Успешный ответ:
```json
{
  "success": true,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "total_users": 5,
  "users": [
    {
      "user_id": "cmj1qbqup00019ksveh9a65jn",
      "user_name": "John Doe",
      "email": "john@example.com",
      "exchange": "binance",
      "api_key": "user_api_key_here",
      "api_secret": "user_api_secret_here",
      "subscription": {
        "plan_name": "Premium",
        "plan_type": "monthly",
        "profit_limit": "unlim",
        "sub_period": "30",
        "start_date": "2024-01-01T00:00:00.000Z",
        "end_date": "2024-01-31T23:59:59.999Z",
        "days_remaining": 16,
        "status": "ACTIVE"
      },
      "config": {
        "config_id": "config_id_here",
        "is_active": true,
        "bot_status": "not_launched",
        "last_activity": null
      }
    }
  ]
}
```

### Ошибка аутентификации:
```json
{
  "error": "Unauthorized. Invalid API key"
}
```

---

## 🔐 Настройка API ключа

### 1. Создайте секретный ключ:
```bash
# Генерируем случайный ключ
openssl rand -hex 32
```

### 2. Добавьте в Vercel:
1. Откройте Vercel Dashboard
2. Перейдите в Settings → Environment Variables
3. Добавьте:
   - **Key:** `BOT_API_KEY`
   - **Value:** (ваш сгенерированный ключ)
   - **Environment:** Production, Preview, Development

### 3. Используйте в боте:
Сохраните этот ключ на Alibaba сервере в переменных окружения или конфигурационном файле.

---

## 🤖 Интеграция с торговым ботом

### Рекомендуемая архитектура бота:

#### Вариант 1: Периодический опрос (Polling)
```python
import time
import requests
from datetime import datetime

def fetch_active_users():
    """Получает список активных пользователей"""
    response = requests.get(
        "https://www.kongtrade.com/api/bot/users",
        headers={"Authorization": f"Bearer {BOT_API_KEY}"}
    )
    return response.json()["users"]

def run_trading_bot():
    """Основной цикл бота"""
    while True:
        # Получаем активных пользователей
        users = fetch_active_users()
        
        # Запускаем торговлю для каждого пользователя
        for user in users:
            try:
                # Ваша логика торговли
                trade_for_user(user)
            except Exception as e:
                print(f"Error trading for {user['user_name']}: {e}")
        
        # Ждем до следующего цикла
        time.sleep(60)  # Проверяем каждую минуту
```

#### Вариант 2: Запуск по расписанию (Cron)
```python
# bot_daily_run.py
import requests
from datetime import datetime

def main():
    """Запускается каждый день в полночь"""
    users = fetch_active_users()
    
    for user in users:
        # Запускаем торговлю для пользователя
        trade_for_user(user)
    
    print(f"Trading completed for {len(users)} users at {datetime.now()}")

if __name__ == "__main__":
    main()
```

Настройка cron на Alibaba сервере:
```bash
# Запуск каждый день в 00:00
0 0 * * * /usr/bin/python3 /path/to/bot_daily_run.py >> /var/log/kongtrade_bot.log 2>&1
```

---

## 📊 Данные пользователя

### Что получает бот:

1. **Базовая информация:**
   - `user_id` - уникальный ID пользователя
   - `user_name` - имя пользователя
   - `email` - email пользователя

2. **Торговая конфигурация:**
   - `exchange` - биржа ('binance' или 'bybit')
   - `api_key` - API ключ биржи
   - `api_secret` - API секрет биржи

3. **Информация о подписке:**
   - `plan_name` - план (Basic, Professional, Premium)
   - `plan_type` - тип (monthly, quarterly)
   - `profit_limit` - лимит прибыли ('25', '40', 'unlim')
   - `sub_period` - период подписки в днях ('30' или '90')
   - `days_remaining` - оставшиеся дни подписки
   - `end_date` - дата окончания подписки

4. **Статус конфигурации:**
   - `is_active` - активна ли конфигурация
   - `bot_status` - статус бота (not_launched, running, stopped, error)
   - `last_activity` - последняя активность

---

## 🔄 Обновление статуса бота

### API для обновления статуса:
```http
PATCH /api/bot/users/{user_id}/status
Authorization: Bearer YOUR_BOT_API_KEY
Content-Type: application/json

{
  "bot_status": "running",
  "last_activity": "2024-01-15T10:30:00.000Z"
}
```

Это позволит отслеживать статус работы бота для каждого пользователя.

---

## ⚙️ Рекомендации по реализации

### 1. Обработка ошибок:
```python
def fetch_users_safe():
    try:
        response = requests.get(API_URL, headers=headers, timeout=10)
        response.raise_for_status()
        return response.json()["users"]
    except requests.exceptions.RequestException as e:
        print(f"Error fetching users: {e}")
        return []  # Возвращаем пустой список при ошибке
```

### 2. Кэширование данных:
```python
from datetime import datetime, timedelta

last_fetch = None
cached_users = []
CACHE_DURATION = timedelta(minutes=5)

def get_users_cached():
    global last_fetch, cached_users
    
    if last_fetch is None or datetime.now() - last_fetch > CACHE_DURATION:
        cached_users = fetch_active_users()
        last_fetch = datetime.now()
    
    return cached_users
```

### 3. Логирование:
```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('bot.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

def trade_for_user(user):
    logger.info(f"Starting trade for user {user['user_name']}")
    # Ваша логика
```

### 4. Многопоточность (если нужно):
```python
from concurrent.futures import ThreadPoolExecutor

def run_parallel_trading(users):
    with ThreadPoolExecutor(max_workers=5) as executor:
        futures = [executor.submit(trade_for_user, user) for user in users]
        for future in futures:
            try:
                future.result()
            except Exception as e:
                logger.error(f"Trading error: {e}")
```

---

## 🚀 Запуск на Alibaba сервере

### 1. Установка зависимостей:
```bash
pip install requests python-dotenv
```

### 2. Создание .env файла:
```bash
BOT_API_KEY=your_api_key_here
API_URL=https://www.kongtrade.com/api/bot/users
```

### 3. Запуск как сервис (systemd):
```ini
# /etc/systemd/system/kongtrade-bot.service
[Unit]
Description=KongTrade Trading Bot
After=network.target

[Service]
Type=simple
User=your_user
WorkingDirectory=/path/to/bot
Environment="PATH=/usr/bin:/usr/local/bin"
ExecStart=/usr/bin/python3 /path/to/bot/main.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Активация:
```bash
sudo systemctl enable kongtrade-bot
sudo systemctl start kongtrade-bot
sudo systemctl status kongtrade-bot
```

---

## 📝 Чеклист интеграции

- [ ] Создать `BOT_API_KEY` в Vercel
- [ ] Добавить API ключ в переменные окружения бота
- [ ] Реализовать функцию получения пользователей
- [ ] Реализовать основную логику торговли
- [ ] Настроить cron для ежедневного запуска
- [ ] Добавить логирование
- [ ] Добавить обработку ошибок
- [ ] Протестировать на тестовых данных
- [ ] Развернуть на Alibaba сервере

---

## 🆘 Поддержка

Если нужна помощь с интеграцией:
1. Проверьте логи API: Vercel Dashboard → Deployments → Logs
2. Проверьте логи бота на Alibaba сервере
3. Убедитесь, что API ключ правильный
4. Проверьте, что у пользователей есть активные подписки

---

## 📌 Важные замечания

1. **Безопасность:** Никогда не коммитьте API ключ в Git
2. **Rate Limiting:** API может иметь ограничения по запросам
3. **Обработка ошибок:** Всегда обрабатывайте ошибки сети и API
4. **Валидация данных:** Проверяйте данные перед использованием
5. **Логирование:** Ведите логи всех операций для отладки

