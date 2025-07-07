import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Edit2, Play, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useGameStore } from '@/store/game-store'

function SetupPage() {
  const { players, addPlayer, removePlayer, editPlayer, startGame, isGameActive } = useGameStore()
  const [newPlayerName, setNewPlayerName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const navigate = useNavigate()

  const handleAddPlayer = () => {
    if (newPlayerName.trim()) {
      addPlayer(newPlayerName.trim())
      setNewPlayerName('')
    }
  }

  const handleEditPlayer = (playerId: string, currentName: string) => {
    setEditingId(playerId)
    setEditingName(currentName)
  }

  const handleSaveEdit = () => {
    if (editingId && editingName.trim()) {
      editPlayer(editingId, editingName.trim())
      setEditingId(null)
      setEditingName('')
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditingName('')
  }

  const handleStartGame = () => {
    try {
      startGame()
      navigate({ to: '/game' })
    }
    catch (error) {
      console.error('Failed to start game:', error)
      // Could add toast notification here instead of alert
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
          🎮 Game Setup
        </h1>
        <p className="text-white/90 drop-shadow">
          Add players to join the party
        </p>
      </div>

      <Card className="mb-6 bg-white/95 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Player
          </CardTitle>
          <CardDescription>
            Enter a player name to add them to the game
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="player-name" className="sr-only">
                Player Name
              </Label>
              <Input
                id="player-name"
                placeholder="Enter player name..."
                value={newPlayerName}
                onChange={e => setNewPlayerName(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleAddPlayer()}
                className="text-lg"
              />
            </div>
            <Button
              onClick={handleAddPlayer}
              disabled={!newPlayerName.trim()}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6 bg-white/95 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>
              Players (
              {players.length}
              )
            </span>
            {players.length >= 2 && (
              <Button
                onClick={handleStartGame}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                <Play className="w-4 h-4 mr-2" />
                {isGameActive ? 'Update Game' : 'Start Game'}
              </Button>
            )}
          </CardTitle>
          <CardDescription>
            {players.length < 2
              ? 'Add at least 2 players to start the game'
              : 'Ready to start the party!'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {players.length === 0
            ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No players added yet</p>
                  <p className="text-sm">Add some players to get started!</p>
                </div>
              )
            : (
                <div className="space-y-3">
                  {players.map(player => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      {editingId === player.id
                        ? (
                            <div className="flex-1 flex gap-2">
                              <Input
                                value={editingName}
                                onChange={e => setEditingName(e.target.value)}
                                onKeyPress={e => e.key === 'Enter' && handleSaveEdit()}
                                className="flex-1"
                                autoFocus
                              />
                              <Button
                                onClick={handleSaveEdit}
                                size="sm"
                                variant="outline"
                                className="text-green-600"
                              >
                                Save
                              </Button>
                              <Button
                                onClick={handleCancelEdit}
                                size="sm"
                                variant="outline"
                                className="text-gray-600"
                              >
                                Cancel
                              </Button>
                            </div>
                          )
                        : (
                            <>
                              <span className="font-medium text-lg">{player.name}</span>
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => handleEditPlayer(player.id, player.name)}
                                  size="sm"
                                  variant="outline"
                                  className="text-blue-600"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button
                                  onClick={() => removePlayer(player.id)}
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </>
                          )}
                    </div>
                  ))}
                </div>
              )}
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Link to="/" className="flex-1">
          <Button variant="outline" className="w-full">
            Back to Home
          </Button>
        </Link>
        {isGameActive && (
          <Link to="/game" className="flex-1">
            <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              Back to Game
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}

export const Route = createFileRoute('/setup')({
  component: SetupPage,
})
