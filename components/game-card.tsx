"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Users } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useGames, type Game } from "@/contexts/game-context"
import { useState } from "react"
import { format } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import Link from "next/link"

interface GameCardProps {
  game: Game
  isPast?: boolean
}

export function GameCard({ game, isPast = false }: GameCardProps) {
  const { user } = useAuth()
  const { joinGame, leaveGame, removeAttendee } = useGames()
  const [isLoading, setIsLoading] = useState(false)
  const [showAttendees, setShowAttendees] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const gameDate = new Date(game.dateTime)
  const formattedDate = format(gameDate, "MMM d, yyyy")
  const formattedTime = format(gameDate, "h:mm a")

  const isGameInFuture = new Date() < gameDate
  const canJoin = isGameInFuture && new Date() < new Date(gameDate.getTime() - 5 * 60 * 1000)

  const handleJoin = async () => {
    if (!user) return

    setIsLoading(true)
    setError(null)
    try {
      await joinGame(game.id)
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("Failed to join game")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleLeave = async () => {
    if (!user) return

    setIsLoading(true)
    setError(null)
    try {
      await leaveGame(game.id)
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("Failed to leave game")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveAttendee = async (attendeeId: number) => {
    if (!user || !game.isHost) return

    setIsLoading(true)
    setError(null)
    try {
      await removeAttendee(game.id, attendeeId)
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("Failed to remove attendee")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Card className="h-full">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl">{formattedDate}</CardTitle>
            {game.openSpots === 0 ? (
              <Badge variant="destructive">Full</Badge>
            ) : (
              <Badge variant="default" className="bg-primary">
                {game.openSpots} {game.openSpots === 1 ? "Spot" : "Spots"} Open
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center text-muted-foreground">
            <Clock className="h-4 w-4 mr-2" />
            <span>{formattedTime}</span>
          </div>
          <div className="flex items-start text-sm">
            <MapPin className="mr-2 h-4 w-4 mt-0.5 text-muted-foreground" />
            <div>
              <div>{game.address}</div>
              <div>{game.city}, {game.state} {game.zipCode}</div>
            </div>
          </div>
          <div className="flex items-center text-muted-foreground">
            <Users className="h-4 w-4 mr-2" />
            <span>
              {game.attendeesCount} / {game.maxPlayers} Players
            </span>
          </div>
          <div className="flex items-center text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            <span>
              Hosted by {game.host.firstName} {game.host.lastName}
            </span>
          </div>

          {game.waitlistCount > 0 && (
            <div className="text-sm text-muted-foreground">
              {game.waitlistCount} {game.waitlistCount === 1 ? "person" : "people"} on waitlist
            </div>
          )}

          {error && <div className="text-sm text-destructive mt-2">{error}</div>}
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button className="w-full" variant="outline" onClick={() => setShowAttendees(true)}>
            View Attendees
          </Button>

          {!isPast && user && (
            <>
              {game.isAttending ? (
                <Button className="w-full" variant="destructive" onClick={handleLeave} disabled={isLoading}>
                  Leave Game
                </Button>
              ) : game.isOnWaitlist ? (
                <Button className="w-full" variant="destructive" onClick={handleLeave} disabled={isLoading}>
                  Leave Waitlist
                </Button>
              ) : canJoin ? (
                <Button className="w-full" onClick={handleJoin} disabled={isLoading}>
                  {game.openSpots > 0 ? "Join Game" : "Join Waitlist"}
                </Button>
              ) : null}
            </>
          )}

          {game.isHost && (
            <Link href={`/games/${game.id}`}>
              <Button variant="outline">Manage Game</Button>
            </Link>
          )}
        </CardFooter>
      </Card>

      <Dialog open={showAttendees} onOpenChange={setShowAttendees}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Game Attendees</DialogTitle>
            <DialogDescription>
              {formattedDate} at {formattedTime}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">
                Players ({game.attendees.length}/{game.maxPlayers})
              </h3>
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {game.attendees.map((attendee) => (
                    <div key={attendee.id} className="flex justify-between items-center p-2 rounded-md bg-muted">
                      <span>
                        {attendee.firstName} {attendee.lastName}
                        {attendee.userId === game.hostId && (
                          <Badge variant="outline" className="ml-2">
                            Host
                          </Badge>
                        )}
                      </span>

                      {game.isHost && attendee.userId !== game.hostId && !isPast && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveAttendee(attendee.id)}
                          disabled={isLoading}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {game.waitlist.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">Waitlist ({game.waitlist.length})</h3>
                <ScrollArea className="h-[100px]">
                  <div className="space-y-2">
                    {game.waitlist.map((attendee) => (
                      <div key={attendee.id} className="flex justify-between items-center p-2 rounded-md bg-muted">
                        <span>
                          {attendee.firstName} {attendee.lastName}
                        </span>

                        {game.isHost && !isPast && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveAttendee(attendee.id)}
                            disabled={isLoading}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAttendees(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

