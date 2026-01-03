import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = "force-dynamic"

/**
 * API endpoint для обработки ошибок API ключей пользователя
 * Вызывается ботом при ошибках аутентификации или других критических ошибках
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, error, errorType } = await request.json()

    if (!userId || !error) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: userId, error' },
        { status: 400 }
      )
    }

    // Получаем текущую конфигурацию
    const config = await prisma.tradingConfig.findUnique({
      where: { userId }
    })

    if (!config) {
      return NextResponse.json(
        { success: false, error: 'User config not found' },
        { status: 404 }
      )
    }

    // Обновляем счетчик ошибок и последнюю ошибку
    const newErrorCount = config.errorCount + 1
    const shouldDeactivate = newErrorCount >= 3 // Деактивируем после 3 ошибок

    await prisma.tradingConfig.update({
      where: { userId },
      data: {
        errorCount: newErrorCount,
        lastError: `${errorType || 'Unknown'}: ${error}`,
        lastActivity: new Date(),
        ...(shouldDeactivate && {
          isActive: false,
          botStatus: 'error'
        })
      }
    })

    // Если критическая ошибка (неверные ключи) - деактивируем сразу
    const isCriticalError = errorType === 'INVALID_API_KEYS' || 
                           errorType === 'AUTHENTICATION_ERROR' ||
                           error.toLowerCase().includes('invalid api') ||
                           error.toLowerCase().includes('authentication')

    if (isCriticalError || shouldDeactivate) {
      await prisma.tradingConfig.update({
        where: { userId },
        data: {
          isActive: false,
          botStatus: 'error'
        }
      })

      // Обновляем подписку
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          subscriptions: {
            where: { status: 'ACTIVE' },
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      })

      if (user && user.subscriptions.length > 0) {
        await prisma.subscription.update({
          where: { id: user.subscriptions[0].id },
          data: {
            status: 'EXPIRED'
          }
        })
      }
    }

    return NextResponse.json({
      success: true,
      errorCount: newErrorCount,
      deactivated: isCriticalError || shouldDeactivate,
      message: isCriticalError || shouldDeactivate 
        ? 'User deactivated due to critical error' 
        : 'Error logged'
    })

  } catch (error) {
    console.error('User error handler error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

