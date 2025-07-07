import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { ArrowRight, Menu, Settings, Users, X } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Game } from '@/lib/game-core/game'
import { useGameStore } from '@/store/game-store'

// Custom hook to ensure game object is properly reconstructed
function useReconstructedGame() {
  const { game, isGameActive } = useGameStore()

  const reconstructedGame = useMemo(() => {
    if (!game || !isGameActive)
      return null

    // If game is already a proper Game instance, return it
    if (game instanceof Game) {
      return game
    }

    // If game is a plain object, try to reconstruct it
    if (typeof game === 'object' && 'toJSON' in game) {
      try {
        return Game.fromJSON(game as any)
      }
      catch (error) {
        console.error('Failed to reconstruct game:', error)
        return null
      }
    }

    return null
  }, [game, isGameActive])

  return reconstructedGame
}

function GamePage() {
  const { nextTurn, exitGame, isGameActive, clearGame } = useGameStore()
  const game = useReconstructedGame()
  const navigate = useNavigate()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isExitPopoverOpen, setIsExitPopoverOpen] = useState(false)

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
    exitGame()
    clearGame()
    navigate({ to: '/' })
    setIsExitPopoverOpen(false)
  }

  if (isGameFinished) {
    navigate({ to: '/game/results' })
    return null
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Menu Button - Fixed Position Top Right */}
      <div className="fixed top-4 right-4 z-50">
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="bg-white/90 backdrop-blur-sm hover:bg-white/95"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </DrawerTrigger>
          <DrawerContent className="h-[80vh]">
            <DrawerHeader>
              <DrawerTitle className="flex items-center gap-2">
                🍻 FreeColo Game
              </DrawerTitle>
              <DrawerDescription>
                Game controls and information
              </DrawerDescription>
            </DrawerHeader>

            <div className="px-4 pb-4 overflow-y-auto">
              <div className="space-y-6">
                {/* Game Stats */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-gray-600 uppercase tracking-wide">
                    Game Stats
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span>
                        {game.getPlayers().length}
                        {' '}
                        Players
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">
                        Turn
                        {gameStats.totalTurns + 1}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Current Player */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-gray-600 uppercase tracking-wide">
                    Current Player
                  </h3>
                  <div className="p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                    <div className="text-lg font-bold text-yellow-700">
                      {currentPlayer?.name || 'Next Player'}
                    </div>
                    <div className="text-sm text-yellow-600">
                      It's your turn!
                    </div>
                  </div>
                </div>

                {/* Question Info */}
                {currentQuestion && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm text-gray-600 uppercase tracking-wide">
                      Question Details
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">
                          Challenge #
                          {currentQuestion.id.replace('q', '')}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Type: </span>
                        <span className="font-medium">{currentQuestion.type}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Players: </span>
                        <span className="font-medium">
                          {currentQuestion.minPlayers}
                          -
                          {currentQuestion.maxPlayers}
                        </span>
                      </div>
                      {currentQuestion.tags && currentQuestion.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {currentQuestion.tags.map(tag => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-gray-600 uppercase tracking-wide">
                    Actions
                  </h3>
                  <div className="space-y-2">
                    <Link to="/setup" className="block" onClick={() => setIsDrawerOpen(false)}>
                      <Button variant="outline" className="w-full justify-start">
                        <Settings className="w-4 h-4 mr-2" />
                        Manage Players
                      </Button>
                    </Link>

                    <Popover open={isExitPopoverOpen} onOpenChange={setIsExitPopoverOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
                          <X className="w-4 h-4 mr-2" />
                          Exit Game
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="space-y-3">
                          <h4 className="font-semibold text-red-600">Exit Game</h4>
                          <p className="text-sm text-gray-600">
                            Are you sure you want to exit the game? Your progress will be lost.
                          </p>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setIsExitPopoverOpen(false)}
                              className="flex-1"
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={handleExitGame}
                              className="flex-1"
                            >
                              Exit Game
                            </Button>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </div>

      {/* Main Question Display - Clickable */}
      <div className="flex-1 flex items-center justify-center p-4">
        {currentQuestion && (
          <div
            onClick={handleNextTurn}
            className="max-w-2xl w-full cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <Card className="bg-white/95 backdrop-blur-sm border-2 border-transparent hover:border-purple-300 transition-all duration-300 shadow-xl hover:shadow-2xl">
              <CardContent className="p-6 md:p-8">
                <div className="text-center space-y-4">
                  {/* Player Name */}
                  <div className="text-xl md:text-2xl font-bold text-yellow-600">
                    {currentPlayer?.name || 'Next Player'}
                  </div>

                  {/* Question Text */}
                  <div className="text-lg md:text-xl lg:text-2xl leading-relaxed text-gray-800 font-medium">
                    {currentQuestion.text.replace('{player}', currentPlayer?.name || 'Player')}
                  </div>

                  {/* Continue Hint */}
                  <div className="mt-6 text-sm text-gray-500 flex items-center justify-center gap-2">
                    <span>Tap to continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

export const Route = createFileRoute('/game')({
  component: GamePage,
})
