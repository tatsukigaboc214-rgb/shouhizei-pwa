import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import questionsData from '../data/questions.json'
import { useSRSStore } from '../store/srsStore'
import { BodyText } from './BodyMode'

interface Pillar { pillar_title: string; body: string }
interface Question { id: number; title: string; pillars: Pillar[]; rotation_group: number }
const questions = questionsData.questions as Question[]

export default function AudioMode() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { reviewQuestion } = useSRSStore()

  const q = questions.find(q => q.id === Number(id))
  if (!q) return <div className="p-4 text-slate-400">問題が見つかりません</div>

  const [rated, setRated] = useState(false)

  const handleRate = (quality: number) => {
    reviewQuestion(q.id, quality)
    setRated(true)
    setTimeout(() => navigate(-1), 600)
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-40">
      <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur border-b border-slate-700/50 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-slate-200 p-1 -ml-1">← 戻る</button>
        <div className="min-w-0">
          <h1 className="font-bold truncate">{q.title}</h1>
          <p className="text-xs text-slate-500">{q.pillars.length}柱 · 音読モード</p>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4 max-w-lg mx-auto">
        <p className="text-xs text-slate-500 text-center">本文を声に出して読んでください</p>

        {q.pillars.map((p, i) => (
          <div key={i} className="bg-slate-800 border border-purple-500/30 rounded-2xl px-5 py-4 space-y-2">
            <p className="font-bold text-sm text-purple-300">{p.pillar_title}</p>
            <BodyText text={p.body} />
          </div>
        ))}
      </div>

      {/* 下部評価 */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur border-t border-slate-700/50 px-4 py-4 max-w-lg mx-auto space-y-2">
        <p className="text-xs text-center text-slate-400">音読できたら難易度を評価</p>
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: '全然NG', q: 0, color: 'bg-red-600 hover:bg-red-500' },
            { label: '難しい', q: 2, color: 'bg-orange-600 hover:bg-orange-500' },
            { label: '普通', q: 3, color: 'bg-yellow-600 hover:bg-yellow-500' },
            { label: '完璧', q: 5, color: 'bg-green-600 hover:bg-green-500' },
          ].map(btn => (
            <button
              key={btn.q}
              onClick={() => handleRate(btn.q)}
              disabled={rated}
              className={`py-2.5 ${btn.color} rounded-xl text-sm font-semibold transition-colors disabled:opacity-50`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
