

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Создаем базовые настройки реферальной системы
  const existingSettings = await prisma.referralSettings.findFirst()
  
  if (!existingSettings) {
    await prisma.referralSettings.create({
      data: {
        level1Percentage: 0.10, // 10% с первого уровня
        level2Percentage: 0.05, // 5% со второго уровня
        minWithdrawAmount: 10.0, // Минимальная сумма для вывода $10
        isActive: true
      }
    })
    console.log('✅ Referral settings initialized successfully')
  } else {
    console.log('✅ Referral settings already exist')
  }
}

main()
  .catch((e) => {
    console.error('❌ Error initializing referral settings:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

