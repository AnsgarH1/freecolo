import type { GameStats, GameStatus, GameTurn, Question, QuestionCatalog } from './types'

import { Player } from './player'
import { PlayerSelector } from './player-selector'

export class Game {
  private players: Player[]
  private questionCatalog: QuestionCatalog
  private playerSelector: PlayerSelector
  private currentQuestionIndex: number
  private gameStartTime: Date
  private gameHistory: GameTurn[]
  private status: GameStatus

  constructor(players: Player[], questionCatalog: QuestionCatalog) {
    if (players.length === 0) {
      throw new Error('At least one player is required')
    }

    if (questionCatalog.questions.length === 0) {
      throw new Error('Question catalog cannot be empty')
    }

    // Validate player count against catalog requirements
    const minPlayers = questionCatalog.metadata.minPlayers
    const maxPlayers = questionCatalog.metadata.maxPlayers

    if (players.length < minPlayers) {
      throw new Error('Not enough players for this question catalog')
    }

    if (players.length > maxPlayers) {
      throw new Error('Too many players for this question catalog')
    }

    this.players = players.map(p => p.clone())
    this.questionCatalog = { ...questionCatalog }
    this.playerSelector = new PlayerSelector(this.players)
    this.currentQuestionIndex = 0
    this.gameStartTime = new Date()
    this.gameHistory = []
    this.status = 'setup'
  }

  public startGame(): void {
    if (this.status === 'playing') {
      throw new Error('Game is already active')
    }

    if (this.status === 'finished') {
      throw new Error('Game is already finished')
    }

    this.status = 'playing'
    this.gameStartTime = new Date()
  }

  public nextTurn(): GameTurn {
    if (this.currentQuestionIndex >= this.questionCatalog.questions.length) {
      throw new Error('Game is already finished')
    }

    if (this.status !== 'playing') {
      throw new Error('Game is not active')
    }

    const question = this.questionCatalog.questions[this.currentQuestionIndex]
    const selectedPlayer = this.playerSelector.selectNext()
    const processedText = this.processQuestionText(question.text, selectedPlayer)

    const turn: GameTurn = {
      question,
      selectedPlayer: selectedPlayer.clone(),
      processedText,
      turnNumber: this.gameHistory.length + 1,
      timestamp: new Date(),
    }

    this.gameHistory.push(turn)
    this.currentQuestionIndex++

    // Check if game is finished
    if (this.currentQuestionIndex >= this.questionCatalog.questions.length) {
      this.status = 'finished'
    }

    return turn
  }

  private processQuestionText(text: string, player: Player): string {
    return text.replace(/\{player\}/g, player.name)
  }

  public getCurrentQuestion(): Question | null {
    if (this.status !== 'playing' || this.currentQuestionIndex >= this.questionCatalog.questions.length) {
      return null
    }
    return this.questionCatalog.questions[this.currentQuestionIndex]
  }

  public getGameStats(): GameStats {
    const totalQuestions = this.questionCatalog.questions.length
    const completedQuestions = this.gameHistory.length
    const questionsRemaining = totalQuestions - completedQuestions
    const completionPercentage = totalQuestions > 0 ? (completedQuestions / totalQuestions) * 100 : 0

    return {
      totalTurns: this.gameHistory.length,
      questionsRemaining,
      completionPercentage,
      playerStats: this.playerSelector.getPlayerStats(),
      gameStartTime: this.gameStartTime,
      gameDuration: Date.now() - this.gameStartTime.getTime(),
    }
  }

  public getGameHistory(): GameTurn[] {
    return [...this.gameHistory]
  }

  public pauseGame(): void {
    if (this.status !== 'playing') {
      throw new Error('Game is not active')
    }
    this.status = 'setup'
  }

  public resumeGame(): void {
    if (this.status === 'playing') {
      throw new Error('Game is already active or finished')
    }
    if (this.status === 'finished') {
      throw new Error('Game is already active or finished')
    }
    this.status = 'playing'
  }

  public resetGame(): void {
    this.status = 'setup'
    this.currentQuestionIndex = 0
    this.gameHistory = []
    this.gameStartTime = new Date()
    this.playerSelector.resetAllSelections()
  }

  public addPlayer(player: Player): void {
    if (this.status === 'playing') {
      throw new Error('Cannot modify players while game is active')
    }

    this.playerSelector.addPlayer(player.clone())
    this.players = this.playerSelector.getPlayers()
  }

  public removePlayer(player: Player): void {
    if (this.status === 'playing') {
      throw new Error('Cannot modify players while game is active')
    }

    // Check if removal would make game invalid
    if (this.players.length - 1 < this.questionCatalog.metadata.minPlayers) {
      throw new Error('Not enough players for this question catalog')
    }

    this.playerSelector.removePlayer(player)
    this.players = this.playerSelector.getPlayers()
  }

  public getPlayers(): Player[] {
    return this.players.map(p => p.clone())
  }

  public getStatus(): GameStatus {
    return this.status
  }

  public isGameActive(): boolean {
    return this.status === 'playing'
  }

  public isGameFinished(): boolean {
    return this.status === 'finished'
  }

  public toJSON(): Record<string, any> {
    return {
      players: this.players.map(p => p.toJSON()),
      questionCatalog: this.questionCatalog,
      currentQuestionIndex: this.currentQuestionIndex,
      gameStartTime: this.gameStartTime,
      isGameActive: this.isGameActive(),
      isGameFinished: this.isGameFinished(),
      gameHistory: this.gameHistory.map(turn => ({
        question: turn.question,
        selectedPlayer: (turn.selectedPlayer as Player).toJSON(),
        processedText: turn.processedText,
        turnNumber: turn.turnNumber,
        timestamp: turn.timestamp,
      })),
    }
  }

  public static fromJSON(json: Record<string, any>): Game {
    if (!json.players || !json.questionCatalog || json.currentQuestionIndex === undefined) {
      throw new Error('Invalid game state JSON')
    }

    const players = (json.players as any[]).map((p: any) => Player.fromJSON(p))
    const game = new Game(players, json.questionCatalog)

    game.currentQuestionIndex = json.currentQuestionIndex
    game.gameStartTime = new Date(json.gameStartTime)

    // Extract nested ternary into separate logic
    let status: GameStatus = 'setup'
    if (json.isGameFinished) {
      status = 'finished'
    }
    else if (json.isGameActive) {
      status = 'playing'
    }
    game.status = status

    if (json.gameHistory) {
      game.gameHistory = (json.gameHistory as any[]).map((turn: any) => ({
        ...turn,
        selectedPlayer: Player.fromJSON(turn.selectedPlayer),
        timestamp: new Date(turn.timestamp),
      }))
    }

    return game
  }

  public clone(): Game {
    return Game.fromJSON(this.toJSON())
  }
}
