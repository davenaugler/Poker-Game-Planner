"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useGames } from "@/contexts/game-context"
import { GameCard } from "@/components/features/games/game-card"
import { Navbar } from "@/components/features/layout/navbar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function MyGames() {
  const { games, loading, error, fetchGames } = useGames()
  const { user } = useAuth()
  const [hasFetched, setHasFetched] = useState(false)

  useEffect(() => {
    if (user && !hasFetched) {
      fetchGames()
      setHasFetched(true)
    }
  }, [fetchGames, user, hasFetched])

  // Filter games where user is attending or hosting
  const myGames = games.filter((game) => game.isAttending || game.isHost)

  // Filter games where user is hosting
  const hostedGames = games.filter((game) => game.isHost)

  // Filter games where user is on waitlist
  const waitlistGames = games.filter((game) => game.isOnWaitlist)

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Games</h1>

        <Tabs defaultValue="attending">
          <TabsList className="mb-6">
            <TabsTrigger value="attending">Attending</TabsTrigger>
            <TabsTrigger value="hosting">Hosting</TabsTrigger>
            <TabsTrigger value="waitlist">Waitlist</TabsTrigger>
          </TabsList>

          <TabsContent value="attending">
            {loading ? (
              <div className="text-center py-8">Loading games...</div>
            ) : error ? (
              <div className="text-center py-8 text-destructive">{error}</div>
            ) : myGames.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">You are not attending any upcoming games</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myGames.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="hosting">
            {loading ? (
              <div className="text-center py-8">Loading games...</div>
            ) : error ? (
              <div className="text-center py-8 text-destructive">{error}</div>
            ) : hostedGames.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">You are not hosting any upcoming games</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hostedGames.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="waitlist">
            {loading ? (
              <div className="text-center py-8">Loading games...</div>
            ) : error ? (
              <div className="text-center py-8 text-destructive">{error}</div>
            ) : waitlistGames.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">You are not on the waitlist for any games</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {waitlistGames.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

