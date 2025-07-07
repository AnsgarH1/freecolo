import type { StateStorage } from 'zustand/middleware'

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { Game } from '@/lib/game-core/game'
import { Player } from '@/lib/game-core/player'
import { loadQuestionCatalog } from '@/lib/game-core/question-loader'

type GameState = {
  // Game state
  game: Game | null
  players: Player[]
  isGameActive: boolean

  // Actions
  addPlayer: (name: string) => void
  removePlayer: (playerId: string) => void
  editPlayer: (playerId: string, newName: string) => void
  startGame: () => void
  nextTurn: () => void
  exitGame: () => void
  clearGame: () => void
}

// Custom storage to handle Game and Player class serialization
const gameStorage: StateStorage = {
  getItem: (name: string): string | null => {
    const item = localStorage.getItem(name)
    if (!item)
      return null

    try {
      const parsed = JSON.parse(item)
      // Reconstruct Game and Player instances from stored data
      const reconstructed = {
        ...parsed,
        game: parsed.game ? Game.fromJSON(parsed.game) : null,
        players: parsed.players ? parsed.players.map((p: any) => Player.fromJSON(p)) : [],
      }
      return JSON.stringify(reconstructed)
    }
    catch (error) {
      console.error('Error parsing stored game data:', error)
      return null
    }
  },
  setItem: (name: string, value: string): void => {
    try {
      const parsed = JSON.parse(value)
      // Convert Game and Player instances to JSON for storage
      const serialized = {
        ...parsed,
        game: parsed.game ? parsed.game.toJSON() : null,
        players: parsed.players ? parsed.players.map((p: Player) => p.toJSON()) : [],
      }
      localStorage.setItem(name, JSON.stringify(serialized))
    }
    catch (error) {
      console.error('Error storing game data:', error)
    }
  },
  removeItem: (name: string): void => {
    localStorage.removeItem(name)
  },
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // Initial state
      game: null,
      players: [],
      isGameActive: false,

      // Actions
      addPlayer: (name: string) => {
        const player = new Player(name)
        set(state => ({
          players: [...state.players, player],
        }))
      },

      removePlayer: (playerId: string) => {
        set(state => ({
          players: state.players.filter(p => p.id !== playerId),
        }))
      },

      editPlayer: (playerId: string, newName: string) => {
        set(state => ({
          players: state.players.map(p =>
            p.id === playerId ? new Player(newName, p.id) : p,
          ),
        }))
      },

      startGame: () => {
        const { players } = get()
        if (players.length < 2) {
          throw new Error('At least 2 players required')
        }

        const questionCatalog = loadQuestionCatalog()
        const game = new Game(players, questionCatalog)
        game.startGame()

        set({
          game,
          isGameActive: true,
        })
      },

      nextTurn: () => {
        const { game } = get()
        if (game && !game.isGameFinished()) {
          game.nextTurn()
          set({ game }) // Just update the reference to trigger re-render
        }
      },

      exitGame: () => {
        set({
          game: null,
          isGameActive: false,
        })
      },

      clearGame: () => {
        set({
          game: null,
          players: [],
          isGameActive: false,
        })
      },
    }),
    {
      name: 'freecolo-game-storage',
      storage: createJSONStorage(() => gameStorage),
      // Only persist when game is active
      partialize: state =>
        state.isGameActive
          ? {
              game: state.game,
              players: state.players,
              isGameActive: state.isGameActive,
            }
          : { players: state.players, isGameActive: false, game: null },
    },
  ),
)
