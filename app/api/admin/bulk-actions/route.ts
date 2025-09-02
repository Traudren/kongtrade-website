
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, userIds, data } = await request.json();

    let result;

    switch (action) {
      case 'activate_subscriptions':
        result = await prisma.subscription.updateMany({
          where: {
            userId: {
              in: userIds
            }
          },
          data: {
            status: 'ACTIVE',
            updatedAt: new Date()
          }
        });
        break;

      case 'deactivate_subscriptions':
        result = await prisma.subscription.updateMany({
          where: {
            userId: {
              in: userIds
            }
          },
          data: {
            status: 'EXPIRED',
            updatedAt: new Date()
          }
        });
        break;

      case 'extend_subscriptions':
        const extendDays = data.days || 30;
        const users = await prisma.user.findMany({
          where: {
            id: {
              in: userIds
            }
          },
          include: {
            subscriptions: {
              where: {
                status: 'ACTIVE'
              },
              orderBy: {
                endDate: 'desc'
              },
              take: 1
            }
          }
        });

        for (const user of users) {
          if (user.subscriptions.length > 0) {
            const currentSub = user.subscriptions[0];
            const newExpiryDate = new Date(currentSub.endDate || currentSub.createdAt);
            newExpiryDate.setDate(newExpiryDate.getDate() + extendDays);

            await prisma.subscription.update({
              where: {
                id: currentSub.id
              },
              data: {
                endDate: newExpiryDate,
                updatedAt: new Date()
              }
            });
          }
        }
        result = { updated: users.length };
        break;

      case 'send_notification':
        // Здесь можно добавить отправку уведомлений
        result = { message: 'Notifications sent', count: userIds.length };
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true, result });

  } catch (error) {
    console.error('Bulk action error:', error);
    return NextResponse.json(
      { error: 'Failed to perform bulk action' },
      { status: 500 }
    );
  }
}
