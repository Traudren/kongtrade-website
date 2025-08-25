
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

export const dynamic = "force-dynamic"

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    // ⚠️ УДАЛИТЕ ЭТОТ ENDPOINT ПОСЛЕ СОЗДАНИЯ АДМИНА!
    
    const hashedPassword = await bcrypt.hash('admin123', 10)
    
    const admin = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@kongtrade.com',
        password: hashedPassword,
        role: 'admin',
        emailVerified: new Date(),
      }
    })

    return NextResponse.json({ 
      message: 'Admin created successfully',
      email: 'admin@kongtrade.com',
      password: 'admin123'
    })
  } catch (error) {
    if ((error as any).code === 'P2002') {
      return NextResponse.json({ error: 'Admin already exists' }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Failed to create admin' }, { status: 500 })
  }
}
