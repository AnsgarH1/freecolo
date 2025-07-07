import { beforeEach, describe, expect, it } from 'vitest'

import { Game, loadQuestionCatalog, Player } from '../index'

describe('question catalog', () => {
  let players: Player[]

  beforeEach(() => {
    players = [
      new Player('Alex'),
      new Player('Ben'),
      new Player('Chloe'),
      new Player('David'),
    ]
  })

  it('should load question catalog successfully', () => {
    const catalog = loadQuestionCatalog()

    expect(catalog.id).toBe('freecolo-party-questions')
    expect(catalog.name).toBe('FreeColo Party Questions')
    expect(catalog.questions).toHaveLength(25)
    expect(catalog.metadata.totalQuestions).toBe(25)
    expect(catalog.metadata.minPlayers).toBe(2)
    expect(catalog.metadata.maxPlayers).toBe(10)
  })

  it('should create game with loaded question catalog', () => {
    const catalog = loadQuestionCatalog()
    const game = new Game(players, catalog)

    expect(game.getPlayers()).toHaveLength(4)
    expect(game.getStatus()).toBe('setup')
  })

  it('should play game with loaded questions', () => {
    const catalog = loadQuestionCatalog()
    const game = new Game(players, catalog)

    game.startGame()

    const turn1 = game.nextTurn()
    expect(turn1.question.text).toContain('{player}')
    expect(turn1.processedText).toContain(turn1.selectedPlayer.name)
    expect(turn1.processedText).not.toContain('{player}')

    const turn2 = game.nextTurn()
    expect(turn2.turnNumber).toBe(2)
    expect(turn2.question.id).not.toBe(turn1.question.id) // Different question
  })

  it('should have questions with proper structure', () => {
    const catalog = loadQuestionCatalog()

    catalog.questions.forEach((question) => {
      expect(question.id).toBeDefined()
      expect(question.text).toBeDefined()
      expect(question.type).toMatch(/^(action|dare|question|rule)$/)
      expect(question.tags).toBeInstanceOf(Array)
      expect(question.minPlayers).toBeGreaterThanOrEqual(2)
      expect(question.maxPlayers).toBeLessThanOrEqual(10)
    })
  })

  it('should contain the specific questions from user examples', () => {
    const catalog = loadQuestionCatalog()

    // Check for some specific questions
    const storyChain = catalog.questions.find(q => q.id === 'story-chain')
    expect(storyChain).toBeDefined()
    expect(storyChain?.text).toContain('start a story with a single sentence')

    const mirrorMovements = catalog.questions.find(q => q.id === 'mirror-movements')
    expect(mirrorMovements).toBeDefined()
    expect(mirrorMovements?.text).toContain('mirror their movements')

    const massageDare = catalog.questions.find(q => q.id === 'massage-dare')
    expect(massageDare).toBeDefined()
    expect(massageDare?.text).toContain('shoulder massage')
  })
})
