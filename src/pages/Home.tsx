import { useNavigate } from 'react-router-dom'
import questionsData from '../data/questions.json'
import { todayGroup, todayLabel, GROUP_LABELS } from '../lib/schedule'
import { useSRSStore } from '../store/srsStore'
import { isDue } from '../lib/sm2'

interface Question {
  id: number
  title: string
  pillars: { pillar_title: string; body: string }[]
  rotation_group: number
}

const questions = questionsData.questions as Question[]

export default function Home() {
  const navigate = useNavigate()
  const { cards } = useSRSStore()
  const todayG = todayGroup()

  const todayQuestions = questions.filter(q => q.rotation_group === todayG)

  // SRS due で今日のグループ以外のもの
  const dueQuestions = questions.filter(q => {
    if (q.rotation_group === todayG) return false
    const card = cards[q.id]
    return card ? isDue(card) : false
  })

  const getCardStatus = (id: number) => {
    const card = cards[id]
    if (!card) return null
    return card
  }

  const statusBadge = (id: number) => {
    const card = getCardStatus(id)
    if (!card) return <span className="text-xs text-slate-500">未学習</span>
    if (isDue(card))
      return <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">復習期</span>
    return (
      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
        {card.interval}日後
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-8">
      {/* ヘッダー */}
      <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur border-b border-slate-700/50 px-4 py-3">
        <h1 className="text-lg font-bold">消費税法 理論暗記</h1>
        <p className="text-sm text-slate-400">{todayLabel()}</p>
      </div>

      <div className="px-4 pt-4 space-y-6 max-w-lg mx-auto">
        {/* SRS復習キュー */}
        {dueQuestions.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-amber-400 mb-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
              SRS復習（{dueQuestions.length}問）
            </h2>
            <div className="space-y-2">
              {dueQuestions.map(q => (
                <QuestionRow
                  key={q.id}
                  q={q}
                  badge={statusBadge(q.id)}
                  onClick={() => navigate(`/question/${q.id}`)}
                  accent="amber"
                />
              ))}
            </div>
          </section>
        )}

        {/* 今日のグループ */}
        <section>
          <h2 className="text-sm font-semibold text-blue-400 mb-2 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-400 rounded-full" />
            今日のセクション — {GROUP_LABELS[todayG].split('）')[1]}
          </h2>
          <div className="space-y-2">
            {todayQuestions.map(q => (
              <QuestionRow
                key={q.id}
                q={q}
                badge={statusBadge(q.id)}
                onClick={() => navigate(`/question/${q.id}`)}
                accent="blue"
              />
            ))}
          </div>
        </section>

        {/* 全問題リンク */}
        <section>
          <details className="group">
            <summary className="text-sm text-slate-500 cursor-pointer hover:text-slate-300 transition-colors list-none flex items-center gap-1">
              <span className="group-open:rotate-90 transition-transform inline-block">▶</span>
              全グループ一覧
            </summary>
            <div className="mt-3 space-y-4">
              {[1,2,3,4,5,6,7].map(g => (
                <div key={g}>
                  <p className="text-xs text-slate-500 mb-1">{GROUP_LABELS[g]}</p>
                  <div className="space-y-1.5">
                    {questions.filter(q => q.rotation_group === g).map(q => (
                      <QuestionRow
                        key={q.id}
                        q={q}
                        badge={statusBadge(q.id)}
                        onClick={() => navigate(`/question/${q.id}`)}
                        accent="slate"
                        compact
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </details>
        </section>
      </div>
    </div>
  )
}

function QuestionRow({
  q,
  badge,
  onClick,
  accent,
  compact = false
}: {
  q: Question
  badge: React.ReactNode
  onClick: () => void
  accent: 'blue' | 'amber' | 'slate'
  compact?: boolean
}) {
  const border = accent === 'blue' ? 'border-blue-500/40' : accent === 'amber' ? 'border-amber-500/40' : 'border-slate-600/40'
  return (
    <button
      onClick={onClick}
      className={`w-full text-left bg-slate-800 hover:bg-slate-750 active:bg-slate-700 border ${border} rounded-xl transition-colors ${compact ? 'px-3 py-2' : 'px-4 py-3'}`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className={`font-medium truncate ${compact ? 'text-sm' : ''}`}>{q.title}</p>
          {!compact && (
            <p className="text-xs text-slate-500 mt-0.5">{q.pillars.length}柱</p>
          )}
        </div>
        <div className="shrink-0">{badge}</div>
      </div>
    </button>
  )
}
