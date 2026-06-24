import { useParams, useNavigate } from 'react-router-dom'
import questionsData from '../data/questions.json'
import { useSRSStore } from '../store/srsStore'
import { isDue } from '../lib/sm2'

interface Question { id: number; title: string; pillars: { pillar_title: string; body: string }[]; rotation_group: number }
const questions = questionsData.questions as Question[]

const MODES = [
  {
    key: 'pillar',
    label: '柱挙げモード',
    desc: '問題タイトルから柱名を音声/テキストで列挙して採点',
    icon: '🎤',
    color: 'border-blue-500/50 bg-blue-500/10 hover:bg-blue-500/20',
    labelColor: 'text-blue-400',
  },
  {
    key: 'body',
    label: '本文暗記モード',
    desc: '柱タイトルを見て本文を思い出す（フラッシュカード）',
    icon: '📖',
    color: 'border-green-500/50 bg-green-500/10 hover:bg-green-500/20',
    labelColor: 'text-green-400',
  },
  {
    key: 'audio',
    label: '音読モード',
    desc: '本文を全表示して読み上げ・SRS評価',
    icon: '🔊',
    color: 'border-purple-500/50 bg-purple-500/10 hover:bg-purple-500/20',
    labelColor: 'text-purple-400',
  },
]

export default function QuestionMenu() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { cards } = useSRSStore()

  const q = questions.find(q => q.id === Number(id))
  if (!q) return <div className="p-4 text-slate-400">問題が見つかりません</div>

  const card = cards[q.id]
  const due = card ? isDue(card) : false

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur border-b border-slate-700/50 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-slate-200 p-1 -ml-1">
          ← 戻る
        </button>
        <div className="min-w-0">
          <h1 className="font-bold truncate">{q.title}</h1>
          <p className="text-xs text-slate-500">{q.pillars.length}柱</p>
        </div>
      </div>

      <div className="px-4 pt-6 space-y-4 max-w-lg mx-auto">
        {card && (
          <div className="text-xs text-slate-500 bg-slate-800/50 rounded-lg px-3 py-2 flex gap-4">
            <span>前回: {card.lastReview ?? '未'}</span>
            <span>次回: {card.nextReview}</span>
            <span>EF: {card.easeFactor.toFixed(2)}</span>
            {due && <span className="text-amber-400 font-semibold">復習期</span>}
          </div>
        )}

        <p className="text-sm text-slate-400 text-center pb-2">学習モードを選んでください</p>

        <div className="space-y-3">
          {MODES.map(m => (
            <button
              key={m.key}
              onClick={() => navigate(`/question/${id}/${m.key}`)}
              className={`w-full text-left border rounded-2xl px-5 py-4 transition-colors ${m.color}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{m.icon}</span>
                <div>
                  <p className={`font-bold text-base ${m.labelColor}`}>{m.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{m.desc}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
