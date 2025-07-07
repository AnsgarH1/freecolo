import { beforeEach, describe, expect, it } from 'vitest'

import type { QuestionCatalog } from '../types'

import { Game } from '../game'
import { Player } from '../player'

describe('game', () => {
  let game: Game
  let players: Player[]
  let questionCatalog: QuestionCatalog

  beforeEach(() => {
    players = [
      new Player('Alice'),
      new Player('Bob'),
      new Player('Charlie'),
    ]

    questionCatalog = {
      id: 'test-catalog',
      name: 'Test Catalog',
      version: '1.0.0',
      description: 'Test question catalog',
      questions: [
        {
          id: 'q1',
          text: 'Player {player} must drink!',
          type: 'action',
          tags: ['drink'],
          minPlayers: 2,
          maxPlayers: 10,
        },
        {
          id: 'q2',
          text: 'Everyone except {player} drinks!',
          type: 'action',
          tags: ['drink', 'group'],
          minPlayers: 3,
          maxPlayers: 10,
        },
        {
          id: 'q3',
          text: '{player}, tell us your biggest secret!',
          type: 'question',
          tags: ['personal'],
          minPlayers: 2,
          maxPlayers: 10,
        },
      ],
      metadata: {
        totalQuestions: 3,
        tags: ['drink', 'group', 'personal'],
        difficulty: ['easy'],
        minPlayers: 2,
        maxPlayers: 10,
      },
    }

    game = new Game(players, questionCatalog)
  })

  describe('constructor', () => {
    it('should create game with players and catalog', () => {
      expect(game.getPlayers()).toHaveLength(3)
      expect(game.getStatus()).toBe('setup')
      expect(game.isGameActive()).toBe(false)
      expect(game.isGameFinished()).toBe(false)
    })

    it('should throw error for empty players', () => {
      expect(() => new Game([], questionCatalog)).toThrow('At least one player is required')
    })

    it('should throw error for empty question catalog', () => {
      const emptyCatalog = { ...questionCatalog, questions: [] }
      expect(() => new Game(players, emptyCatalog)).toThrow('Question catalog cannot be empty')
    })

    it('should throw error for insufficient players', () => {
      const singlePlayer = [new Player('Solo')]
      expect(() => new Game(singlePlayer, questionCatalog)).toThrow('Not enough players for this question catalog')
    })

    it('should throw error for too many players', () => {
      const tooManyPlayers = Array.from({ length: 15 }, (_, i) => new Player(`Player ${i}`))
      expect(() => new Game(tooManyPlayers, questionCatalog)).toThrow('Too many players for this question catalog')
    })
  })

  describe('startGame', () => {
    it('should start the game', () => {
      game.startGame()
      expect(game.getStatus()).toBe('playing')
      expect(game.isGameActive()).toBe(true)
      expect(game.isGameFinished()).toBe(false)
    })

    it('should throw error if game already started', () => {
      game.startGame()
      expect(() => game.startGame()).toThrow('Game is already active')
    })

    it('should throw error if game is finished', () => {
      game.startGame()
      // Play all questions
      while (!game.isGameFinished()) {
        game.nextTurn()
      }
      expect(() => game.startGame()).toThrow('Game is already finished')
    })
  })

  describe('nextTurn', () => {
    beforeEach(() => {
      game.startGame()
    })

    it('should process next turn', () => {
      const turn = game.nextTurn()

      expect(turn.question).toBeDefined()
      expect(turn.selectedPlayer).toBeDefined()
      expect(turn.processedText).toBeDefined()
      expect(turn.turnNumber).toBe(1)
      expect(turn.timestamp).toBeInstanceOf(Date)
    })

    it('should replace {player} placeholder with selected player name', () => {
      const turn = game.nextTurn()
      expect(turn.processedText).toContain(turn.selectedPlayer.name)
      expect(turn.processedText).not.toContain('{player}')
    })

    it('should increment turn number', () => {
      const turn1 = game.nextTurn()
      const turn2 = game.nextTurn()

      expect(turn1.turnNumber).toBe(1)
      expect(turn2.turnNumber).toBe(2)
    })

    it('should finish game when all questions are used', () => {
      const turns = []
      while (!game.isGameFinished()) {
        turns.push(game.nextTurn())
      }

      expect(turns).toHaveLength(3) // All questions used
      expect(game.getStatus()).toBe('finished')
      expect(game.isGameActive()).toBe(false)
      expect(game.isGameFinished()).toBe(true)
    })

    it('should throw error if game not active', () => {
      const inactiveGame = new Game(players, questionCatalog)
      expect(() => inactiveGame.nextTurn()).toThrow('Game is not active')
    })

    it('should throw error if game is finished', () => {
      // Play all questions
      while (!game.isGameFinished()) {
        game.nextTurn()
      }
      expect(() => game.nextTurn()).toThrow('Game is already finished')
    })
  })

  describe('getCurrentQuestion', () => {
    it('should return current question when game active', () => {
      game.startGame()
      const question = game.getCurrentQuestion()
      expect(question).toBeDefined()
      expect(question).not.toBeNull()
      expect(question!.id).toBe('q1')
    })

    it('should return null when game not started', () => {
      expect(game.getCurrentQuestion()).toBeNull()
    })

    it('should return null when game finished', () => {
      game.startGame()
      while (!game.isGameFinished()) {
        game.nextTurn()
      }
      expect(game.getCurrentQuestion()).toBeNull()
    })
  })

  describe('getGameStats', () => {
    it('should return correct stats for new game', () => {
      const stats = game.getGameStats()
      expect(stats.totalTurns).toBe(0)
      expect(stats.questionsRemaining).toBe(3)
      expect(stats.completionPercentage).toBe(0)
      expect(stats.playerStats).toHaveLength(3)
    })

    it('should return correct stats during game', () => {
      game.startGame()
      game.nextTurn()

      const stats = game.getGameStats()
      expect(stats.totalTurns).toBe(1)
      expect(stats.questionsRemaining).toBe(2)
      expect(stats.completionPercentage).toBeCloseTo(33.33, 1)
    })

    it('should return correct stats for finished game', () => {
      game.startGame()
      while (!game.isGameFinished()) {
        game.nextTurn()
      }

      const stats = game.getGameStats()
      expect(stats.totalTurns).toBe(3)
      expect(stats.questionsRemaining).toBe(0)
      expect(stats.completionPercentage).toBe(100)
    })
  })

  describe('getGameHistory', () => {
    it('should return empty history for new game', () => {
      expect(game.getGameHistory()).toHaveLength(0)
    })

    it('should track game history', () => {
      game.startGame()
      game.nextTurn()
      game.nextTurn()

      const history = game.getGameHistory()
      expect(history).toHaveLength(2)
      expect(history[0].turnNumber).toBe(1)
      expect(history[1].turnNumber).toBe(2)
    })
  })

  describe('pauseGame', () => {
    it('should pause active game', () => {
      game.startGame()
      game.pauseGame()

      expect(game.getStatus()).toBe('setup')
      expect(game.isGameActive()).toBe(false)
    })

    it('should throw error if game not active', () => {
      expect(() => game.pauseGame()).toThrow('Game is not active')
    })
  })

  describe('resumeGame', () => {
    it('should resume paused game', () => {
      game.startGame()
      game.pauseGame()
      game.resumeGame()

      expect(game.getStatus()).toBe('playing')
      expect(game.isGameActive()).toBe(true)
    })

    it('should throw error if game already active', () => {
      game.startGame()
      expect(() => game.resumeGame()).toThrow('Game is already active or finished')
    })
  })

  describe('resetGame', () => {
    it('should reset game to initial state', () => {
      game.startGame()
      game.nextTurn()
      game.nextTurn()

      game.resetGame()

      expect(game.getStatus()).toBe('setup')
      expect(game.isGameActive()).toBe(false)
      expect(game.isGameFinished()).toBe(false)
      expect(game.getGameHistory()).toHaveLength(0)
      expect(game.getGameStats().totalTurns).toBe(0)
    })

    it('should reset player selection counts', () => {
      game.startGame()
      game.nextTurn()
      game.nextTurn()

      const playersBefore = game.getPlayers()
      const hasSelections = playersBefore.some(p => p.timesSelected > 0)
      expect(hasSelections).toBe(true)

      game.resetGame()

      const playersAfter = game.getPlayers()
      const allZero = playersAfter.every(p => p.timesSelected === 0)
      expect(allZero).toBe(true)
    })
  })

  describe('addPlayer', () => {
    it('should add player to game', () => {
      const newPlayer = new Player('Dave')
      game.addPlayer(newPlayer)

      expect(game.getPlayers()).toHaveLength(4)
      expect(game.getPlayers().map(p => p.name)).toContain('Dave')
    })

    it('should throw error if game is active', () => {
      game.startGame()
      const newPlayer = new Player('Dave')
      expect(() => game.addPlayer(newPlayer)).toThrow('Cannot modify players while game is active')
    })
  })

  describe('removePlayer', () => {
    it('should remove player from game', () => {
      game.removePlayer(players[0])

      expect(game.getPlayers()).toHaveLength(2)
      expect(game.getPlayers().map(p => p.name)).not.toContain('Alice')
    })

    it('should throw error if game is active', () => {
      game.startGame()
      expect(() => game.removePlayer(players[0])).toThrow('Cannot modify players while game is active')
    })

    it('should throw error if removal would make game invalid', () => {
      // Remove two players, leaving only one
      game.removePlayer(players[0])
      expect(() => game.removePlayer(players[1])).toThrow('Not enough players for this question catalog')
    })
  })

  describe('toJSON', () => {
    it('should serialize game state', () => {
      game.startGame()
      game.nextTurn()

      const json = game.toJSON()

      expect(json.players).toHaveLength(3)
      expect(json.questionCatalog).toBeDefined()
      expect(json.currentQuestionIndex).toBe(1)
      expect(json.isGameActive).toBe(true)
      expect(json.isGameFinished).toBe(false)
      expect(json.gameHistory).toHaveLength(1)
    })
  })

  describe('fromJSON', () => {
    it('should deserialize game state', () => {
      game.startGame()
      game.nextTurn()

      const json = game.toJSON()
      const restoredGame = Game.fromJSON(json)

      expect(restoredGame.getPlayers()).toHaveLength(3)
      expect(restoredGame.isGameActive()).toBe(true)
      expect(restoredGame.getGameHistory()).toHaveLength(1)
    })

    it('should throw error for invalid JSON', () => {
      expect(() => Game.fromJSON({} as any)).toThrow('Invalid game state JSON')
    })
  })

  describe('clone', () => {
    it('should create deep copy of game', () => {
      game.startGame()
      game.nextTurn()

      const cloned = game.clone()

      expect(cloned.getPlayers()).toHaveLength(3)
      expect(cloned.getGameHistory()).toHaveLength(1)

      // Verify it's a deep copy
      cloned.nextTurn()
      expect(cloned.getGameHistory()).toHaveLength(2)
      expect(game.getGameHistory()).toHaveLength(1)
    })
  })
})
