
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { TelegramBot } from '@/lib/telegram'

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    console.log('📥 POST /api/payments - Request received')
    
    const session = await getServerSession(authOptions)
    console.log('👤 Session exists:', !!session)
    console.log('👤 User ID:', session?.user?.id)
    
    if (!session?.user) {
      console.error('❌ Unauthorized - no session')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log('📦 Request body:', { 
      amount: body.amount, 
      paymentMethod: body.paymentMethod, 
      planName: body.planName, 
      planType: body.planType,
      hasTxid: !!body.txid,
      hasWalletAddress: !!body.walletAddress
    })
    
    const { amount, paymentMethod, walletAddress, txid, planName, planType } = body

    if (!amount || !paymentMethod || !walletAddress || !txid) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Получаем пользователя для проверки блокировки
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Проверяем блокировку пользователя
    if (user.blockedUntil && new Date(user.blockedUntil) > new Date()) {
      return NextResponse.json(
        { 
          error: `You are blocked until ${new Date(user.blockedUntil).toLocaleString()}. Please try again later.`,
          blockedUntil: user.blockedUntil
        },
        { status: 403 }
      )
    }

    // Проверяем, есть ли у пользователя активный платеж со статусом PENDING
    const existingPendingPayment = await prisma.payment.findFirst({
      where: {
        userId: session.user.id,
        status: 'PENDING'
      },
      include: {
        subscription: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (existingPendingPayment) {
      return NextResponse.json(
        { 
          error: 'You have a pending payment. Please wait for the current payment to be processed before creating a new one.',
          pendingPaymentId: existingPendingPayment.id,
          pendingPaymentAmount: existingPendingPayment.amount
        },
        { status: 409 } // 409 Conflict
      )
    }

    // Create subscription first if plan details are provided
    let subscriptionId = null
    if (planName && planType) {
      const subscription = await prisma.subscription.create({
        data: {
          userId: session.user.id,
          planName,
          planType,
          price: amount,
          status: 'PENDING'
        }
      })
      subscriptionId = subscription.id
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        userId: session.user.id,
        subscriptionId,
        amount,
        paymentMethod,
        walletAddress,
        txid,
        status: 'PENDING'
      },
      include: {
        subscription: true,
        user: {
          include: {
            configs: true
          }
        }
      }
    })

    // Отправляем уведомление в Telegram с кнопками подтверждения/отмены
    try {
      console.log('📨 Attempting to send Telegram notification...')
      console.log('Payment subscription exists:', !!payment.subscription)
      console.log('User configs exists:', !!payment.user.configs)
      console.log('User configs length:', payment.user.configs?.length || 0)
      
      if (payment.subscription && payment.user.configs && payment.user.configs.length > 0) {
        const userConfig = payment.user.configs[0] // Берем первую конфигурацию
        console.log('✅ User config found, exchange:', userConfig.exchange)
        
        // Выбираем телеграм-бота в зависимости от paymentMethod (на какой кошелек оплатили)
        // paymentMethod может быть 'binance' или 'bybit'
        const telegramBotExchange = paymentMethod.toLowerCase() === 'binance' ? 'binance' : 'bybit'
        console.log('🤖 Using Telegram bot for exchange:', telegramBotExchange)
        const telegram = new TelegramBot(telegramBotExchange)
        
        const result = await telegram.notifyNewPayment(payment.user, payment.subscription, payment, userConfig)
        console.log('📥 Telegram notification result:', result)
        
        // Сохраняем ID сообщения в базе данных
        if (result.success && result.messageId) {
          await prisma.payment.update({
            where: { id: payment.id },
            data: { telegramMessageId: result.messageId.toString() }
          })
          console.log('✅ Message ID saved to database')
        } else {
          console.error('❌ Failed to send Telegram notification:', result)
        }
      } else {
        console.warn('⚠️ Cannot send Telegram notification: missing subscription or user config')
        console.warn('Subscription:', !!payment.subscription)
        console.warn('User configs:', payment.user.configs?.length || 0)
      }
    } catch (telegramError) {
      console.error('❌ Telegram notification error:', telegramError)
      if (telegramError instanceof Error) {
        console.error('Error message:', telegramError.message)
        console.error('Error stack:', telegramError.stack)
      }
      // Не прерываем выполнение, если уведомление не отправилось
    }

    return NextResponse.json(
      { message: 'Payment submitted successfully', paymentId: payment.id },
      { status: 201 }
    )
  } catch (error) {
    console.error('Payment API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const payments = await prisma.payment.findMany({
      where: { userId: session.user.id },
      include: {
        subscription: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ payments })
  } catch (error) {
    console.error('Get payments error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
