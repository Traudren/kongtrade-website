
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

export const dynamic = "force-dynamic"

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { userId, action } = await request.json()

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Update bot status for user's active config
    const newStatus = action === 'start' ? 'running' : 'stopped'
    
    await prisma.tradingConfig.updateMany({
      where: { 
        userId,
        isActive: true
      },
      data: { 
        botStatus: newStatus,
        lastActivity: new Date()
      }
    })

    return NextResponse.json({ 
      message: `Bot ${action} command executed successfully`,
      status: newStatus 
    })
  } catch (error) {
    console.error('Bot control error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
