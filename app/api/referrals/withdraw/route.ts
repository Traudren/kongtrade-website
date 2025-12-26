

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

export const dynamic = "force-dynamic"

const prisma = new PrismaClient()

// POST - запрос на вывод реферальных средств
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { amount, walletAddress } = await request.json()

    if (!amount || !walletAddress) {
      return NextResponse.json({ error: 'Amount and wallet address are required' }, { status: 400 })
    }

    // Получаем настройки реферальной системы
    const settings = await prisma.referralSettings.findFirst()
    const minAmount = settings?.minWithdrawAmount || 10

    if (amount < minAmount) {
      return NextResponse.json({ 
        error: `Minimum withdrawal amount is $${minAmount}` 
      }, { status: 400 })
    }

    // Проверяем доступный баланс
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        referralEarnings: {
          where: { status: 'PAID' }
        },
        referralWithdrawals: {
          where: { status: { in: ['PENDING', 'PROCESSING', 'COMPLETED'] } }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const totalEarnings = user.referralEarnings.reduce((sum, earning) => sum + earning.amount, 0)
    const totalWithdrawn = user.referralWithdrawals.reduce((sum, withdrawal) => sum + withdrawal.amount, 0)
    const availableBalance = totalEarnings - totalWithdrawn

    if (amount > availableBalance) {
      return NextResponse.json({ 
        error: `Insufficient balance. Available: $${availableBalance.toFixed(2)}` 
      }, { status: 400 })
    }

    // Создаем запрос на вывод
    const withdrawal = await prisma.referralWithdrawal.create({
      data: {
        userId: session.user.id,
        amount,
        walletAddress,
        status: 'PENDING'
      }
    })

    return NextResponse.json({
      message: 'Withdrawal request created successfully',
      withdrawal
    })

  } catch (error) {
    console.error('Withdrawal request error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

