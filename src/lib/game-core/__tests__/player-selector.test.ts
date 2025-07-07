import { beforeEach, describe, expect, it } from 'vitest'

import { Player } from '../player'
import { PlayerSelector } from '../player-selector'

describe('playerSelector', () => {
  let selector: PlayerSelector
  let players: Player[]

  beforeEach(() => {
    players = [
      new Player('Alice'),
      new Player('Bob'),
      new Player('Charlie'),
      new Player('Diana'),
    ]
    selector = new PlayerSelector(players)
  })

  describe('constructor', () => {
    it('should create selector with players', () => {
      expect(selector.getPlayers()).toHaveLength(4)
      expect(selector.getPlayers().map(p => p.name)).toEqual(['Alice', 'Bob', 'Charlie', 'Diana'])
    })

    it('should throw error for empty players array', () => {
      expect(() => new PlayerSelector([])).toThrow('At least one player is required')
    })

    it('should throw error for duplicate players', () => {
      const duplicatePlayers = [players[0], players[0], players[1]]
      expect(() => new PlayerSelector(duplicatePlayers)).toThrow('Duplicate players are not allowed')
    })
  })

  describe('selectNext', () => {
    it('should select player with lowest selection count', () => {
      // All players start with 0 selections, should select first player
      const selected = selector.selectNext()
      expect(selected.name).toBe('Alice')
      expect(selected.timesSelected).toBe(1)
    })

    it('should select different player when one has been selected', () => {
      selector.selectNext() // Alice selected
      const second = selector.selectNext()
      expect(second.name).toBe('Bob')
      expect(second.timesSelected).toBe(1)
    })

    it('should cycle through all players fairly', () => {
      const selections = []
      for (let i = 0; i < 8; i++) {
        selections.push(selector.selectNext().name)
      }

      // After 8 selections, each player should have been selected twice
      expect(selections.filter(name => name === 'Alice')).toHaveLength(2)
      expect(selections.filter(name => name === 'Bob')).toHaveLength(2)
      expect(selections.filter(name => name === 'Charlie')).toHaveLength(2)
      expect(selections.filter(name => name === 'Diana')).toHaveLength(2)
    })

    it('should handle single player', () => {
      const singlePlayerSelector = new PlayerSelector([players[0]])
      const selected1 = singlePlayerSelector.selectNext()
      const selected2 = singlePlayerSelector.selectNext()

      expect(selected1.name).toBe('Alice')
      expect(selected2.name).toBe('Alice')
      expect(selected1.timesSelected).toBe(2)
    })

    it('should prefer players with fewer selections', () => {
      // Manually set some selection counts
      players[0].timesSelected = 3
      players[1].timesSelected = 1
      players[2].timesSelected = 2
      players[3].timesSelected = 1

      const selected = selector.selectNext()
      // Should select Bob or Diana (both have 1 selection)
      expect(['Bob', 'Diana']).toContain(selected.name)
      expect(selected.timesSelected).toBe(2)
    })
  })

  describe('getSelectionStats', () => {
    it('should return correct stats for new selector', () => {
      const stats = selector.getSelectionStats()
      expect(stats.minSelections).toBe(0)
      expect(stats.maxSelections).toBe(0)
      expect(stats.averageSelections).toBe(0)
      expect(stats.fairnessScore).toBe(1)
    })

    it('should return correct stats after selections', () => {
      selector.selectNext() // Alice: 1
      selector.selectNext() // Bob: 1
      selector.selectNext() // Charlie: 1

      const stats = selector.getSelectionStats()
      expect(stats.minSelections).toBe(0) // Diana still has 0
      expect(stats.maxSelections).toBe(1)
      expect(stats.averageSelections).toBe(0.75) // 3/4
      expect(stats.fairnessScore).toBeLessThan(1) // Not perfectly fair
    })

    it('should return perfect fairness score when all equal', () => {
      // Select each player once
      selector.selectNext() // Alice
      selector.selectNext() // Bob
      selector.selectNext() // Charlie
      selector.selectNext() // Diana

      const stats = selector.getSelectionStats()
      expect(stats.minSelections).toBe(1)
      expect(stats.maxSelections).toBe(1)
      expect(stats.averageSelections).toBe(1)
      expect(stats.fairnessScore).toBe(1)
    })
  })

  describe('addPlayer', () => {
    it('should add new player', () => {
      const newPlayer = new Player('Eve')
      selector.addPlayer(newPlayer)

      expect(selector.getPlayers()).toHaveLength(5)
      expect(selector.getPlayers().map(p => p.name)).toContain('Eve')
    })

    it('should throw error for duplicate player', () => {
      expect(() => selector.addPlayer(players[0])).toThrow('Player already exists')
    })

    it('should allow selection of newly added player', () => {
      const newPlayer = new Player('Eve')
      selector.addPlayer(newPlayer)

      // Select all original players once
      selector.selectNext() // Alice
      selector.selectNext() // Bob
      selector.selectNext() // Charlie
      selector.selectNext() // Diana

      // Next selection should be Eve (0 selections)
      const selected = selector.selectNext()
      expect(selected.name).toBe('Eve')
    })
  })

  describe('removePlayer', () => {
    it('should remove player', () => {
      selector.removePlayer(players[0])

      expect(selector.getPlayers()).toHaveLength(3)
      expect(selector.getPlayers().map(p => p.name)).not.toContain('Alice')
    })

    it('should throw error when removing non-existent player', () => {
      const nonExistentPlayer = new Player('Unknown')
      expect(() => selector.removePlayer(nonExistentPlayer)).toThrow('Player not found')
    })

    it('should throw error when removing last player', () => {
      const singlePlayerSelector = new PlayerSelector([players[0]])
      expect(() => singlePlayerSelector.removePlayer(players[0])).toThrow('Cannot remove the last player')
    })

    it('should continue fair selection after player removal', () => {
      // Select Alice twice
      selector.selectNext() // Alice: 1
      selector.selectNext() // Bob: 1
      selector.selectNext() // Charlie: 1
      selector.selectNext() // Diana: 1
      selector.selectNext() // Alice: 2

      // Remove Alice
      selector.removePlayer(players[0])

      // Next selection should be Bob, Charlie, or Diana (all have 1)
      const selected = selector.selectNext()
      expect(['Bob', 'Charlie', 'Diana']).toContain(selected.name)
    })
  })

  describe('resetAllSelections', () => {
    it('should reset all player selection counts', () => {
      // Make some selections
      selector.selectNext()
      selector.selectNext()
      selector.selectNext()

      selector.resetAllSelections()

      const stats = selector.getSelectionStats()
      expect(stats.minSelections).toBe(0)
      expect(stats.maxSelections).toBe(0)
      expect(stats.averageSelections).toBe(0)
      expect(stats.fairnessScore).toBe(1)
    })
  })

  describe('getPlayerStats', () => {
    it('should return player statistics', () => {
      // Make some selections
      selector.selectNext() // Alice: 1
      selector.selectNext() // Bob: 1
      selector.selectNext() // Charlie: 1
      selector.selectNext() // Diana: 1
      selector.selectNext() // Alice: 2

      const playerStats = selector.getPlayerStats()

      expect(playerStats).toHaveLength(4)

      const aliceStats = playerStats.find(p => p.playerName === 'Alice')
      expect(aliceStats?.timesSelected).toBe(2)
      expect(aliceStats?.selectionPercentage).toBe(40) // 2/5 * 100

      const bobStats = playerStats.find(p => p.playerName === 'Bob')
      expect(bobStats?.timesSelected).toBe(1)
      expect(bobStats?.selectionPercentage).toBe(20) // 1/5 * 100
    })

    it('should handle no selections', () => {
      const playerStats = selector.getPlayerStats()

      expect(playerStats).toHaveLength(4)
      playerStats.forEach((stat) => {
        expect(stat.timesSelected).toBe(0)
        expect(stat.selectionPercentage).toBe(0)
      })
    })
  })

  describe('clone', () => {
    it('should create a deep copy', () => {
      selector.selectNext() // Alice: 1
      selector.selectNext() // Bob: 1

      const cloned = selector.clone()

      expect(cloned.getPlayers()).toHaveLength(4)
      expect(cloned.getSelectionStats()).toEqual(selector.getSelectionStats())

      // Verify it's a deep copy
      cloned.selectNext()
      expect(cloned.getSelectionStats()).not.toEqual(selector.getSelectionStats())
    })
  })
})
