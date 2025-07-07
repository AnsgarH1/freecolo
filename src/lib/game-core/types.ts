export type Question = {
  id: string
  text: string
  type: 'action' | 'dare' | 'question' | 'rule'
  difficulty?: 'easy' | 'medium' | 'hard'
  tags: string[]
  minPlayers?: number
  maxPlayers?: number
}

export type QuestionCatalog = {
  id: string
  name: string
  version: string
  description: string
  questions: Question[]
  metadata: {
    totalQuestions: number
    tags: string[]
    difficulty: string[]
    minPlayers: number
    maxPlayers: number
  }
}

export type GameTurn = {
  question: Question
  selectedPlayer: Player
  processedText: string
  turnNumber: number
  timestamp: Date
}

export type GameStats = {
  totalTurns: number
  questionsRemaining: number
  completionPercentage: number
  playerStats: PlayerStats[]
  gameStartTime: Date
  gameDuration: number // in milliseconds
}

export type PlayerStats = {
  playerId: string
  playerName: string
  timesSelected: number
  selectionPercentage: number
  lastSelectedAt?: Date
}

export type SelectionStats = {
  minSelections: number
  maxSelections: number
  averageSelections: number
  fairnessScore: number // 0-1, where 1 is perfectly fair
}

export type GameState = {
  players: Player[]
  questionCatalog: QuestionCatalog | null
  currentQuestionIndex: number
  gameStartTime: Date
  isGameActive: boolean
  isGameFinished: boolean
  gameHistory: GameTurn[]
}

export type Player = {
  id: string
  name: string
  avatar?: string
  timesSelected: number
  createdAt: Date
}

export type GameStatus = 'setup' | 'playing' | 'finished'
