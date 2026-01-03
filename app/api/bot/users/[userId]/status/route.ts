import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = "force-dynamic"

/**
 * API endpoint для обновления статуса бота для конкретного пользователя
 * Используется ботом для обновления статуса работы
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // Проверка API ключа
    const authHeader = request.headers.get('authorization')
    const apiKey = process.env.BOT_API_KEY
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Bot API key not configured' },
        { status: 500 }
      )
    }

    if (!authHeader || authHeader !== `Bearer ${apiKey}`) {
      return NextResponse.json(
        { error: 'Unauthorized. Invalid API key' },
        { status: 401 }
      )
    }

    const { userId } = params
    const body = await request.json()
    const { bot_status, last_activity } = body

    if (!bot_status) {
      return NextResponse.json(
        { error: 'bot_status is required' },
        { status: 400 }
      )
    }

    // Обновляем статус бота для всех конфигураций пользователя
    const updateData: any = {
      botStatus: bot_status
    }

    if (last_activity) {
      updateData.lastActivity = new Date(last_activity)
    }

    const updated = await prisma.tradingConfig.updateMany({
      where: {
        userId: userId
      },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      message: 'Bot status updated',
      updated_count: updated.count
    })

  } catch (error) {
    console.error('Update bot status error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

