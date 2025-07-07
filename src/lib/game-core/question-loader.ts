import type { QuestionCatalog } from './types'

import questionsData from './questions.json'

export function loadQuestionCatalog(): QuestionCatalog {
  return questionsData as QuestionCatalog
}
