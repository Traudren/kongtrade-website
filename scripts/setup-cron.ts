
import { PrismaClient } from '@prisma/client'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)
const prisma = new PrismaClient()

async function setupAutomation() {
  try {
    console.log('🔧 Настройка автоматизации...')
    
    // Создаем скрипт для запуска истечения подписок
    const expireScript = `#!/bin/bash
cd ${process.cwd()}
npm run expire-subscriptions >> /var/log/kongtrade-expire.log 2>&1
`
    
    // Сохраняем скрипт
    const fs = require('fs').promises
    await fs.writeFile('/tmp/expire-subscriptions.sh', expireScript)
    await execAsync('chmod +x /tmp/expire-subscriptions.sh')
    
    console.log('✅ Скрипт истечения подписок создан')
    
    // Добавляем задачу в cron (каждый день в 00:00)
    const cronJob = '0 0 * * * /tmp/expire-subscriptions.sh'
    
    try {
      await execAsync(`(crontab -l 2>/dev/null; echo "${cronJob}") | crontab -`)
      console.log('✅ Cron задача добавлена: каждый день в 00:00')
    } catch (error) {
      console.log('⚠️  Не удалось добавить cron задачу:', error)
      console.log('   Добавьте вручную: ', cronJob)
    }
    
    console.log('')
    console.log('📋 Для ручного запуска используйте:')
    console.log('   npm run expire-subscriptions')
    
  } catch (error) {
    console.error('❌ Ошибка настройки автоматизации:', error)
  } finally {
    await prisma.$disconnect()
  }
}

setupAutomation()
