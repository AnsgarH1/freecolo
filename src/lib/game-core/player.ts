import type { Player as PlayerInterface } from './types'

export class Player implements PlayerInterface {
  public readonly id: string
  public name: string
  public avatar?: string
  public timesSelected: number
  public readonly createdAt: Date

  constructor(name: string, avatar?: string) {
    this.validateName(name)
    this.name = name.trim()
    this.avatar = avatar
    // eslint-disable-next-line sonarjs/pseudo-random
    this.id = Math.random().toString(36).substring(2, 15)
    this.timesSelected = 0
    this.createdAt = new Date()
  }

  private validateName(name: string): void {
    const trimmedName = name.trim()
    if (!trimmedName) {
      throw new Error('Player name cannot be empty')
    }
  }

  public incrementSelection(): void {
    this.timesSelected++
  }

  public resetSelectionCount(): void {
    this.timesSelected = 0
  }

  public updateName(newName: string): void {
    this.validateName(newName)
    this.name = newName.trim()
  }

  public updateAvatar(newAvatar?: string): void {
    this.avatar = newAvatar
  }

  public toJSON(): Record<string, any> {
    return {
      id: this.id,
      name: this.name,
      avatar: this.avatar,
      timesSelected: this.timesSelected,
      createdAt: this.createdAt.toISOString(),
    }
  }

  public static fromJSON(json: Record<string, any>): Player {
    if (!json.id || !json.name || json.timesSelected === undefined || !json.createdAt) {
      throw new Error('Invalid player JSON')
    }

    const player = new Player(json.name, json.avatar)
    // Override generated values with JSON values
    ;(player as any).id = json.id
    player.timesSelected = json.timesSelected
    ;(player as any).createdAt = new Date(json.createdAt)

    return player
  }

  public equals(other: Player): boolean {
    return this.id === other.id
  }

  public clone(): Player {
    return Player.fromJSON(this.toJSON())
  }
}
