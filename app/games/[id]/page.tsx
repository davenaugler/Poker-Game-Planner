"use client"

import { useEffect, useState } from "react"
import { useGames } from "@/contexts/game-context"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { Calendar, Clock, MapPin, Users, Save, Edit2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function ManageGame({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user } = useAuth()
  const { games, loading, error, fetchGames, updateGame } = useGames()
  const [hasFetched, setHasFetched] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  // Form state
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [hour, setHour] = useState("8")
  const [minute, setMinute] = useState("00")
  const [ampm, setAmpm] = useState("PM")
  const [maxPlayers, setMaxPlayers] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [zipCode, setZipCode] = useState("")

  useEffect(() => {
    if (user && !hasFetched) {
      fetchGames()
      setHasFetched(true)
    }
  }, [fetchGames, user, hasFetched])

  const game = games.find((g) => g.id === params.id)

  useEffect(() => {
    if (game) {
      const gameDate = new Date(game.dateTime)
      setDate(gameDate)
      
      const hours = gameDate.getHours()
      const minutes = gameDate.getMinutes()
      
      // Convert 24-hour format to 12-hour format
      const isPM = hours >= 12
      const hour12 = hours % 12 || 12
      
      setHour(hour12.toString())
      setMinute(minutes.toString().padStart(2, "0"))
      setAmpm(isPM ? "PM" : "AM")
      
      setMaxPlayers(game.maxPlayers.toString())
      setAddress(game.address)
      setCity(game.city)
      setState(game.state)
      setZipCode(game.zipCode)
    }
  }, [game])

  const handleSave = async () => {
    if (!game || !date) return

    setIsSaving(true)
    setEditError(null)

    try {
      // Create a new date with the selected date and time
      const gameDate = new Date(date)
      const hourInt = parseInt(hour)
      const minuteInt = parseInt(minute)

      // Convert 12-hour format to 24-hour format
      let hours24 = hourInt
      if (ampm === "PM" && hourInt < 12) {
        hours24 += 12
      } else if (ampm === "AM" && hourInt === 12) {
        hours24 = 0
      }

      gameDate.setHours(hours24, minuteInt, 0, 0)

      await updateGame(game.id, {
        dateTime: gameDate.toISOString(),
        maxPlayers: parseInt(maxPlayers),
        address,
        city,
        state,
        zipCode,
      })

      setIsEditing(false)
    } catch (error) {
      if (error instanceof Error) {
        setEditError(error.message)
      } else {
        setEditError("Failed to update game")
      }
    } finally {
      setIsSaving(false)
    }
  }

  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString())
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"))

  // Handle loading states
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center">Loading game details...</div>
        </main>
      </div>
    )
  }

  // Handle error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center text-destructive">{error}</div>
        </main>
      </div>
    )
  }

  // Handle game not found
  if (!game) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Game not found</h1>
            <Button onClick={() => router.push("/")}>Return Home</Button>
          </div>
        </main>
      </div>
    )
  }

  // Handle unauthorized access
  if (!game.isHost) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Unauthorized</h1>
            <p className="text-muted-foreground mb-4">You do not have permission to manage this game.</p>
            <Button onClick={() => router.push("/")}>Return Home</Button>
          </div>
        </main>
      </div>
    )
  }

  const gameDate = new Date(game.dateTime)
  const formattedDate = format(gameDate, "MMM d, yyyy")
  const formattedTime = format(gameDate, "h:mm a")

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Manage Game</h1>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} variant="outline">
              <Edit2 className="h-4 w-4 mr-2" />
              Edit Details
            </Button>
          ) : (
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          )}
        </div>

        {editError && (
          <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-md">
            {editError}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Game Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Game Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : "Select a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Start Time</label>
                    <div className="flex items-center space-x-2">
                      <Select value={hour} onValueChange={setHour}>
                        <SelectTrigger className="w-[80px]">
                          <SelectValue placeholder="Hour" />
                        </SelectTrigger>
                        <SelectContent>
                          {hours.map((h) => (
                            <SelectItem key={h} value={h}>
                              {h}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <span>:</span>

                      <Select value={minute} onValueChange={setMinute}>
                        <SelectTrigger className="w-[80px]">
                          <SelectValue placeholder="Min" />
                        </SelectTrigger>
                        <SelectContent>
                          {minutes.map((m) => (
                            <SelectItem key={m} value={m}>
                              {m}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select value={ampm} onValueChange={setAmpm}>
                        <SelectTrigger className="w-[80px]">
                          <SelectValue placeholder="AM/PM" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AM">AM</SelectItem>
                          <SelectItem value="PM">PM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Max Players</label>
                    <Select value={maxPlayers} onValueChange={setMaxPlayers}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select number of players" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 11 }, (_, i) => (i + 2).toString()).map((num) => (
                          <SelectItem key={num} value={num}>
                            {num} Players
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Address</label>
                    <Input value={address} onChange={(e) => setAddress(e.target.value)} />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">City</label>
                      <Input value={city} onChange={(e) => setCity(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">State</label>
                      <Input value={state} onChange={(e) => setState(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">ZIP Code</label>
                      <Input value={zipCode} onChange={(e) => setZipCode(e.target.value)} />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{formattedDate}</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{formattedTime}</span>
                  </div>
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                    <div>
                      <div>{game.address}</div>
                      <div>{game.city} {game.state} {game.zipCode}</div>
                    </div>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Users className="h-4 w-4 mr-2" />
                    <span>{game.attendeesCount} / {game.maxPlayers} Players</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Players</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Confirmed ({game.attendees.length})</h3>
                  <div className="space-y-2">
                    {game.attendees.map((attendee) => (
                      <div key={attendee.id} className="flex justify-between items-center p-2 rounded-md bg-muted">
                        <span>
                          {attendee.firstName} {attendee.lastName}
                          {attendee.userId === game.hostId && (
                            <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                              Host
                            </span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {game.waitlist.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">Waitlist ({game.waitlist.length})</h3>
                    <div className="space-y-2">
                      {game.waitlist.map((attendee) => (
                        <div key={attendee.id} className="flex justify-between items-center p-2 rounded-md bg-muted">
                          <span>
                            {attendee.firstName} {attendee.lastName}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
} 