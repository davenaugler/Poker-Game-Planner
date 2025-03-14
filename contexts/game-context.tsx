"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

type Host = {
  id: number
  firstName: string
  lastName: string
}

type Attendee = {
  id: number
  userId: number
  firstName: string
  lastName: string
}

export type Game = {
  id: number
  hostId: number
  host: Host
  dateTime: string
  maxPlayers: number
  address: string
  city: string
  state: string
  zipCode: string
  attendeesCount: number
  openSpots: number
  waitlistCount: number
  isAttending: boolean
  isOnWaitlist: boolean
  isHost: boolean
  attendees: Attendee[]
  waitlist: Attendee[]
}

type GameContextType = {
  games: Game[]
  pastGames: Game[]
  loading: boolean
  error: string | null
  fetchGames: () => Promise<void>
  fetchPastGames: () => Promise<void>
  createGame: (gameData: {
    dateTime: string
    maxPlayers: number
    address: string
    city: string
    state: string
    zipCode: string
  }) => Promise<void>
  joinGame: (gameId: number) => Promise<void>
  leaveGame: (gameId: number) => Promise<void>
  removeAttendee: (gameId: number, attendeeId: number) => Promise<void>
}

const GameContext = createContext<GameContextType | undefined>(undefined)

export function GameProvider({ children }: { children: ReactNode }) {
  const [games, setGames] = useState<Game[]>([])
  const [pastGames, setPastGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchGames = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/games")
      if (!res.ok) {
        throw new Error("Failed to fetch games")
      }
      const data = await res.json()
      setGames(data)
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("An unknown error occurred")
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchPastGames = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/games?past=true")
      if (!res.ok) {
        throw new Error("Failed to fetch past games")
      }
      const data = await res.json()
      setPastGames(data)
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("An unknown error occurred")
      }
    } finally {
      setLoading(false)
    }
  }

  const createGame = async (gameData: {
    dateTime: string
    maxPlayers: number
    address: string
    city: string
    state: string
    zipCode: string
  }) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/games", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(gameData),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to create game")
      }

      await fetchGames()
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("An unknown error occurred")
      }
      throw error
    } finally {
      setLoading(false)
    }
  }

  const joinGame = async (gameId: number) => {
    setError(null)
    try {
      const res = await fetch(`/api/games/${gameId}/join`, {
        method: "POST",
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to join game")
      }

      await fetchGames()
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("An unknown error occurred")
      }
      throw error
    }
  }

  const leaveGame = async (gameId: number) => {
    setError(null)
    try {
      const res = await fetch(`/api/games/${gameId}/leave`, {
        method: "POST",
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to leave game")
      }

      await fetchGames()
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("An unknown error occurred")
      }
      throw error
    }
  }

  const removeAttendee = async (gameId: number, attendeeId: number) => {
    setError(null)
    try {
      const res = await fetch(`/api/games/${gameId}/remove-attendee`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ attendeeId }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to remove attendee")
      }

      await fetchGames()
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("An unknown error occurred")
      }
      throw error
    }
  }

  return (
    <GameContext.Provider
      value={{
        games,
        pastGames,
        loading,
        error,
        fetchGames,
        fetchPastGames,
        createGame,
        joinGame,
        leaveGame,
        removeAttendee,
      }}
    >
      {children}
    </GameContext.Provider>
  )
}

export function useGames() {
  const context = useContext(GameContext)
  if (context === undefined) {
    throw new Error("useGames must be used within a GameProvider")
  }
  return context
}

