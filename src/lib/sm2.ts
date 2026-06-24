export interface SRSCard {
  questionId: number
  easeFactor: number
  interval: number
  repetitions: number
  nextReview: string
  lastReview: string | null
  lastQuality: number | null
}

export function createCard(questionId: number): SRSCard {
  return {
    questionId,
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    nextReview: new Date().toISOString().split('T')[0],
    lastReview: null,
    lastQuality: null
  }
}

// quality: 0=完全NG, 1=難しい, 2=まあまあ, 3=普通, 4=良い, 5=完璧
export function applyReview(card: SRSCard, quality: number): SRSCard {
  const today = new Date().toISOString().split('T')[0]
  let { easeFactor, interval, repetitions } = card

  if (quality < 3) {
    repetitions = 0
    interval = 1
  } else {
    if (repetitions === 0) interval = 1
    else if (repetitions === 1) interval = 6
    else interval = Math.round(interval * easeFactor)

    repetitions += 1
  }

  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  if (easeFactor < 1.3) easeFactor = 1.3

  const nextDate = new Date()
  nextDate.setDate(nextDate.getDate() + interval)

  return {
    ...card,
    easeFactor,
    interval,
    repetitions,
    nextReview: nextDate.toISOString().split('T')[0],
    lastReview: today,
    lastQuality: quality
  }
}

export function isDue(card: SRSCard): boolean {
  const today = new Date().toISOString().split('T')[0]
  return card.nextReview <= today
}
