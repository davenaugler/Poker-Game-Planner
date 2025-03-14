"use client"

import { useEffect } from "react"
import { useGames } from "@/contexts/game-context"
import { GameCard } from "@/components/game-card"
import { Navbar } from "@/components/navbar"

export default function PastGames() {
  const { pastGames, loading, error, fetchPastGames } = useGames()

  useEffect(() => {
    fetchPastGames()
  }, [fetchPastGames])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Past Games</h1>

        {loading ? (
          <div className="text-center py-8">Loading past games...</div>
        ) : error ? (
          <div className="text-center py-8 text-destructive">{error}</div>
        ) : pastGames.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No past games found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastGames.map((game) => (
              <GameCard key={game.id} game={game} isPast={true} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

