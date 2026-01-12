

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// PATCH - обновить статус вывода (одобрить/отклонить)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { status } = await request.json()
    
    if (!['PROCESSING', 'COMPLETED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const { id } = await params
    const withdrawal = await prisma.referralWithdrawal.update({
      where: { id },
      data: {
        status,
        processedAt: new Date()
      },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    })

    return NextResponse.json({
      message: `Withdrawal ${status.toLowerCase()} successfully`,
      withdrawal
    })

  } catch (error) {
    console.error('Update withdrawal status error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

