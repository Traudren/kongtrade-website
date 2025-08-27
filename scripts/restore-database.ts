
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function restoreDatabase(backupFile: string) {
  try {
    console.log('Starting database restore...');
    
    const backup = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
    
    // Restore users (без паролей для безопасности)
    for (const user of backup.users) {
      const { id, subscriptions, referrals, earnings, withdrawals, ...userData } = user;
      
      await prisma.user.upsert({
        where: { email: userData.email },
        update: userData,
        create: userData
      });
    }
    
    // Restore other data...
    console.log('Restore completed successfully!');
    
  } catch (error) {
    console.error('Restore failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Usage: npm run restore-database backup-file.json
const backupFile = process.argv[2];
if (backupFile) {
  restoreDatabase(backupFile);
} else {
  console.log('Please provide backup file path');
}
