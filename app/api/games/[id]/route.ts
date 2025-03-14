import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getUserFromCookie } from "@/lib/auth"

// Get a specific game
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const gameId = Number.parseInt(params.id)

    const game = await prisma.game.findUnique({
      where: { id: gameId },
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
    })

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 })
    }

    const user = await getUserFromCookie()

    const attendees = game.attendees.filter((a) => !a.waitlist)
    const waitlist = game.attendees.filter((a) => a.waitlist)

    const isAttending = user ? game.attendees.some((a) => a.userId === user.id && !a.waitlist) : false

    const isOnWaitlist = user ? game.attendees.some((a) => a.userId === user.id && a.waitlist) : false

    const gameWithDetails = {
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

    return NextResponse.json(gameWithDetails)
  } catch (error) {
    console.error("Error fetching game:", error)
    return NextResponse.json({ error: "Failed to fetch game" }, { status: 500 })
  }
}

