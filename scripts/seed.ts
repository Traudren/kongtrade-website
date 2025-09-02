
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Check if test user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: 'john@doe.com' }
  })

  if (!existingUser) {
    // Create test user with admin privileges
    const hashedPassword = await bcrypt.hash('johndoe123', 12)
    
    const testUser = await prisma.user.create({
      data: {
        name: 'John Doe',
        email: 'john@doe.com',
        password: hashedPassword,
        role: 'admin',
        emailVerified: new Date()
      }
    })
    
    console.log('✅ Created test admin user:', testUser.email)
  } else {
    console.log('👤 Test admin user already exists')
  }

  // You can add more seed data here if needed
  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
