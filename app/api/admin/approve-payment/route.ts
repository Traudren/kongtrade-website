
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { TelegramBot } from '@/lib/telegram'
import { generateConfigFile } from '@/lib/config-generator'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { paymentId } = await request.json()

    if (!paymentId) {
      return NextResponse.json({ message: 'Missing paymentId' }, { status: 400 })
    }

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
      return NextResponse.json({ message: 'Payment not found' }, { status: 404 })
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
      
      if (payment.subscription.planType === 'monthly') {
        endDate.setMonth(endDate.getMonth() + 1)
      } else if (payment.subscription.planType === 'quarterly') {
        endDate.setMonth(endDate.getMonth() + 3)
      }

      await prisma.subscription.update({
        where: { id: payment.subscription.id },
        data: {
          status: 'ACTIVE',
          startDate: startDate,
          endDate: endDate
        }
      })
    }

    // Отправляем уведомление в Telegram
    try {
      const telegram = new TelegramBot()
      
      // Получаем конфигурационные data пользователя
      const userConfig = payment.user.configs[0]
      const configData = generateConfigFile({
        apiKey: userConfig?.apiKey || undefined,
        apiSecret: userConfig?.apiSecret || undefined,
        tgToken: userConfig?.botStatus === 'running' ? 'активен' : 'не активен',
        adminId: '5351584188'
      })

      await telegram.notifyNewPayment(
        payment.user,
        payment.subscription,
        payment,
        configData
      )
    } catch (telegramError) {
      console.error('Telegram notification error:', telegramError)
      // Не прерываем выполнение из-за errors Telegram
    }

    return NextResponse.json({ 
      message: 'Payment approved and subscription activated',
      payment: {
        id: payment.id,
        status: 'COMPLETED',
        subscription: {
          ...payment.subscription,
          status: 'ACTIVE'
        }
      }
    })

  } catch (error) {
    console.error('Approve payment error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
