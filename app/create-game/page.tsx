"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useGames } from "@/contexts/game-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AddressForm } from "@/components/address-form"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function CreateGame() {
  const router = useRouter()
  const { user } = useAuth()
  const { createGame, loading, error } = useGames()
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [hour, setHour] = useState("8")
  const [minute, setMinute] = useState("00")
  const [ampm, setAmpm] = useState("PM")
  const [maxPlayers, setMaxPlayers] = useState("8")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [zipCode, setZipCode] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !date) return

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

    try {
      await createGame({
        dateTime: gameDate.toISOString(),
        maxPlayers: parseInt(maxPlayers),
        address,
        city,
        state,
        zipCode,
      })
      router.push("/")
    } catch (error) {
      console.error("Failed to create game:", error)
    }
  }

  const handleAddressChange = (field: string, value: string) => {
    switch (field) {
      case "address":
        setAddress(value)
        break
      case "city":
        setCity(value)
        break
      case "state":
        setState(value)
        break
      case "zipCode":
        setZipCode(value)
        break
    }
  }

  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString())
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"))

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to create a game</h1>
          <Button onClick={() => router.push("/login")}>Login</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Create New Game</h1>

        <form onSubmit={handleSubmit} className="max-w-md space-y-6">
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
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Select a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  disabled={(date) => date < new Date()}
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

              <Clock className="h-4 w-4 text-muted-foreground" />
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

          <AddressForm
            address={address}
            city={city}
            state={state}
            zipCode={zipCode}
            onChange={handleAddressChange}
          />

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <Button type="submit" disabled={loading || !date}>
            {loading ? "Creating..." : "Create Game"}
          </Button>
        </form>
      </main>
    </div>
  )
}

