
import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    console.log('Creating admin user...')
    
    const adminEmail = 'admin@kongtrade.com'
    const adminPassword = 'KongTrade2024!'
    
    // Проверяем, существует ли уже админ
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    })
    
    if (existingAdmin) {
      console.log('Admin user already exists!')
      return
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
        referralCode: 'ADMIN-' + Date.now()
      }
    })
    
    console.log('Admin user created successfully!')
    console.log('Email:', adminEmail)
    console.log('Password:', adminPassword)
    console.log('Admin ID:', admin.id)
    
  } catch (error) {
    console.error('Error creating admin:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()
