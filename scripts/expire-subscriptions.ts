
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function expireSubscriptions() {
  try {
    console.log('Checking for expired subscriptions...')
    
    const now = new Date()
    
    // Находим активные подписки, которые истекли
    const expiredSubscriptions = await prisma.subscription.updateMany({
      where: {
        status: 'ACTIVE',
        endDate: {
          lte: now
        }
      },
      data: {
        status: 'EXPIRED'
      }
    })
    
    console.log(`Expired ${expiredSubscriptions.count} subscriptions`)
    
    // Дополнительно деактивируем боты для истекших подписок
    const expiredUsers = await prisma.subscription.findMany({
      where: {
        status: 'EXPIRED',
        endDate: {
          lte: now
        }
      },
      include: {
        user: {
          include: {
            configs: true
          }
        }
      }
    })
    
    for (const subscription of expiredUsers) {
      // Останавливаем все боты пользователя
      await prisma.tradingConfig.updateMany({
        where: {
          userId: subscription.userId,
          botStatus: 'running'
        },
        data: {
          botStatus: 'stopped'
        }
      })
    }
    
  } catch (error) {
    console.error('Error expiring subscriptions:', error)
  } finally {
    await prisma.$disconnect()
  }
}

expireSubscriptions()
