import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { SRSCard, createCard, applyReview, isDue } from '../lib/sm2'

interface SRSStore {
  cards: Record<number, SRSCard>
  reviewQuestion: (questionId: number, quality: number) => void
  getCard: (questionId: number) => SRSCard
  getDueIds: (excludeGroup?: number) => number[]
  resetCard: (questionId: number) => void
}

export const useSRSStore = create<SRSStore>()(
  persist(
    (set, get) => ({
      cards: {},

      getCard(questionId) {
        return get().cards[questionId] ?? createCard(questionId)
      },

      reviewQuestion(questionId, quality) {
        const card = get().getCard(questionId)
        const updated = applyReview(card, quality)
        set(state => ({ cards: { ...state.cards, [questionId]: updated } }))
      },

      getDueIds(excludeGroup) {
        const { cards } = get()
        return Object.values(cards)
          .filter(c => isDue(c))
          .map(c => c.questionId)
          .filter(id => excludeGroup === undefined || true)
      },

      resetCard(questionId) {
        set(state => {
          const next = { ...state.cards }
          delete next[questionId]
          return { cards: next }
        })
      }
    }),
    { name: 'shouhizei-srs-v1' }
  )
)
