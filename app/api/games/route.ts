import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { getUserFromCookie } from "@/lib/auth"
import { z } from "zod"
import { rateLimit } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'

// Add environment variable validation
const requiredEnvVars = {
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  NODE_ENV: process.env.NODE_ENV
}

Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!value) throw new Error(`Missing required environment variable: ${key}`)
})

// Get all games
export async function GET(request: NextRequest) {
  const startTime = Date.now()
  try {
    logger.info('Fetching games', { 
      path: request.url,
      method: request.method 
    })
    const searchParams = request.nextUrl.searchParams
    const past = searchParams.get("past") === "true"

    const now = new Date()

    const games = await prisma.game.findMany({
      where: {
        dateTime: past ? { lt: now } : { gte: now },
      },
      include: {
        host: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        attendees: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: {
        dateTime: past ? "desc" : "asc",
      },
    })

    const user = await getUserFromCookie()

    const gamesWithUserStatus = games.map((game) => {
      const attendees = game.attendees.filter((a) => !a.waitlist)
      const waitlist = game.attendees.filter((a) => a.waitlist)

      const isAttending = user ? game.attendees.some((a) => a.userId === user.id && !a.waitlist) : false

      const isOnWaitlist = user ? game.attendees.some((a) => a.userId === user.id && a.waitlist) : false

      return {
        id: game.id,
        hostId: game.hostId,
        host: game.host,
        dateTime: game.dateTime,
        maxPlayers: game.maxPlayers,
        address: game.address,
        city: game.city,
        state: game.state,
        zipCode: game.zipCode,
        attendeesCount: attendees.length,
        openSpots: Math.max(0, game.maxPlayers - attendees.length),
        waitlistCount: waitlist.length,
        isAttending,
        isOnWaitlist,
        isHost: user ? game.hostId === user.id : false,
        attendees: attendees.map((a) => ({
          id: a.id,
          userId: a.userId,
          firstName: a.user.firstName,
          lastName: a.user.lastName,
        })),
        waitlist: waitlist.map((a) => ({
          id: a.id,
          userId: a.userId,
          firstName: a.user.firstName,
          lastName: a.user.lastName,
        })),
      }
    })

    return NextResponse.json(gamesWithUserStatus)
  } catch (error) {
    logger.error('Error fetching games', { 
      error,
      path: request.url,
      duration: Date.now() - startTime
    })
    return NextResponse.json({ error: "Failed to fetch games" }, { status: 500 })
  }
}

// Add input validation using Zod
const createGameSchema = z.object({
  dateTime: z.string().datetime(),
  maxPlayers: z.number().min(2).max(12),
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/)
})

// Add rate limiting middleware
const gamesLimiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500
})

// Create a new game
export async function POST(request: NextRequest) {
  try {
    const identifier = request.ip ?? 'anonymous'
    await gamesLimiter.check(identifier, 10) // 10 requests per minute

    const user = await getUserFromCookie()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const result = createGameSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues }, { status: 400 })
    }

    const { dateTime, maxPlayers, address, city, state, zipCode } = body

    const game = await prisma.game.create({
      data: {
        hostId: user.id,
        dateTime: new Date(dateTime),
        maxPlayers,
        address,
        city,
        state,
        zipCode,
      },
    })

    return NextResponse.json(game, { status: 201 })
  } catch (error) {
    console.error("Error creating game:", error)
    // More specific error messages
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Add security headers middleware
export async function middleware() {
  const response = NextResponse.next()
  
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin')
  response.headers.set('Content-Security-Policy', "default-src 'self'")
  
  return response
}

