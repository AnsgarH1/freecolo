import { createFileRoute, Link } from '@tanstack/react-router'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useGameStore } from '@/store/game-store'

function HomePage() {
  const { isGameActive, players } = useGameStore()

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
      <div className="mb-8">
        <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-lg">
          🍻 FreeColo
        </h1>
        <p className="text-xl text-white/90 mb-8 drop-shadow">
          The Ultimate Drinking Game Experience
        </p>
      </div>

      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {isGameActive ? 'Game in Progress' : 'Ready to Party?'}
          </CardTitle>
          <CardDescription className="text-center">
            {isGameActive
              ? `Current game with ${players.length} players`
              : 'Start a new drinking game with your friends'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isGameActive
            ? (
                <>
                  <Link to="/game">
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                      Continue Game
                    </Button>
                  </Link>
                  <Link to="/setup">
                    <Button variant="outline" className="w-full">
                      Manage Players
                    </Button>
                  </Link>
                </>
              )
            : (
                <Link to="/setup">
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg py-6">
                    Start New Game
                  </Button>
                </Link>
              )}
        </CardContent>
      </Card>
    </div>
  )
}

export const Route = createFileRoute('/')({
  component: HomePage,
})
