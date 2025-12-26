
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateExistingUsers() {
  try {
    console.log('Updating existing users with referral codes...')
    
    // Найти всех пользователей без referralCode
    const usersWithoutReferralCode = await prisma.user.findMany({
      where: {
        referralCode: null
      }
    })
    
    console.log(`Found ${usersWithoutReferralCode.length} users without referral codes`)
    
    // Обновить каждого пользователя
    for (const user of usersWithoutReferralCode) {
      const referralCode = 'REF-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8).toUpperCase()
      
      await prisma.user.update({
        where: { id: user.id },
        data: { referralCode }
      })
      
      console.log(`Updated user ${user.email} with referral code: ${referralCode}`)
    }
    
    console.log('All existing users updated successfully!')
    
  } catch (error) {
    console.error('Error updating existing users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateExistingUsers()
