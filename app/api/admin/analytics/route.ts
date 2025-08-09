
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Получаем аналитику за последние 30 дней
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalUsers,
      newUsersLast30Days,
      activeSubscriptions,
      totalRevenue,
      pendingPayments,
      referralStats
    ] = await Promise.all([
      // Общее количество пользователей
      prisma.user.count(),
      
      // Новые пользователи за 30 дней
      prisma.user.count({
        where: {
          createdAt: {
            gte: thirtyDaysAgo
          }
        }
      }),
      
      // Активные подписки
      prisma.subscription.count({
        where: {
          status: 'ACTIVE'
        }
      }),
      
      // Общий доход
      prisma.payment.aggregate({
        _sum: {
          amount: true
        },
        where: {
          status: 'COMPLETED'
        }
      }),
      
      // Ожидающие платежи
      prisma.payment.count({
        where: {
          status: 'PENDING'
        }
      }),
      
      // Статистика рефералов
      prisma.user.count({
        where: {
          referredBy: {
            not: null
          }
        }
      })
    ]);

    // Топ рефереры
    const topReferrers = await prisma.user.findMany({
      where: {
        totalEarnings: {
          gt: 0
        }
      },
      orderBy: {
        totalEarnings: 'desc'
      },
      take: 10,
      select: {
        id: true,
        name: true,
        email: true,
        totalEarnings: true,
        _count: {
          select: {
            referrals: true
          }
        }
      }
    });

    // Графики по дням
    const dailyStats = await prisma.$queryRaw`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as registrations,
        COALESCE(SUM(CASE WHEN p.status = 'COMPLETED' THEN p.amount ELSE 0 END), 0) as revenue
      FROM "User" u
      LEFT JOIN "Payment" p ON u.id = p.user_id AND DATE(p.created_at) = DATE(u.created_at)
      WHERE u.created_at >= ${thirtyDaysAgo}
      GROUP BY DATE(u.created_at)
      ORDER BY date DESC
    `;

    const analytics = {
      overview: {
        totalUsers,
        newUsersLast30Days,
        activeSubscriptions,
        totalRevenue: totalRevenue._sum.amount || 0,
        pendingPayments,
        totalReferrals: referralStats
      },
      topReferrers: topReferrers.map(user => ({
        ...user,
        referralCount: user._count.referrals
      })),
      dailyStats
    };

    return NextResponse.json(analytics);

  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
