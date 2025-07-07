import { createFileRoute, Link } from '@tanstack/react-router'
import { Clock, RotateCcw, Trophy, Users } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useGameStore } from '@/store/game-store'

function ResultsPage() {
  const { game, clearGame } = useGameStore()

  if (!game) {
    return (
      <div className="text-center">
        <h1 className="text-2xl text-white mb-4">No game data found</h1>
        <Link to="/">
          <Button>Go Home</Button>
        </Link>
      </div>
    )
  }

  const gameStats = game.getGameStats()
  const players = game.getPlayers()

  const handleNewGame = () => {
    clearGame()
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
          🎉 Game Complete!
        </h1>
        <p className="text-xl text-white/90 drop-shadow">
          Great job everyone! Hope you had fun!
        </p>
      </div>

      {/* Game Stats */}
      <Card className="mb-6 bg-white/95 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Trophy className="w-6 h-6 text-yellow-600" />
            Game Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {gameStats.totalTurns}
              </div>
              <div className="text-sm text-gray-600">Total Turns</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 flex items-center justify-center gap-1">
                <Users className="w-5 h-5" />
                {players.length}
              </div>
              <div className="text-sm text-gray-600">Players</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(gameStats.completionPercentage)}
                %
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600 flex items-center justify-center gap-1">
                <Clock className="w-5 h-5" />
                {Math.round(gameStats.gameDuration / 60000)}
                m
              </div>
              <div className="text-sm text-gray-600">Duration</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Player Stats */}
      <Card className="mb-6 bg-white/95 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Player Participation
          </CardTitle>
          <CardDescription>
            How many times each player was selected
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(gameStats.playerStats).map(([playerId, stats]) => {
              const player = players.find(p => p.id === playerId)
              return (
                <div key={playerId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{player?.name || 'Unknown Player'}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {stats.timesSelected}
                      {' '}
                      turns
                    </span>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                        style={{
                          width: `${(stats.timesSelected / Math.max(...Object.values(gameStats.playerStats).map(s => s.timesSelected))) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link to="/setup" className="flex-1" onClick={handleNewGame}>
          <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg py-6">
            <RotateCcw className="w-5 h-5 mr-2" />
            New Game
          </Button>
        </Link>
        <Link to="/" className="flex-1" onClick={handleNewGame}>
          <Button variant="outline" className="w-full text-lg py-6">
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/game/results')({
  component: ResultsPage,
})
