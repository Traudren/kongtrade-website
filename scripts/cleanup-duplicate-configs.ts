import { prisma } from '../lib/db'

async function cleanupDuplicateConfigs() {
  try {
    console.log('🔍 Searching for users with multiple configurations...')

    // Находим всех пользователей
    const users = await prisma.user.findMany({
      include: {
        configs: true
      }
    })

    let cleanedCount = 0

    for (const user of users) {
      if (user.configs.length > 1) {
        console.log(`\n👤 User: ${user.email} (${user.name})`)
        console.log(`   Found ${user.configs.length} configurations`)

        // Сортируем по дате создания, оставляем самый новый
        const sortedConfigs = user.configs.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )

        const keepConfig = sortedConfigs[0]
        const deleteConfigs = sortedConfigs.slice(1)

        console.log(`   Keeping: ${keepConfig.exchange} (created: ${keepConfig.createdAt})`)

        // Удаляем старые конфиги
        for (const configToDelete of deleteConfigs) {
          await prisma.tradingConfig.delete({
            where: { id: configToDelete.id }
          })
          console.log(`   ❌ Deleted: ${configToDelete.exchange} (id: ${configToDelete.id})`)
          cleanedCount++
        }
      }
    }

    console.log(`\n✅ Cleanup completed!`)
    console.log(`   Total configurations deleted: ${cleanedCount}`)

  } catch (error) {
    console.error('❌ Error during cleanup:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

cleanupDuplicateConfigs()
  .then(() => {
    console.log('\n✨ Script finished successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error)
    process.exit(1)
  })

