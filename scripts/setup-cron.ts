
import { PrismaClient } from '@prisma/client'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)
const prisma = new PrismaClient()

async function setupAutomation() {
  try {
    console.log('🔧 Setting up automation...')
    
    // Create script for subscription expiration
    const expireScript = `#!/bin/bash
cd ${process.cwd()}
npm run expire-subscriptions >> /var/log/kongtrade-expire.log 2>&1
`
    
    // Save script
    const fs = require('fs').promises
    await fs.writeFile('/tmp/expire-subscriptions.sh', expireScript)
    await execAsync('chmod +x /tmp/expire-subscriptions.sh')
    
    console.log('✅ Subscription expiration script created')
    
    // Add cron job (daily at 00:00)
    const cronJob = '0 0 * * * /tmp/expire-subscriptions.sh'
    
    try {
      await execAsync(`(crontab -l 2>/dev/null; echo "${cronJob}") | crontab -`)
      console.log('✅ Cron job added: daily at 00:00')
    } catch (error) {
      console.log('⚠️  Failed to add cron job:', error)
      console.log('   Add manually: ', cronJob)
    }
    
    console.log('')
    console.log('📋 For manual execution use:')
    console.log('   npm run expire-subscriptions')
    
  } catch (error) {
    console.error('❌ Automation setup error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

setupAutomation()
