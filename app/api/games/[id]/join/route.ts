import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getUserFromCookie } from "@/lib/auth"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromCookie()

    if (!user) {
      return NextResponse.json({ error: "You must be logged in to join a game" }, { status: 401 })
    }

    const gameId = Number.parseInt(params.id)

    // Check if game exists
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        attendees: true,
      },
    })

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 })
    }

    // Check if game is in the future
    const now = new Date()
    const gameTime = new Date(game.dateTime)
    const fiveMinutesBeforeGame = new Date(gameTime.getTime() - 5 * 60 * 1000)

    if (now > fiveMinutesBeforeGame) {
      return NextResponse.json({ error: "Cannot join a game less than 5 minutes before it starts" }, { status: 400 })
    }

    // Check if user is already attending
    const existingAttendee = await prisma.attendee.findFirst({
      where: {
        gameId,
        userId: user.id,
      },
    })

    if (existingAttendee) {
      return NextResponse.json({ error: "You are already signed up for this game" }, { status: 400 })
    }

    // Check if game is full
    const attendees = game.attendees.filter((a) => !a.waitlist)
    const isGameFull = attendees.length >= game.maxPlayers

    // Create attendee record
    const attendee = await prisma.attendee.create({
      data: {
        gameId,
        userId: user.id,
        waitlist: isGameFull,
      },
    })

    return NextResponse.json({
      success: true,
      attendee,
      onWaitlist: isGameFull,
    })
  } catch (error) {
    console.error("Error joining game:", error)
    return NextResponse.json({ error: "Failed to join game" }, { status: 500 })
  }
}

