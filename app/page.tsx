"use client"

import { useEffect, useState } from "react"
import { useGames } from "@/contexts/game-context"
import { GameCard } from "@/components/game-card"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"

export default function Home() {
  const { games, loading, error, fetchGames } = useGames()
  const { user, loading: authLoading } = useAuth()
  const [hasFetched, setHasFetched] = useState(false)

  useEffect(() => {
    if (user && !hasFetched) {
      fetchGames()
      setHasFetched(true)
    }
  }, [fetchGames, user, hasFetched])

  // Don't show anything while checking auth
  if (authLoading) {
    return null
  }

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Welcome to Poker Game Planner</h1>
            <p className="text-muted-foreground mb-6">Please log in to view and manage games</p>
            <Link href="/login">
              <Button>Login</Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Upcoming Poker Games</h1>
          <Link href="/create-game">
            <Button>Create Game</Button>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading games...</div>
        ) : error ? (
          <div className="text-center py-8 text-destructive">{error}</div>
        ) : games.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No upcoming games found</p>
            <Link href="/create-game">
              <Button>Create Your First Game</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

