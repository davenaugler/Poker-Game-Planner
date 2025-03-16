"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useGames } from "@/contexts/game-context"
import { GameCard } from "@/components/features/games/game-card"
import { Navbar } from "@/components/features/layout/navbar"

export default function PastGames() {
  const { pastGames, loading, error, fetchPastGames } = useGames()
  const { user } = useAuth()
  const [hasFetched, setHasFetched] = useState(false)

  useEffect(() => {
    if (user && !hasFetched) {
      fetchPastGames()
      setHasFetched(true)
    }
  }, [fetchPastGames, user, hasFetched])

  // Filter past games to only show ones where user was involved
  const myPastGames = pastGames.filter(
    (game) => game.isHost || game.isAttending || game.isOnWaitlist
  )

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Past Games</h1>

        {loading ? (
          <div className="text-center py-8">Loading past games...</div>
        ) : error ? (
          <div className="text-center py-8 text-destructive">{error}</div>
        ) : myPastGames.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            You have not participated in any past games
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myPastGames.map((game) => (
              <GameCard key={game.id} game={game} isPast={true} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

