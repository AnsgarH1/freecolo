import type { Player } from './player'
import type { PlayerStats, SelectionStats } from './types'

export class PlayerSelector {
  private players: Player[]

  constructor(players: Player[]) {
    if (players.length === 0) {
      throw new Error('At least one player is required')
    }

    // Check for duplicates
    const playerIds = new Set(players.map(p => p.id))
    if (playerIds.size !== players.length) {
      throw new Error('Duplicate players are not allowed')
    }

    this.players = [...players] // Create a copy
  }

  public selectNext(): Player {
    // Find the minimum selection count
    const minSelections = Math.min(...this.players.map(p => p.timesSelected))

    // Get all players with the minimum selection count
    const candidatePlayers = this.players.filter(p => p.timesSelected === minSelections)

    // Select the first candidate (deterministic selection)
    const selectedPlayer = candidatePlayers[0]

    // Increment the selection count
    selectedPlayer.incrementSelection()

    return selectedPlayer
  }

  public getPlayers(): Player[] {
    return [...this.players] // Return a copy
  }

  public getSelectionStats(): SelectionStats {
    const selections = this.players.map(p => p.timesSelected)
    const minSelections = Math.min(...selections)
    const maxSelections = Math.max(...selections)
    const totalSelections = selections.reduce((sum, count) => sum + count, 0)
    const averageSelections = totalSelections / this.players.length

    // Calculate fairness score (1 = perfectly fair, 0 = completely unfair)
    let fairnessScore = 1
    if (maxSelections > 0) {
      const variance = selections.reduce((sum, count) => sum + (count - averageSelections) ** 2, 0) / this.players.length
      const standardDeviation = Math.sqrt(variance)
      // Normalize fairness score (lower deviation = higher fairness)
      fairnessScore = Math.max(0, 1 - (standardDeviation / (maxSelections || 1)))
    }

    return {
      minSelections,
      maxSelections,
      averageSelections,
      fairnessScore,
    }
  }

  public addPlayer(player: Player): void {
    if (this.players.some(p => p.equals(player))) {
      throw new Error('Player already exists')
    }
    this.players.push(player)
  }

  public removePlayer(player: Player): void {
    if (this.players.length === 1) {
      throw new Error('Cannot remove the last player')
    }

    const index = this.players.findIndex(p => p.equals(player))
    if (index === -1) {
      throw new Error('Player not found')
    }

    this.players.splice(index, 1)
  }

  public resetAllSelections(): void {
    this.players.forEach(player => player.resetSelectionCount())
  }

  public getPlayerStats(): PlayerStats[] {
    const totalSelections = this.players.reduce((sum, p) => sum + p.timesSelected, 0)

    return this.players.map(player => ({
      playerId: player.id,
      playerName: player.name,
      timesSelected: player.timesSelected,
      selectionPercentage: totalSelections > 0 ? Math.round((player.timesSelected / totalSelections) * 100) : 0,
      lastSelectedAt: undefined, // Not implemented yet - would need to track selection timestamps
    }))
  }

  public clone(): PlayerSelector {
    const clonedPlayers = this.players.map(player => player.clone())
    return new PlayerSelector(clonedPlayers)
  }
}
