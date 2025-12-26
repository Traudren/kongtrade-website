
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function backupDatabase() {
  try {
    console.log('Starting database backup...');
    
    // Backup users
    const users = await prisma.user.findMany({
      include: {
        subscriptions: true,
        referrals: true,
        referralEarnings: true,
        referralWithdrawals: true
      }
    });
    
    // Backup payments
    const payments = await prisma.payment.findMany();
    
    // Backup configurations
    const configs = await prisma.tradingConfig.findMany();
    
    // Backup referral settings
    const referralSettings = await prisma.referralSettings.findMany();
    
    const backup = {
      users,
      payments,
      configs,
      referralSettings,
      timestamp: new Date().toISOString()
    };
    
    fs.writeFileSync(`backup-${Date.now()}.json`, JSON.stringify(backup, null, 2));
    console.log('Backup completed successfully!');
    
  } catch (error) {
    console.error('Backup failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

backupDatabase();
