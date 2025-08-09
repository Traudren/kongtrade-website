

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

export const dynamic = "force-dynamic"

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { planId, points } = await request.json()

    if (!planId || !points) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Получаем пользователя с рефералами
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        referrals: {
          include: {
            subscriptions: {
              where: { status: 'ACTIVE' }
            }
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Подсчитываем доступные поинты
    const paidReferrals = user.referrals.filter(ref => ref.subscriptions.length > 0).length
    const availablePoints = paidReferrals

    if (availablePoints < points) {
      return NextResponse.json({ 
        error: `Insufficient points. You have ${availablePoints} points but need ${points}.` 
      }, { status: 400 })
    }

    // Определяем план и его параметры
    const planMap = {
      'basic': { name: 'Basic', price: 50 },
      'professional': { name: 'Professional', price: 80 },
      'unlimited': { name: 'Unlimited', price: 120 }
    }

    const planInfo = planMap[planId as keyof typeof planMap]
    if (!planInfo) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    // Создаем подписку
    const endDate = new Date()
    endDate.setMonth(endDate.getMonth() + 1) // 1 месяц

    const subscription = await prisma.subscription.create({
      data: {
        userId: session.user.id,
        planName: planInfo.name,
        planType: 'monthly',
        price: planInfo.price,
        status: 'ACTIVE', // Сразу активируем подписку за поинты
        startDate: new Date(),
        endDate
      }
    })

    // Записываем использование поинтов (можно создать отдельную таблицу для этого)
    // Пока что просто возвращаем успешный результат

    return NextResponse.json({
      message: 'Subscription purchased successfully with points',
      subscription
    })

  } catch (error) {
    console.error('Purchase with points error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
