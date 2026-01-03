# Расположение конфигурационных файлов

## Где находятся файлы конфигурации

Конфигурационные файлы создаются в директории `user_configs/` в корне проекта:

```
/kong_site/
  └── user_configs/
      ├── user_bybit_config.txt
      └── user_binance_config.txt
```

## Как создаются файлы

Файлы создаются автоматически при подтверждении платежа через Telegram webhook:

1. **Когда:** При нажатии кнопки "✅ Подтвердить" в Telegram
2. **Где:** На сервере в директории `user_configs/`
3. **Имя файла:**
   - `user_bybit_config.txt` - если биржа Bybit
   - `user_binance_config.txt` - если биржа Binance

## Формат файла

```ini
user_name = 'Имя пользователя'
api_key = 'API ключ'
api_secret = 'API секрет'
profit_limit = '25'  # или '40', или 'unlim'
sub_period = '30'    # или '90'
```

## Важно для Vercel

⚠️ **Внимание:** На Vercel файловая система является **ephemeral** (временной). Это означает:

1. **Файлы не сохраняются между деплоями** - они удаляются при каждом новом деплое
2. **Файлы доступны только на сервере** - они не доступны через веб-интерфейс
3. **Файлы создаются только на сервере** - они не синхронизируются между инстансами

## Альтернативные решения

Если нужно сохранять файлы постоянно, рассмотрите:

1. **Облачное хранилище:**
   - AWS S3
   - Google Cloud Storage
   - Cloudflare R2

2. **База данных:**
   - Сохранять конфигурации в Prisma/Supabase
   - Создавать файлы по запросу

3. **GitHub/Git:**
   - Автоматически коммитить файлы в репозиторий
   - Использовать GitHub Actions

## Текущая реализация

Сейчас файлы создаются в `app/api/telegram/webhook/route.ts`:

```typescript
const configDir = path.join(process.cwd(), 'user_configs')
const filename = exchange === 'binance' ? 'user_binance_config.txt' : 'user_bybit_config.txt'
const filePath = path.join(configDir, filename)
fs.writeFileSync(filePath, configContent, 'utf8')
```

## Как получить файлы

### Локально (разработка)
Файлы находятся в: `/Users/aleksandr/Desktop/kong_site/user_configs/`

### На Vercel (production)
1. Файлы создаются на сервере при подтверждении платежа
2. Для доступа к файлам нужно:
   - Использовать Vercel CLI: `vercel logs` для просмотра логов
   - Или добавить API endpoint для скачивания файлов
   - Или использовать облачное хранилище

## Рекомендации

Для production рекомендуется:
1. Сохранять конфигурации в базе данных
2. Или использовать облачное хранилище (S3, R2)
3. Или отправлять файлы напрямую в Telegram/Email при подтверждении

