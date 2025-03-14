import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getUserFromCookie } from "@/lib/auth"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromCookie()

    if (!user) {
      return NextResponse.json({ error: "You must be logged in to leave a game" }, { status: 401 })
    }

    const gameId = Number.parseInt(params.id)

    // Check if user is attending
    const attendee = await prisma.attendee.findFirst({
      where: {
        gameId,
        userId: user.id,
      },
    })

    if (!attendee) {
      return NextResponse.json({ error: "You are not signed up for this game" }, { status: 400 })
    }

    // Delete attendee record
    await prisma.attendee.delete({
      where: {
        id: attendee.id,
      },
    })

    // If user was not on waitlist, promote the first waitlisted user
    if (!attendee.waitlist) {
      const game = await prisma.game.findUnique({
        where: { id: gameId },
        include: {
          attendees: {
            where: { waitlist: true },
            orderBy: { signedUpAt: "asc" },
            take: 1,
          },
        },
      })

      if (game && game.attendees.length > 0) {
        await prisma.attendee.update({
          where: { id: game.attendees[0].id },
          data: { waitlist: false },
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error leaving game:", error)
    return NextResponse.json({ error: "Failed to leave game" }, { status: 500 })
  }
}

