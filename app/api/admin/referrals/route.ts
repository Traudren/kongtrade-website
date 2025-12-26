

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

export const dynamic = "force-dynamic"

const prisma = new PrismaClient()

// GET - админ статистика по рефералам
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Общая статистика
    const totalUsers = await prisma.user.count()
    const usersWithReferrals = await prisma.user.count({
      where: { referredBy: { not: null } }
    })

    const totalEarnings = await prisma.referralEarning.aggregate({
      _sum: { amount: true },
      where: { status: 'PAID' }
    })

    const pendingWithdrawals = await prisma.referralWithdrawal.findMany({
      where: { status: 'PENDING' },
      include: {
        user: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Топ рефереров
    const topReferrers = await prisma.user.findMany({
      where: {
        referrals: {
          some: {}
        }
      },
      include: {
        _count: {
          select: { referrals: true }
        },
        referralEarnings: {
          where: { status: 'PAID' }
        }
      },
      orderBy: {
        referrals: {
          _count: 'desc'
        }
      },
      take: 10
    })

    return NextResponse.json({
      stats: {
        totalUsers,
        usersWithReferrals,
        referralPercentage: totalUsers > 0 ? (usersWithReferrals / totalUsers * 100).toFixed(1) : 0,
        totalEarningsPaid: totalEarnings._sum.amount || 0,
        pendingWithdrawalsCount: pendingWithdrawals.length,
        pendingWithdrawalsAmount: pendingWithdrawals.reduce((sum, w) => sum + w.amount, 0)
      },
      pendingWithdrawals,
      topReferrers: topReferrers.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        referralCount: user._count.referrals,
        totalEarnings: user.referralEarnings.reduce((sum, earning) => sum + earning.amount, 0)
      }))
    })

  } catch (error) {
    console.error('Admin referral stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

