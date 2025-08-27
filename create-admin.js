
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('🚀 Создаю администратора...');
    
    // Проверяем есть ли уже админ
    const existingAdmin = await prisma.user.findFirst({
      where: { email: 'admin@kongtrade.com' }
    });
    
    if (existingAdmin) {
      console.log('✅ Администратор уже существует!');
      console.log('📧 Email: admin@kongtrade.com');
      console.log('🔑 Password: Admin123!');
      return;
    }
    
    // Хешируем пароль
    const hashedPassword = await bcrypt.hash('Admin123!', 12);
    
    // Генерируем уникальный реферальный код
    const referralCode = `ADMIN${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
    // Создаем администратора
    const admin = await prisma.user.create({
      data: {
        name: 'Administrator',
        email: 'admin@kongtrade.com',
        password: hashedPassword,
        role: 'admin',
        referralCode: referralCode,
        emailVerified: new Date(),
      }
    });
    
    console.log('🎉 Администратор успешно создан!');
    console.log('📧 Email: admin@kongtrade.com');
    console.log('🔑 Password: Admin123!');
    console.log('👤 Role: admin');
    console.log('🔗 Referral Code:', referralCode);
    
  } catch (error) {
    console.error('❌ Ошибка создания администратора:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
