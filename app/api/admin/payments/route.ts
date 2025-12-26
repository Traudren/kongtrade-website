
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { TelegramBot } from '@/lib/telegram'
import fs from 'fs'
import path from 'path'

export const dynamic = "force-dynamic"

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const url = new URL(request.url)
    const status = url.searchParams.get('status')

    let whereClause: any = {}
    if (status && status !== 'all') {
      if (status === 'active') {
        whereClause = { subscription: { status: 'ACTIVE' } }
      } else if (status === 'expired') {
        whereClause = { subscription: { status: 'EXPIRED' } }
      } else {
        whereClause = { status: status.toUpperCase() }
      }
    }

    const payments = await prisma.payment.findMany({
      where: whereClause,
      include: {
        user: {
          include: {
            configs: true
          }
        },
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

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { paymentId, status } = await request.json()

    if (!paymentId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Update payment status
    const payment = await prisma.payment.update({
      where: { id: paymentId },
      data: { status },
      include: { 
        subscription: true,
        user: {
          include: {
            configs: true
          }
        }
      }
    })

    // If payment is completed, activate subscription
    if (status === 'COMPLETED' && payment.subscription) {
      const startDate = new Date()
      const endDate = new Date()
      
      // Calculate end date based on plan type
      if (payment.subscription.planType === 'monthly') {
        endDate.setMonth(endDate.getMonth() + 1)
      } else if (payment.subscription.planType === 'quarterly') {
        endDate.setMonth(endDate.getMonth() + 3)
      }

      await prisma.subscription.update({
        where: { id: payment.subscription.id },
        data: {
          status: 'ACTIVE',
          startDate,
          endDate
        }
      })

      // Сохраняем конфигурацию пользователя в файл
      await saveUserConfigToFile(payment.user)
    }

    return NextResponse.json({ message: 'Payment status updated successfully' })
  } catch (error) {
    console.error('Admin payment update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function saveUserConfigToFile(user: any) {
  try {
    const configContent = `# апи ключи от биржи ${user.configs?.[0]?.exchange === 'binance' ? 'Бинанс' : 'Байбит'}.
api_key = '${user.configs?.[0]?.apiKey || 'НЕ_УКАЗАН'}'
api_secret = '${user.configs?.[0]?.apiSecret || 'НЕ_УКАЗАН'}'

# Токены телеграмм бота, в которых будут сигналы.
tg_token_main = "8159634915:AAGLifkNfM5iws0t8Lj0kdpVgG-IdKFNB54"

# id аккаунта на который будет приходить сообщение от ботов 
admin_id = "5351584188"`

    // Создаем директорию для конфигураций, если её нет
    const configDir = path.join(process.cwd(), 'user_configs')
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true })
    }
    
    const fileName = `${user.name || user.email.split('@')[0]}_config.txt`
    const filePath = path.join(configDir, fileName)
    
    fs.writeFileSync(filePath, configContent, 'utf8')
    
    console.log(`Configuration saved for user ${user.email} at ${filePath}`)
  } catch (error) {
    console.error('Error saving user config:', error)
  }
}
