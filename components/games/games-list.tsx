import React from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/contexts/auth-context"

type Game = {
  id: number
  host: {
    firstName: string
    lastName: string
  }
  dateTime: string
  attendeesCount: number
  maxPlayers: number
}

const GamesList = ({ isPast = false }: { isPast?: boolean }) => {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  
  const { data: games, isLoading, error, refetch } = useQuery<Game[]>({
    queryKey: ["games", isPast],
    queryFn: async () => {
      const response = await fetch(`/api/games?past=${isPast}`)
      if (!response.ok) {
        throw new Error("Failed to fetch games")
      }
      return response.json()
    },
    retry: false, // Don't retry on error
    enabled: !!user // Only fetch when user is authenticated
  })

  // First check if we're still loading auth state
  if (authLoading) {
    return null // Don't show anything while checking auth
  }

  // Then check if user is authenticated
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] gap-4">
        <p className="text-muted-foreground">Please log in to view games</p>
        <Button onClick={() => router.push("/login")}>Login</Button>
      </div>
    )
  }

  // Only show loading state if we're authenticated and fetching games
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] gap-4">
        <p className="text-destructive">Unable to load games</p>
        <p className="text-sm text-muted-foreground">Please check your database connection</p>
        <Button variant="outline" onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    )
  }

  if (!games?.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] gap-4">
        <p className="text-muted-foreground">No games found</p>
        {!isPast && (
          <Button onClick={() => router.push("/games/new")}>Create your first game</Button>
        )}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {games.map((game) => (
        <div key={game.id} className="p-4 border rounded-lg">
          <h3 className="font-semibold">{game.host.firstName} {game.host.lastName}</h3>
          <p className="text-sm text-muted-foreground">
            {new Date(game.dateTime).toLocaleString()}
          </p>
          <p className="text-sm">
            {game.attendeesCount} / {game.maxPlayers} players
          </p>
        </div>
      ))}
    </div>
  )
}

export default GamesList 