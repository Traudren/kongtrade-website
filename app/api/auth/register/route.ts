
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export const dynamic = "force-dynamic"

// Генерация случайного реферального кода
function generateReferralCode(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result
}

// Функция для генерации уникального реферального кода
async function generateUniqueReferralCode(): Promise<string> {
  let code = generateReferralCode()
  let isUnique = false
  let attempts = 0

  while (!isUnique && attempts < 10) {
    const existingUser = await prisma.user.findUnique({
      where: { referralCode: code }
    })
    
    if (!existingUser) {
      isUnique = true
    } else {
      code = generateReferralCode()
      attempts++
    }
  }

  return code
}

export async function POST(request: NextRequest) {
  try {
    // Проверка подключения к БД перед началом работы
    try {
      await prisma.$queryRaw`SELECT 1`
    } catch (dbError: any) {
      console.error('❌ Database connection test failed')
      console.error('Error code:', dbError.code)
      console.error('Error message:', dbError.message)
      console.error('DATABASE_URL exists:', !!process.env.DATABASE_URL)
      console.error('DATABASE_URL format:', process.env.DATABASE_URL?.includes('pooler') ? 'Has pooler' : 'No pooler')
      console.error('DATABASE_URL port:', process.env.DATABASE_URL?.includes(':6543') ? '6543 (correct)' : process.env.DATABASE_URL?.includes(':5432') ? '5432 (WRONG for Vercel!)' : 'unknown')
      console.error('VERCEL env:', process.env.VERCEL)
      console.error('NODE_ENV:', process.env.NODE_ENV)
      
      return NextResponse.json(
        { 
          error: 'Database connection error. Please try again later.',
          details: process.env.NODE_ENV === 'development' ? dbError.message : undefined
        },
        { status: 500 }
      )
    }

    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user already exists by email
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUserByEmail) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Check if user already exists by name (никнейм)
    const existingUserByName = await prisma.user.findFirst({
      where: { name }
    })

    if (existingUserByName) {
        return NextResponse.json(
        { error: 'This username is already taken. Please choose another one.' },
          { status: 400 }
        )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Generate unique referral code
    const uniqueReferralCode = await generateUniqueReferralCode()

    // Create user (без реферальной системы)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        referralCode: uniqueReferralCode
      }
    })

    return NextResponse.json(
      { 
        message: 'User created successfully', 
        userId: user.id
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Registration error:', error)
    console.error('Error stack:', error.stack)
    console.error('Error code:', error.code)
    console.error('Error message:', error.message)
    
    // Более детальная обработка ошибок
    if (error.code === 'P2002') {
      // Prisma unique constraint violation
      const target = error.meta?.target || []
      if (target.includes('email')) {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 400 }
        )
      }
      if (target.includes('name')) {
        return NextResponse.json(
          { error: 'This username is already taken. Please choose another one.' },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }
    
    // Проверка ошибок подключения к базе данных
    const connectionErrorCodes = ['P1001', 'P1017', 'P1000', 'P1008', 'P1011']
    const connectionErrorMessages = [
      'Can\'t reach database',
      'connection',
      'Connection',
      'timeout',
      'Timeout',
      'ECONNREFUSED',
      'ENOTFOUND',
      'ETIMEDOUT'
    ]
    
    if (
      connectionErrorCodes.includes(error.code) || 
      connectionErrorMessages.some(msg => error.message?.includes(msg))
    ) {
      console.error('Database connection error:', error.message)
      console.error('Error code:', error.code)
      console.error('DATABASE_URL configured:', !!process.env.DATABASE_URL)
      
      return NextResponse.json(
        { 
          error: 'Database connection error. Please try again later.',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Internal server error. Please try again.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}
