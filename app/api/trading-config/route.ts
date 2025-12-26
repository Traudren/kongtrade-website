
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { saveConfigToFile } from '@/lib/config-generator'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { exchange, apiKey, apiSecret } = await request.json()

    if (!exchange || !apiKey || !apiSecret) {
      return NextResponse.json({ 
        message: 'Missing required fields: exchange, apiKey, apiSecret' 
      }, { status: 400 })
    }

    const userId = (session.user as any).id

    // Удаляем все существующие конфигурации перед созданием новой (разрешен только один конфиг)
    await prisma.tradingConfig.deleteMany({
      where: { userId }
    })

    // Создаем новую конфигурацию
    const config = await prisma.tradingConfig.create({
      data: {
        userId,
        exchange,
        apiKey,
        apiSecret,
        isActive: true
      }
    })

    // Сохраняем конфигурацию в файл (без telegram токенов)
    try {
      await saveConfigToFile(userId, {
        apiKey,
        apiSecret
      })
      console.log(`✅ Конфигурация сохранена в файл для пользователя ${userId}`)
    } catch (fileError) {
      console.error('Ошибка сохранения файла конфигурации:', fileError)
      // Не прерываем выполнение из-за ошибки файла
    }

    return NextResponse.json({
      message: 'Trading configuration saved successfully',
      config: {
        id: config.id,
        exchange: config.exchange,
        isActive: config.isActive,
        botStatus: config.botStatus
      }
    })

  } catch (error) {
    console.error('Trading config error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id

    const configs = await prisma.tradingConfig.findMany({
      where: { userId },
      select: {
        id: true,
        exchange: true,
        isActive: true,
        botStatus: true,
        lastActivity: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json({ configs })

  } catch (error) {
    console.error('Get trading configs error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const { searchParams } = new URL(request.url)
    const configId = searchParams.get('id')

    if (configId) {
      // Удаляем конкретный конфиг (если есть право)
      const config = await prisma.tradingConfig.findUnique({
        where: { id: configId }
      })

      if (!config || config.userId !== userId) {
        return NextResponse.json({ message: 'Config not found or access denied' }, { status: 404 })
      }

      await prisma.tradingConfig.delete({
        where: { id: configId }
      })
    } else {
      // Удаляем все конфиги пользователя
      await prisma.tradingConfig.deleteMany({
        where: { userId }
      })
    }

    return NextResponse.json({ message: 'Configuration deleted successfully' })

  } catch (error) {
    console.error('Delete trading config error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
