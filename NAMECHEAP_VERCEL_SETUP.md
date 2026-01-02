# Подключение домена Namecheap к Vercel

## Быстрая инструкция

### 1. В Vercel Dashboard
- Settings → Domains → Add Domain
- Введите: `kongtrade.com`

### 2. В Namecheap
- Domain List → kongtrade.com → Manage → Advanced DNS

### 3. Добавьте DNS записи:

**A запись:**
- Type: `A Record`
- Host: `@`
- Value: `76.76.21.21`
- TTL: `Automatic`

**CNAME запись:**
- Type: `CNAME Record`
- Host: `www`
- Value: `cname.vercel-dns.com`
- TTL: `Automatic`

### 4. Подождите 1-4 часа (распространение DNS)

### 5. Проверьте статус в Vercel Dashboard → Settings → Domains

---

## Альтернатива: Vercel Nameservers

Если хотите, чтобы Vercel полностью управлял DNS:

1. В Vercel Dashboard → Settings → Domains → выберите домен
2. Скопируйте nameservers
3. В Namecheap → Domain → Nameservers → Custom DNS
4. Вставьте nameservers от Vercel
5. Сохраните

---

## Проверка DNS

- https://dnschecker.org
- https://www.whatsmydns.net

Введите `kongtrade.com`, выберите тип `A`, проверьте что везде `76.76.21.21`

---

## Обновление переменных окружения

После подключения домена обновите в Vercel:
- Settings → Environment Variables
- `NEXTAUTH_URL` → `https://kongtrade.com`

