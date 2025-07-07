import { beforeEach, describe, expect, it } from 'vitest'

import { Player } from '../player'

describe('player', () => {
  let player: Player

  beforeEach(() => {
    player = new Player('John Doe')
  })

  describe('constructor', () => {
    it('should create a player with name', () => {
      expect(player.name).toBe('John Doe')
      expect(player.id).toBeDefined()
      expect(player.timesSelected).toBe(0)
      expect(player.createdAt).toBeInstanceOf(Date)
    })

    it('should create a player with name and avatar', () => {
      const playerWithAvatar = new Player('Jane Doe', '👩')
      expect(playerWithAvatar.name).toBe('Jane Doe')
      expect(playerWithAvatar.avatar).toBe('👩')
    })

    it('should generate unique IDs for different players', () => {
      const player1 = new Player('Player 1')
      const player2 = new Player('Player 2')
      expect(player1.id).not.toBe(player2.id)
    })

    it('should throw error for empty name', () => {
      expect(() => new Player('')).toThrow('Player name cannot be empty')
    })

    it('should throw error for whitespace-only name', () => {
      expect(() => new Player('   ')).toThrow('Player name cannot be empty')
    })

    it('should trim whitespace from name', () => {
      const playerWithSpaces = new Player('  John Doe  ')
      expect(playerWithSpaces.name).toBe('John Doe')
    })
  })

  describe('incrementSelection', () => {
    it('should increment selection count', () => {
      expect(player.timesSelected).toBe(0)
      player.incrementSelection()
      expect(player.timesSelected).toBe(1)
    })

    it('should increment multiple times', () => {
      player.incrementSelection()
      player.incrementSelection()
      player.incrementSelection()
      expect(player.timesSelected).toBe(3)
    })
  })

  describe('resetSelectionCount', () => {
    it('should reset selection count to zero', () => {
      player.incrementSelection()
      player.incrementSelection()
      expect(player.timesSelected).toBe(2)

      player.resetSelectionCount()
      expect(player.timesSelected).toBe(0)
    })
  })

  describe('updateName', () => {
    it('should update player name', () => {
      player.updateName('New Name')
      expect(player.name).toBe('New Name')
    })

    it('should trim whitespace when updating name', () => {
      player.updateName('  New Name  ')
      expect(player.name).toBe('New Name')
    })

    it('should throw error for empty name', () => {
      expect(() => player.updateName('')).toThrow('Player name cannot be empty')
    })

    it('should throw error for whitespace-only name', () => {
      expect(() => player.updateName('   ')).toThrow('Player name cannot be empty')
    })
  })

  describe('updateAvatar', () => {
    it('should update player avatar', () => {
      player.updateAvatar('🎮')
      expect(player.avatar).toBe('🎮')
    })

    it('should clear avatar when set to undefined', () => {
      player.updateAvatar('🎮')
      player.updateAvatar(undefined)
      expect(player.avatar).toBeUndefined()
    })
  })

  describe('toJSON', () => {
    it('should serialize player to JSON', () => {
      const json = player.toJSON()
      expect(json).toEqual({
        id: player.id,
        name: 'John Doe',
        avatar: undefined,
        timesSelected: 0,
        createdAt: player.createdAt.toISOString(),
      })
    })

    it('should serialize player with avatar to JSON', () => {
      player.updateAvatar('🎮')
      const json = player.toJSON()
      expect(json.avatar).toBe('🎮')
    })
  })

  describe('fromJSON', () => {
    it('should deserialize player from JSON', () => {
      const json = {
        id: 'test-id',
        name: 'Test Player',
        avatar: '🎮',
        timesSelected: 5,
        createdAt: '2023-01-01T00:00:00.000Z',
      }

      const deserializedPlayer = Player.fromJSON(json)
      expect(deserializedPlayer.id).toBe('test-id')
      expect(deserializedPlayer.name).toBe('Test Player')
      expect(deserializedPlayer.avatar).toBe('🎮')
      expect(deserializedPlayer.timesSelected).toBe(5)
      expect(deserializedPlayer.createdAt).toEqual(new Date('2023-01-01T00:00:00.000Z'))
    })

    it('should deserialize player without avatar', () => {
      const json = {
        id: 'test-id',
        name: 'Test Player',
        timesSelected: 0,
        createdAt: '2023-01-01T00:00:00.000Z',
      }

      const deserializedPlayer = Player.fromJSON(json)
      expect(deserializedPlayer.avatar).toBeUndefined()
    })

    it('should throw error for invalid JSON', () => {
      expect(() => Player.fromJSON({} as any)).toThrow('Invalid player JSON')
    })
  })

  describe('equals', () => {
    it('should return true for same player', () => {
      expect(player.equals(player)).toBe(true)
    })

    it('should return true for players with same ID', () => {
      const otherPlayer = Player.fromJSON(player.toJSON())
      expect(player.equals(otherPlayer)).toBe(true)
    })

    it('should return false for different players', () => {
      const otherPlayer = new Player('Other Player')
      expect(player.equals(otherPlayer)).toBe(false)
    })
  })

  describe('clone', () => {
    it('should create a deep copy of the player', () => {
      player.updateAvatar('🎮')
      player.incrementSelection()

      const clonedPlayer = player.clone()

      expect(clonedPlayer.equals(player)).toBe(true)
      expect(clonedPlayer).not.toBe(player) // Different object reference
      expect(clonedPlayer.name).toBe(player.name)
      expect(clonedPlayer.avatar).toBe(player.avatar)
      expect(clonedPlayer.timesSelected).toBe(player.timesSelected)
    })
  })
})
