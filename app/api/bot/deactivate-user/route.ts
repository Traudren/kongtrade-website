import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = "force-dynamic"

/**
 * API endpoint для деактивации пользователя
 * Вызывается ботом при достижении лимитов или ошибках
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, reason } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: userId' },
        { status: 400 }
      )
    }

    // Находим конфигурацию пользователя
    const config = await prisma.tradingConfig.findFirst({
      where: { userId } as any,
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
        { success: false, error: 'Trading config not found' },
        { status: 404 }
      )
    }

    // Деактивируем конфигурацию
    await prisma.tradingConfig.update({
      where: { id: config.id },
      data: {
        isActive: false,
        botStatus: 'stopped',
        lastError: reason || 'Deactivated by bot'
      } as any
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

    return NextResponse.json({
      success: true,
      message: 'User deactivated successfully',
      userId,
      reason: reason || 'Unknown reason'
    })

  } catch (error) {
    console.error('Deactivate user error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

