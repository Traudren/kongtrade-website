
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

export const dynamic = "force-dynamic"

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const [totalUsers, activeSubscriptions, pendingPayments, runningBots, allPayments] = await Promise.all([
      prisma.user.count(),
      prisma.subscription.count({ where: { status: 'ACTIVE' } }),
      prisma.payment.count({ where: { status: 'PENDING' } }),
      prisma.tradingConfig.count({ where: { botStatus: 'running' } }),
      prisma.payment.findMany({ where: { status: 'COMPLETED' } })
    ])

    // Calculate revenue
    const totalRevenue = allPayments.reduce((sum, payment) => sum + payment.amount, 0)
    
    // Calculate monthly revenue (current month)
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthlyPayments = allPayments.filter(payment => 
      new Date(payment.createdAt) >= startOfMonth
    )
    const monthlyRevenue = monthlyPayments.reduce((sum, payment) => sum + payment.amount, 0)

    const stats = {
      totalUsers,
      activeSubscriptions,
      pendingPayments,
      runningBots,
      totalRevenue,
      monthlyRevenue
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
