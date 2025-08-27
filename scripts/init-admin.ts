
import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function initializeAdmin() {
  try {
    console.log('🚀 Инициализация админа...')
    
    const adminEmail = 'admin@kongtrade.com'
    const adminPassword = 'KongTrade2024!'
    
    // Проверяем, существует ли уже админ
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    })
    
    if (existingAdmin) {
      console.log('✅ Админ уже существует!')
      console.log('Email:', adminEmail)
      console.log('ID:', existingAdmin.id)
      return existingAdmin
    }
    
    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(adminPassword, 12)
    
    // Создаем админа
    const admin = await prisma.user.create({
      data: {
        name: 'KongTrade Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        referralCode: 'ADMIN-' + Date.now(),
        emailVerified: new Date() // Сразу подтверждаем email
      }
    })
    
    console.log('✅ Админ успешно created!')
    console.log('📧 Email:', adminEmail)
    console.log('🔑 Password:', adminPassword)
    console.log('🆔 Admin ID:', admin.id)
    console.log('')
    console.log('🔐 Data для входа в админ панель:')
    console.log(`   URL: http://localhost:3000/dashboard/admin`)
    console.log(`   Email: ${adminEmail}`)
    console.log(`   Password: ${adminPassword}`)
    
    return admin
    
  } catch (error) {
    console.error('❌ Error createdия админа:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Запускаем только если файл выполняется напрямую
if (require.main === module) {
  initializeAdmin()
    .then(() => {
      console.log('✅ Инициализация завершена')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Error инициализации:', error)
      process.exit(1)
    })
}

export { initializeAdmin }
