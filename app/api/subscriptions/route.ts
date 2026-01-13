
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

export const dynamic = "force-dynamic"

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const subscriptions = await prisma.subscription.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        planName: true,
        planType: true,
        price: true,
        status: true,
        startDate: true,
        endDate: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ subscriptions })
  } catch (error) {
    console.error('Get subscriptions error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { planName, planType, price } = await request.json()

    if (!planName || !planType || !price) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Создаем подписку
    const endDate = new Date()
    if (planType === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1)
    } else if (planType === 'quarterly') {
      endDate.setMonth(endDate.getMonth() + 3)
    }

    const subscription = await prisma.subscription.create({
      data: {
        userId: session.user.id,
        planName,
        planType,
        price,
        status: 'PENDING',
        endDate
      }
    })

    return NextResponse.json({
      message: 'Subscription created successfully',
      subscription
    })

  } catch (error) {
    console.error('Create subscription error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Функция для активации подписки и начисления реферальных бонусов
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { subscriptionId, status } = await request.json()

    if (!subscriptionId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Обновляем подписку
    const subscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status,
        startDate: status === 'ACTIVE' ? new Date() : undefined
      },
      include: {
        user: {
          include: {
            referrer: true
          }
        }
      }
    })

    // Если подписка активирована, начисляем реферальные бонусы
    if (status === 'ACTIVE' && subscription.user.referrer) {
      const settings = await prisma.referralSettings.findFirst()
      const level1Percentage = settings?.level1Percentage || 0.10

      // Бонус для первого уровня (прямого реферера)
      const level1Bonus = subscription.price * level1Percentage

      await prisma.referralEarning.create({
        data: {
          userId: subscription.user.referrer.id,
          referralId: subscription.user.id,
          subscriptionId: subscription.id,
          amount: level1Bonus,
          percentage: level1Percentage,
          status: 'PAID'
        }
      })

      // Обновляем общий заработок реферера
      await prisma.user.update({
        where: { id: subscription.user.referrer.id },
        data: {
          totalEarnings: {
            increment: level1Bonus
          }
        }
      })

      // Проверяем второй уровень рефералов
      if (subscription.user.referrer.referredBy) {
        const level2User = await prisma.user.findUnique({
          where: { id: subscription.user.referrer.referredBy }
        })

        if (level2User) {
          const level2Percentage = settings?.level2Percentage || 0.05
          const level2Bonus = subscription.price * level2Percentage

          await prisma.referralEarning.create({
            data: {
              userId: level2User.id,
              referralId: subscription.user.id,
              subscriptionId: subscription.id,
              amount: level2Bonus,
              percentage: level2Percentage,
              status: 'PAID'
            }
          })

          await prisma.user.update({
            where: { id: level2User.id },
            data: {
              totalEarnings: {
                increment: level2Bonus
              }
            }
          })
        }
      }
    }

    return NextResponse.json({
      message: 'Subscription updated successfully',
      subscription
    })

  } catch (error) {
    console.error('Update subscription error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
