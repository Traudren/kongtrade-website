
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { saveConfigToFile } from '@/lib/config-generator'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { exchange, apiKey, apiSecret, tgToken, adminId } = await request.json()

    if (!exchange || !apiKey || !apiSecret) {
      return NextResponse.json({ 
        message: 'Missing required fields: exchange, apiKey, apiSecret' 
      }, { status: 400 })
    }

    const userId = (session.user as any).id

    // Update or create configuration
    const config = await prisma.tradingConfig.upsert({
      where: {
        userId_exchange: {
          userId,
          exchange
        }
      },
      update: {
        apiKey,
        apiSecret,
        isActive: true,
        updatedAt: new Date()
      },
      create: {
        userId,
        exchange,
        apiKey,
        apiSecret,
        isActive: true
      }
    })

    // Generate configuration content
    try {
      await saveConfigToFile(userId, {
        apiKey,
        apiSecret,
        tgToken,
        adminId: adminId || '5351584188'
      })
      console.log(`✅ Configuration generated for user ${userId}`)
    } catch (fileError) {
      console.error('Error generating configuration file:', fileError)
      // Don't interrupt execution due to file errors
    }

    return NextResponse.json({
      message: 'Trading configuration saved successfully',
      config: {
        id: config.id,
        exchange: config.exchange,
        isActive: config.isActive,
        botStatus: config.botStatus
      }
    })

  } catch (error) {
    console.error('Trading config error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id

    const configs = await prisma.tradingConfig.findMany({
      where: { userId },
      select: {
        id: true,
        exchange: true,
        isActive: true,
        botStatus: true,
        lastActivity: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json({ configs })

  } catch (error) {
    console.error('Get trading configs error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
