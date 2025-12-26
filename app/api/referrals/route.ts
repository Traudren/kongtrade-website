

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

export const dynamic = "force-dynamic"

const prisma = new PrismaClient()

// GET - получить реферальную статистику пользователя
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        referrals: {
          include: {
            subscriptions: {
              where: { status: 'ACTIVE' }
            }
          }
        },
        referralEarnings: {
          include: {
            subscription: {
              include: {
                user: {
                  select: { name: true, email: true }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        referralWithdrawals: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Подсчет статистики с поинтами
    const totalReferrals = user.referrals.length
    const paidReferrals = user.referrals.filter(ref => ref.subscriptions.length > 0).length
    
    // Поинты = количество рефералов с активными подписками
    const points = paidReferrals

    return NextResponse.json({
      referralCode: user.referralCode,
      referralLink: `${process.env.NEXTAUTH_URL}/register?ref=${user.referralCode}`,
      stats: {
        totalReferrals,
        paidReferrals,
        points
      },
      referrals: user.referrals.map(ref => ({
        id: ref.id,
        name: ref.name,
        email: ref.email,
        createdAt: ref.createdAt,
        hasPurchased: ref.subscriptions.length > 0
      }))
    })

  } catch (error) {
    console.error('Referral stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

