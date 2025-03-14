import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getUserFromCookie } from "@/lib/auth"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromCookie()

    if (!user) {
      return NextResponse.json({ error: "You must be logged in to remove an attendee" }, { status: 401 })
    }

    const gameId = Number.parseInt(params.id)
    const { attendeeId } = await request.json()

    // Check if game exists and user is the host
    const game = await prisma.game.findUnique({
      where: { id: gameId },
    })

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 })
    }

    if (game.hostId !== user.id) {
      return NextResponse.json({ error: "Only the host can remove attendees" }, { status: 403 })
    }

    // Get attendee to check if they're on waitlist
    const attendee = await prisma.attendee.findUnique({
      where: { id: attendeeId },
    })

    if (!attendee || attendee.gameId !== gameId) {
      return NextResponse.json({ error: "Attendee not found" }, { status: 404 })
    }

    // Delete attendee record
    await prisma.attendee.delete({
      where: {
        id: attendeeId,
      },
    })

    // If attendee was not on waitlist, promote the first waitlisted user
    if (!attendee.waitlist) {
      const waitlistedAttendee = await prisma.attendee.findFirst({
        where: {
          gameId,
          waitlist: true,
        },
        orderBy: {
          signedUpAt: "asc",
        },
      })

      if (waitlistedAttendee) {
        await prisma.attendee.update({
          where: { id: waitlistedAttendee.id },
          data: { waitlist: false },
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error removing attendee:", error)
    return NextResponse.json({ error: "Failed to remove attendee" }, { status: 500 })
  }
}

