import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { ArrowRight, Settings, Users } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useGameStore } from '@/store/game-store'

function GamePage() {
  const { game, nextTurn, exitGame, isGameActive } = useGameStore()
  const navigate = useNavigate()

  if (!isGameActive || !game) {
    navigate({ to: '/setup' })
    return null
  }

  const currentQuestion = game.getCurrentQuestion()
  const gameHistory = game.getGameHistory()
  const currentTurn = gameHistory[gameHistory.length - 1]
  const currentPlayer = currentTurn?.selectedPlayer
  const isGameFinished = game.isGameFinished()
  const gameStats = game.getGameStats()

  const handleNextTurn = () => {
    nextTurn()
    if (game.isGameFinished()) {
      navigate({ to: '/game/results' })
    }
  }

  const handleExitGame = () => {
    // eslint-disable-next-line no-alert
    if (confirm('Are you sure you want to exit the game? Progress will be lost.')) {
      exitGame()
      navigate({ to: '/' })
    }
  }

  if (isGameFinished) {
    navigate({ to: '/game/results' })
    return null
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
          🍻 FreeColo Game
        </h1>
        <div className="flex items-center justify-center gap-4 text-white/90 text-sm">
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {game.getPlayers().length}
            {' '}
            Players
          </span>
          <span>•</span>
          <span>
            Turn
            {gameStats.totalTurns + 1}
          </span>
        </div>
      </div>

      {/* Current Player */}
      <Card className="mb-6 bg-white/95 backdrop-blur-sm border-2 border-yellow-400">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-yellow-600">
            {currentPlayer?.name || 'Next Player'}
            's Turn
          </CardTitle>
          <CardDescription className="text-lg">
            Get ready for your challenge!
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Question Card */}
      {currentQuestion && (
        <Card className="mb-8 bg-white/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              Challenge #
              {currentQuestion.id.replace('q', '')}
            </CardTitle>
            <CardDescription>
              Type:
              {' '}
              {currentQuestion.type}
              {' '}
              • Players:
              {' '}
              {currentQuestion.minPlayers}
              -
              {currentQuestion.maxPlayers}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-lg leading-relaxed p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-l-4 border-purple-500">
              {currentQuestion.text.replace('{player}', currentPlayer?.name || 'Player')}
            </div>
            {currentQuestion.tags && currentQuestion.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {currentQuestion.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Game Controls */}
      <Card className="mb-6 bg-white/95 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Button
              onClick={handleNextTurn}
              className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-lg py-6"
            >
              <ArrowRight className="w-5 h-5 mr-2" />
              Continue
            </Button>
            <Link to="/setup" className="flex-1">
              <Button variant="outline" className="w-full text-lg py-6">
                <Settings className="w-5 h-5 mr-2" />
                Manage Players
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Exit Game */}
      <div className="text-center">
        <Button
          onClick={handleExitGame}
          variant="outline"
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          Exit Game
        </Button>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/game')({
  component: GamePage,
})
