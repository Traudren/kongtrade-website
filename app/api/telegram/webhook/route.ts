import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { TelegramBot } from '@/lib/telegram'
import fs from 'fs'
import path from 'path'

export const dynamic = "force-dynamic"

// Функция для создания содержимого конфигурационного файла
function createUserConfigContent(user: any, subscription: any, userConfig: any): string {
  const exchange = userConfig?.exchange || 'bybit'
  const exchangeName = exchange === 'binance' ? 'Бинанс' : 'Байбит'
  
  // Получаем tgToken из конфигурации (если есть)
  // Если нет в конфиге, используем дефолтный токен
  const tgToken = userConfig?.tgToken || '8159634915:AAGLifkNfM5iws0t8Lj0kdpVgG-IdKFNB54'
  const adminId = userConfig?.adminId || '5351584188'

  // Создаем содержимое файла в правильном формате
  const configContent = `# апи ключи от биржи ${exchangeName}.
api_key = '${userConfig?.apiKey || 'НЕ_УКАЗАН'}'
api_secret = '${userConfig?.apiSecret || 'НЕ_УКАЗАН'}'

# Токены телеграмм бота, в которых будут сигналы.
tg_token_main = "${tgToken}"

# id аккаунта на который будет приходить сообщение от ботов 
admin_id = "${adminId}"`

  return configContent
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Логируем входящий запрос для отладки
    console.log('📥 Telegram webhook received:', JSON.stringify(body, null, 2))

    // Обработка callback query от inline кнопок
    if (body.callback_query) {
      const callbackQuery = body.callback_query
      const callbackData = callbackQuery.data
      const messageId = callbackQuery.message?.message_id
      const chatId = callbackQuery.message?.chat?.id

      console.log('🔘 Callback query received:', {
        callbackData,
        messageId,
        chatId,
        from: callbackQuery.from
      })

      // Парсим paymentId из callback_data для определения бота
      let paymentId: string | null = null
      if (callbackData.startsWith('approve_payment_')) {
        paymentId = callbackData.replace('approve_payment_', '')
      } else if (callbackData.startsWith('reject_payment_')) {
        paymentId = callbackData.replace('reject_payment_', '')
      }

      // Получаем платеж для определения бота
      let botExchange = 'bybit' // По умолчанию
      if (paymentId) {
        const payment = await prisma.payment.findUnique({
          where: { id: paymentId },
          select: { paymentMethod: true }
        })
        if (payment) {
          botExchange = payment.paymentMethod?.toLowerCase() === 'binance' ? 'binance' : 'bybit'
        }
      }

      const telegram = new TelegramBot(botExchange)

      // Отвечаем на callback query
      const answerResult = await telegram.answerCallbackQuery(callbackQuery.id, 'Processing...')
      console.log('✅ Callback query answered:', answerResult)

      // Парсим callback_data
      if (callbackData.startsWith('approve_payment_') && paymentId) {
        console.log('✅ Approve payment requested:', paymentId)
        
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
          console.error('❌ Payment not found:', paymentId)
          await telegram.editMessageText(
            messageId!,
            '❌ Payment not found',
            undefined
          )
          return NextResponse.json({ ok: true })
        }

        // Если платеж уже обработан, но файл еще не отправлен - отправляем файл
        if (payment.status !== 'PENDING') {
          console.warn('⚠️ Payment already processed:', payment.status)
          
          // Проверяем, есть ли у пользователя конфигурация и отправляем файл если нужно
          if (payment.user.configs && payment.user.configs.length > 0) {
            const userConfig = payment.user.configs[0]
            try {
              const configContent = createUserConfigContent(payment.user, payment.subscription, userConfig)
              
              const successCaption = `✅ <b>Payment Already Approved</b>

👤 <b>User:</b> ${payment.user.name || payment.user.email}
💰 <b>Amount:</b> $${payment.amount}
💎 <b>Subscription:</b> ${payment.subscription?.planName} - ${payment.subscription?.status}
📅 <b>Period:</b> ${payment.subscription?.planType === 'monthly' ? '30 days' : '90 days'}

📎 Config file:`

              const sendFileResult = await telegram.sendDocument(configContent, successCaption, 'user.txt')
              console.log('✅ Config file sent (already processed):', sendFileResult)
              
              // Удаляем старое сообщение
              await telegram.deleteMessage(messageId!)
            } catch (error) {
              console.error('Error sending file for already processed payment:', error)
            }
          }
          
          return NextResponse.json({ ok: true })
        }

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

          // Сбрасываем счетчик попыток при успешной оплате
          await prisma.user.update({
            where: { id: payment.userId },
            data: { paymentAttempts: 0 }
          })
        }

        // Обновляем сообщение - убираем кнопки, оставляем файл
        try {
          // Telegram не позволяет редактировать сообщения с документами
          // Поэтому просто обновляем текст через editMessageText (кнопки уберутся автоматически)
          // Но так как это сообщение с документом, нужно использовать editMessageCaption
          const successMessage = `✅ <b>Payment Approved!</b>

👤 <b>User:</b> ${payment.user.name || payment.user.email}
💰 <b>Amount:</b> $${payment.amount}
💎 <b>Subscription:</b> ${payment.subscription?.planName} - ACTIVE
📅 <b>Period:</b> ${payment.subscription?.planType === 'monthly' ? '30 days' : '90 days'}

✅ Subscription activated.`

          // Обновляем подпись к файлу (убираем кнопки)
          const editResult = await telegram.editMessageCaption(messageId!, successMessage)
          console.log('✅ Message caption updated (buttons removed):', editResult)
        } catch (fileError) {
          console.error('❌ Error creating/sending config file:', fileError)
          console.error('Error type:', fileError instanceof Error ? fileError.constructor.name : typeof fileError)
          console.error('Error message:', fileError instanceof Error ? fileError.message : String(fileError))
          console.error('Error stack:', fileError instanceof Error ? fileError.stack : 'No stack trace')
          
          // Если ошибка с файлом, хотя бы обновляем сообщение
          const errorMessage = `✅ <b>Payment Approved!</b>

👤 <b>User:</b> ${payment.user.name || payment.user.email}
💰 <b>Amount:</b> $${payment.amount}
💎 <b>Subscription:</b> ${payment.subscription?.planName} - ACTIVE

⚠️ Error creating config file. Please check logs.`

          await telegram.editMessageText(messageId!, errorMessage, undefined)
        }

        return NextResponse.json({ ok: true })

      } else if (callbackData.startsWith('reject_payment_')) {
        const paymentId = callbackData.replace('reject_payment_', '')
        
        console.log('❌ Reject payment requested:', paymentId)
        
        // Получаем платеж
        const payment = await prisma.payment.findUnique({
          where: { id: paymentId },
          include: {
            user: true
          }
        })

        if (!payment) {
          console.error('❌ Payment not found:', paymentId)
          await telegram.editMessageText(
            messageId!,
            '❌ Payment not found',
            undefined
          )
          return NextResponse.json({ ok: true })
        }

        if (payment.status !== 'PENDING') {
          console.warn('⚠️ Payment already processed:', payment.status)
          await telegram.editMessageText(
            messageId!,
            `⚠️ Payment already processed. Status: ${payment.status}`,
            undefined
          )
          return NextResponse.json({ ok: true })
        }

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

          // Удаляем сообщение при отклонении
          const deleteResult = await telegram.deleteMessage(messageId!)
          console.log('✅ Message deleted after rejection:', deleteResult)
        }

        return NextResponse.json({ ok: true })
      }
    }

    // Если это не callback_query, просто возвращаем ok
    console.log('ℹ️ Non-callback query received, ignoring')
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('❌ Telegram webhook error:', error)
    console.error('Error details:', error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

