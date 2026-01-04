
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
    // Проверяем подключение к базе данных
    if (!prisma) {
      console.error('Prisma client is not initialized')
      return NextResponse.json(
        { error: 'Database connection error' },
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
    console.error('Error message:', error.message)
    console.error('Error code:', error.code)
    
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
    if (error.code === 'P1001' || error.code === 'P1017' || error.message?.includes('Can\'t reach database') || error.message?.includes('connection')) {
      console.error('Database connection error:', error.message)
      return NextResponse.json(
        { error: 'Database connection error. Please try again later.' },
        { status: 500 }
      )
    }
    
    // Логируем полную информацию об ошибке для отладки
    const errorDetails = {
      message: error.message,
      code: error.code,
      name: error.name,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }
    
    console.error('Full error details:', JSON.stringify(errorDetails, null, 2))
    
    return NextResponse.json(
      { 
        error: 'Internal server error. Please try again.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        code: error.code || 'UNKNOWN'
      },
      { status: 500 }
    )
  }
}
