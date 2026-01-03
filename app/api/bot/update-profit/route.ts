import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = "force-dynamic"

/**
 * API endpoint для обновления профита пользователя после закрытия сделки
 * Вызывается ботом после каждой закрытой сделки
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, profitPercent, tradeType } = await request.json()

    if (!userId || profitPercent === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: userId, profitPercent' },
        { status: 400 }
      )
    }

    // Получаем текущую конфигурацию
    const config = await prisma.tradingConfig.findUnique({
      where: { userId },
      include: {
        user: {
          include: {
            subscriptions: {
              where: { status: 'ACTIVE' },
              orderBy: { createdAt: 'desc' },
              take: 1
            }
          }
        }
      }
    })

    if (!config) {
      return NextResponse.json(
        { success: false, error: 'User config not found' },
        { status: 404 }
      )
    }

    // Обновляем профит и статистику
    const newProfitPercent = config.currentProfitPercent + profitPercent
    const isProfitable = profitPercent > 0
    const isLosing = profitPercent < 0

    await prisma.tradingConfig.update({
      where: { userId },
      data: {
        currentProfitPercent: newProfitPercent,
        totalTrades: { increment: 1 },
        profitableTrades: isProfitable ? { increment: 1 } : undefined,
        losingTrades: isLosing ? { increment: 1 } : undefined,
        lastTradeDate: new Date(),
        lastActivity: new Date()
      }
    })

    // Проверяем, достигнут ли profit_limit
    let shouldDeactivate = false
    let deactivationReason = ''

    if (config.profitLimit !== null && newProfitPercent >= config.profitLimit) {
      shouldDeactivate = true
      deactivationReason = `Profit limit reached: ${newProfitPercent.toFixed(2)}% >= ${config.profitLimit}%`
    }

    // Если нужно деактивировать
    if (shouldDeactivate) {
      await prisma.tradingConfig.update({
        where: { userId },
        data: {
          isActive: false,
          botStatus: 'stopped'
        }
      })

      // Обновляем подписку
      if (config.user.subscriptions.length > 0) {
        await prisma.subscription.update({
          where: { id: config.user.subscriptions[0].id },
          data: {
            status: 'EXPIRED'
          }
        })
      }
    }

    return NextResponse.json({
      success: true,
      currentProfitPercent: newProfitPercent,
      profitLimit: config.profitLimit,
      deactivated: shouldDeactivate,
      deactivationReason: shouldDeactivate ? deactivationReason : null
    })

  } catch (error) {
    console.error('Update profit error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

