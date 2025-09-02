
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const dynamic = "force-dynamic"

// Generate random referral code
function generateReferralCode(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result
}

// Function to generate unique referral code
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
    const { name, email, password, referralCode } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    // Check referral code if provided
    let referrerId = null
    if (referralCode) {
      const referrer = await prisma.user.findUnique({
        where: { referralCode }
      })

      if (!referrer) {
        return NextResponse.json(
          { error: 'Invalid referral code' },
          { status: 400 }
        )
      }

      referrerId = referrer.id
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Generate unique referral code
    const uniqueReferralCode = await generateUniqueReferralCode()

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        referredBy: referrerId,
        referralCode: uniqueReferralCode
      }
    })

    return NextResponse.json(
      { 
        message: 'User created successfully', 
        userId: user.id,
        referralApplied: !!referrerId
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
