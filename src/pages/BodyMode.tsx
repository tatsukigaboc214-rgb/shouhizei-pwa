import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import questionsData from '../data/questions.json'
import { useSRSStore } from '../store/srsStore'

export function BodyText({ text }: { text: string }) {
  const lines = text.split('\n').filter(l => l.trim() !== '')
  return (
    <div className="space-y-1.5">
      {lines.map((line, i) => {
        const trimmed = line.trim()
        // 大見出し: (1) (2) など
        if (/^\(\d+\)/.test(trimmed)) {
          return (
            <div key={i} className="mt-3 first:mt-0">
              <span className="text-blue-300 font-bold text-sm">{trimmed.match(/^\(\d+\)/)?.[0]}</span>
              <span className="text-slate-200 text-sm"> {trimmed.replace(/^\(\d+\)\s*/, '')}</span>
            </div>
          )
        }
        // 中見出し: ① ② など
        if (/^[①②③④⑤⑥⑦⑧⑨⑩]/.test(trimmed)) {
          return (
            <div key={i} className="pl-4">
              <span className="text-green-300 font-semibold text-sm">{trimmed[0]}</span>
              <span className="text-slate-200 text-sm"> {trimmed.slice(1).trim()}</span>
            </div>
          )
        }
        // 小見出し: (ア) (イ) または イ ロ ハ
        if (/^\(([ア-ン]|[a-z])\)/.test(trimmed) || /^[イロハニホヘト](?!\w)/.test(trimmed)) {
          return (
            <div key={i} className="pl-8 text-sm text-slate-300">
              {trimmed}
            </div>
          )
        }
        // その他
        return (
          <div key={i} className="text-sm text-slate-200 leading-relaxed">
            {trimmed}
          </div>
        )
      })}
    </div>
  )
}

interface Pillar { pillar_title: string; body: string }
interface Question { id: number; title: string; pillars: Pillar[]; rotation_group: number }
const questions = questionsData.questions as Question[]

export default function BodyMode() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { reviewQuestion } = useSRSStore()

  const q = questions.find(q => q.id === Number(id))
  if (!q) return <div className="p-4 text-slate-400">問題が見つかりません</div>

  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [done, setDone] = useState(false)

  const pillar = q.pillars[index]
  const isLast = index === q.pillars.length - 1

  const handleNext = () => {
    if (isLast) {
      setDone(true)
    } else {
      setIndex(i => i + 1)
      setRevealed(false)
    }
  }

  const handleRate = (quality: number) => {
    reviewQuestion(q.id, quality)
    navigate(-1)
  }

  if (done) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
        <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur border-b border-slate-700/50 px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-slate-200 p-1 -ml-1">← 戻る</button>
          <h1 className="font-bold truncate">{q.title}</h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-4 gap-6">
          <p className="text-2xl font-bold text-green-400">全{q.pillars.length}柱 完了！</p>
          <p className="text-sm text-slate-400 text-center">難易度を評価してSRSを更新</p>
          <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
            <button onClick={() => handleRate(0)} className="py-3 bg-red-600 hover:bg-red-500 rounded-xl font-bold transition-colors">全然NG</button>
            <button onClick={() => handleRate(2)} className="py-3 bg-orange-600 hover:bg-orange-500 rounded-xl font-bold transition-colors">難しい</button>
            <button onClick={() => handleRate(3)} className="py-3 bg-yellow-600 hover:bg-yellow-500 rounded-xl font-bold transition-colors">普通</button>
            <button onClick={() => handleRate(5)} className="py-3 bg-green-600 hover:bg-green-500 rounded-xl font-bold transition-colors">完璧</button>
          </div>
          <button onClick={() => { setIndex(0); setRevealed(false); setDone(false) }} className="text-sm text-slate-400 hover:text-slate-200">
            もう一度
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur border-b border-slate-700/50 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-slate-200 p-1 -ml-1">← 戻る</button>
        <div className="min-w-0">
          <h1 className="font-bold truncate">{q.title}</h1>
          <p className="text-xs text-slate-500">{index + 1} / {q.pillars.length}柱</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col px-4 pt-6 pb-32 max-w-lg mx-auto w-full gap-4">
        {/* 進捗バー */}
        <div className="w-full bg-slate-700 rounded-full h-1.5">
          <div
            className="bg-green-500 h-1.5 rounded-full transition-all"
            style={{ width: `${((index + 1) / q.pillars.length) * 100}%` }}
          />
        </div>

        {/* 柱タイトルカード */}
        <div className="bg-slate-800 border border-green-500/40 rounded-2xl px-5 py-5">
          <p className="text-xs text-slate-500 mb-2">柱タイトル</p>
          <p className="font-bold text-lg leading-snug">{pillar.pillar_title}</p>
        </div>

        {/* 本文（隠れている or 表示） */}
        {!revealed ? (
          <button
            onClick={() => setRevealed(true)}
            className="w-full border-2 border-dashed border-slate-600 rounded-2xl py-12 text-slate-500 hover:text-slate-300 hover:border-slate-500 transition-colors text-sm"
          >
            タップして本文を表示
          </button>
        ) : (
          <div className="bg-slate-800 border border-slate-700/50 rounded-2xl px-5 py-5">
            <p className="text-xs text-slate-500 mb-2">本文</p>
            <BodyText text={pillar.body} />
          </div>
        )}
      </div>

      {/* 下部ボタン */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur border-t border-slate-700/50 px-4 py-4 max-w-lg mx-auto">
        {!revealed ? (
          <button
            onClick={() => setRevealed(true)}
            className="w-full py-3 bg-green-600 hover:bg-green-500 rounded-xl font-bold text-lg transition-colors"
          >
            本文を確認
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-lg transition-colors"
          >
            {isLast ? '採点へ' : '次の柱 →'}
          </button>
        )}
      </div>
    </div>
  )
}
