import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { comparePasswords, setAuthCookie } from "@/lib/auth"
import { Prisma } from "@prisma/client"
import { ValidationError } from "joi"
import { rateLimit } from "@/lib/rate-limit"

const authLimiter = rateLimit({
  interval: 15 * 60 * 1000, // 15 minutes
  uniqueTokenPerInterval: 500
});

export async function POST(request: NextRequest) {
  try {
    const identifier = request.ip ?? 'anonymous';
    await authLimiter.check(identifier, 5); // 5 login attempts per 15 minutes
    const { email, password } = await request.json()

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Verify password
    const passwordValid = await comparePasswords(password, user.password)

    if (!passwordValid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Set auth cookie
    await setAuthCookie(user.id)

    return NextResponse.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    })
  } catch (error) {
    console.error("Login error:", error)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ error: "Database error occurred" }, { status: 503 })
    }
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: (error as ValidationError).message }, { status: 400 })
    }
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

