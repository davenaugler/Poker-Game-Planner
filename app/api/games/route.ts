import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getUserFromCookie } from "@/lib/auth"

// Get all games
export async function GET(request: NextRequest) {
  try {
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
    console.error("Error fetching games:", error)
    return NextResponse.json({ error: "Failed to fetch games" }, { status: 500 })
  }
}

// Create a new game
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromCookie()

    if (!user) {
      return NextResponse.json({ error: "You must be logged in to create a game" }, { status: 401 })
    }

    const { dateTime, maxPlayers, address, city, state, zipCode } = await request.json()

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
    return NextResponse.json({ error: "Failed to create game" }, { status: 500 })
  }
}

