import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { TelegramBot } from '@/lib/telegram'
import fs from 'fs'
import path from 'path'

export const dynamic = "force-dynamic"

// Функция для создания конфигурационного файла
async function createUserConfigFile(user: any, subscription: any, userConfig: any) {
  try {
    const exchange = userConfig?.exchange || 'bybit'
    
    // Определяем profit_limit на основе плана
    let profitLimit = ''
    if (subscription.planName === 'Basic') {
      profitLimit = '25'
    } else if (subscription.planName === 'Professional') {
      profitLimit = '40'
    } else if (subscription.planName === 'Premium') {
      profitLimit = 'unlim'
    } else {
      profitLimit = '25'
    }

    // Определяем период подписки
    const subPeriod = subscription.planType === 'monthly' ? '30' : '90'

    // Создаем содержимое файла
    const configContent = `user_name = '${user.name || ''}'
api_key = '${userConfig?.apiKey || ''}'
api_secret = '${userConfig?.apiSecret || ''}'
profit_limit = '${profitLimit}'
sub_period = '${subPeriod}'`

    // Определяем имя файла в зависимости от биржи
    const filename = exchange === 'binance' ? 'user_binance_config.txt' : 'user_bybit_config.txt'

    // Создаем директорию для конфигураций, если её нет
    const configDir = path.join(process.cwd(), 'user_configs')
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true })
    }

    // Сохраняем файл
    const filePath = path.join(configDir, filename)
    fs.writeFileSync(filePath, configContent, 'utf8')

    console.log(`✅ Configuration file created: ${filePath}`)
    return filePath
  } catch (error) {
    console.error('Error creating config file:', error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Обработка callback query от inline кнопок
    if (body.callback_query) {
      const callbackQuery = body.callback_query
      const callbackData = callbackQuery.data
      const messageId = callbackQuery.message?.message_id
      const chatId = callbackQuery.message?.chat?.id

      // Определяем какой бот использовался (по chat_id или токену)
      // Для упрощения используем первый токен (можно улучшить логику)
      const telegram = new TelegramBot('bybit') // По умолчанию, можно улучшить

      // Отвечаем на callback query
      await telegram.answerCallbackQuery(callbackQuery.id, 'Processing...')

      // Парсим callback_data
      if (callbackData.startsWith('approve_payment_')) {
        const paymentId = callbackData.replace('approve_payment_', '')
        
        // Получаем платеж с полной информацией
        const payment = await prisma.payment.findUnique({
          where: { id: paymentId },
          include: {
            user: {
              include: {
                configs: true
              }
            },
            subscription: true
          }
        })

        if (!payment) {
          const bot = new TelegramBot('bybit')
          await bot.editMessageText(
            messageId!,
            '❌ Payment not found',
            undefined
          )
          return NextResponse.json({ ok: true })
        }

        if (payment.status !== 'PENDING') {
          const botExchange = payment.paymentMethod?.toLowerCase() === 'binance' ? 'binance' : 'bybit'
          const bot = new TelegramBot(botExchange)
          await bot.editMessageText(
            messageId!,
            `⚠️ Payment already processed. Status: ${payment.status}`,
            undefined
          )
          return NextResponse.json({ ok: true })
        }

        // Определяем бота по paymentMethod
        const botExchange = payment.paymentMethod?.toLowerCase() === 'binance' ? 'binance' : 'bybit'
        const bot = new TelegramBot(botExchange)

        // Обновляем статус платежа
        await prisma.payment.update({
          where: { id: paymentId },
          data: { status: 'COMPLETED' }
        })

        // Активируем подписку
        if (payment.subscription) {
          const startDate = new Date()
          const endDate = new Date()
          
          // Вычисляем период подписки в днях
          const days = payment.subscription.planType === 'monthly' ? 30 : 90
          endDate.setDate(endDate.getDate() + days)

          await prisma.subscription.update({
            where: { id: payment.subscription.id },
            data: {
              status: 'ACTIVE',
              startDate: startDate,
              endDate: endDate
            }
          })

          // Создаем конфигурационный файл
          if (payment.user.configs && payment.user.configs.length > 0) {
            const userConfig = payment.user.configs[0]
            await createUserConfigFile(payment.user, payment.subscription, userConfig)
          }

          // Сбрасываем счетчик попыток при успешной оплате
          await prisma.user.update({
            where: { id: payment.userId },
            data: { paymentAttempts: 0 }
          })
        }

        // Обновляем сообщение в Telegram
        const successMessage = `✅ <b>Payment Approved!</b>

👤 <b>User:</b> ${payment.user.name || payment.user.email}
💰 <b>Amount:</b> $${payment.amount}
💎 <b>Subscription:</b> ${payment.subscription?.planName} - ACTIVE
📅 <b>Period:</b> ${payment.subscription?.planType === 'monthly' ? '30 days' : '90 days'}

✅ Subscription activated and config file created.`

        await bot.editMessageText(messageId!, successMessage, undefined)

        return NextResponse.json({ ok: true })

      } else if (callbackData.startsWith('reject_payment_')) {
        const paymentId = callbackData.replace('reject_payment_', '')
        
        // Получаем платеж
        const payment = await prisma.payment.findUnique({
          where: { id: paymentId },
          include: {
            user: true
          }
        })

        if (!payment) {
          const bot = new TelegramBot('bybit')
          await bot.editMessageText(
            messageId!,
            '❌ Payment not found',
            undefined
          )
          return NextResponse.json({ ok: true })
        }

        if (payment.status !== 'PENDING') {
          const botExchange = payment.paymentMethod?.toLowerCase() === 'binance' ? 'binance' : 'bybit'
          const bot = new TelegramBot(botExchange)
          await bot.editMessageText(
            messageId!,
            `⚠️ Payment already processed. Status: ${payment.status}`,
            undefined
          )
          return NextResponse.json({ ok: true })
        }

        // Определяем бота по paymentMethod
        const botExchange = payment.paymentMethod?.toLowerCase() === 'binance' ? 'binance' : 'bybit'
        const bot = new TelegramBot(botExchange)

        // Обновляем статус платежа на FAILED
        await prisma.payment.update({
          where: { id: paymentId },
          data: { status: 'FAILED' }
        })

        // Увеличиваем счетчик попыток
        const user = await prisma.user.findUnique({
          where: { id: payment.userId }
        })

        if (user) {
          const newAttempts = (user.paymentAttempts || 0) + 1
          let blockedUntil: Date | null = null

          // Если 3 попытки - блокируем на 24 часа
          if (newAttempts >= 3) {
            blockedUntil = new Date()
            blockedUntil.setHours(blockedUntil.getHours() + 24)
          }

          await prisma.user.update({
            where: { id: payment.userId },
            data: {
              paymentAttempts: newAttempts,
              blockedUntil: blockedUntil
            }
          })

          // Обновляем сообщение в Telegram
          const rejectMessage = `❌ <b>Payment Rejected</b>

👤 <b>User:</b> ${payment.user.name || payment.user.email}
💰 <b>Amount:</b> $${payment.amount}
🔄 <b>Attempts:</b> ${newAttempts}/3
${blockedUntil ? `🚫 <b>Blocked until:</b> ${blockedUntil.toLocaleString()}` : ''}

❌ Payment rejected. User can try again.`

          await bot.editMessageText(messageId!, rejectMessage, undefined)
        }

        return NextResponse.json({ ok: true })
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Telegram webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

