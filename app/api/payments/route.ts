
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { TelegramBot } from '@/lib/telegram'

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { amount, paymentMethod, walletAddress, txid, planName, planType } = await request.json()

    if (!amount || !paymentMethod || !walletAddress || !txid) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
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

    // Отправляем уведомление в Telegram с конфигурацией пользователя
    try {
      if (payment.subscription && payment.user.configs && payment.user.configs.length > 0) {
        const userConfig = payment.user.configs[0] // Берем первую конфигурацию
        
        // Выбираем телеграм-бота в зависимости от paymentMethod (на какой кошелек оплатили)
        // paymentMethod может быть 'binance' или 'bybit'
        const telegramBotExchange = paymentMethod.toLowerCase() === 'binance' ? 'binance' : 'bybit'
        const telegram = new TelegramBot(telegramBotExchange)
        
        await telegram.notifyNewPayment(payment.user, payment.subscription, payment, userConfig)
      }
    } catch (telegramError) {
      console.error('Telegram notification error:', telegramError)
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
