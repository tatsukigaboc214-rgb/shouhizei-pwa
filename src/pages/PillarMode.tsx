import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import questionsData from '../data/questions.json'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'
import { matchAllPillars, overallScore, scoreToQuality } from '../lib/keywordMatch'
import { useSRSStore } from '../store/srsStore'

interface Pillar { pillar_title: string; body: string }
interface Question { id: number; title: string; pillars: Pillar[]; rotation_group: number }

const questions = questionsData.questions as Question[]

type DisplayMode = 'title' | 'pillars' | 'full'
type Phase = 'study' | 'recording' | 'result'

export default function PillarMode() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const q = questions.find(q => q.id === Number(id))
  const { reviewQuestion, getCard } = useSRSStore()

  const [displayMode, setDisplayMode] = useState<DisplayMode>('pillars')
  const [phase, setPhase] = useState<Phase>('study')
  const [expandedPillar, setExpandedPillar] = useState<number | null>(null)
  const [textInput, setTextInput] = useState('')
  const { status, transcript, start, stop, reset, isSupported } = useSpeechRecognition()

  if (!q) return <div className="p-4 text-slate-400">問題が見つかりません</div>

  const card = getCard(q.id)
  const effectiveTranscript = isSupported ? transcript : textInput
  const matchResults = phase === 'result' && effectiveTranscript
    ? matchAllPillars(effectiveTranscript, q.pillars.map(p => p.pillar_title))
    : []
  const score = overallScore(matchResults)

  const handleStart = () => {
    setPhase('recording')
    reset()
    setTextInput('')
    if (isSupported) start()
  }

  const handleStop = () => {
    if (isSupported) stop()
    setPhase('result')
  }

  const handleRate = (quality: number) => {
    reviewQuestion(q.id, quality)
    navigate(-1)
  }

  const qualityButtons = [
    { label: '全然NG', q: 0, color: 'bg-red-600 hover:bg-red-500' },
    { label: '難しい', q: 2, color: 'bg-orange-600 hover:bg-orange-500' },
    { label: '普通', q: 3, color: 'bg-yellow-600 hover:bg-yellow-500' },
    { label: '完璧', q: 5, color: 'bg-green-600 hover:bg-green-500' }
  ]

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-24">
      {/* ヘッダー */}
      <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur border-b border-slate-700/50 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="text-slate-400 hover:text-slate-200 transition-colors p-1 -ml-1"
        >
          ← 戻る
        </button>
        <div className="min-w-0">
          <h1 className="font-bold truncate">{q.title}</h1>
          <p className="text-xs text-slate-500">{q.pillars.length}柱</p>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4 max-w-lg mx-auto">
        {/* SRS状態 */}
        {card.lastReview && (
          <div className="text-xs text-slate-500 bg-slate-800/50 rounded-lg px-3 py-2 flex gap-4">
            <span>前回: {card.lastReview}</span>
            <span>次回: {card.nextReview}</span>
            <span>EF: {card.easeFactor.toFixed(2)}</span>
          </div>
        )}

        {/* 表示モード切替 */}
        <div className="flex rounded-lg overflow-hidden border border-slate-700 text-sm">
          {([['title', 'タイトルのみ'], ['pillars', '柱のみ'], ['full', '全文']] as [DisplayMode, string][]).map(([m, label]) => (
            <button
              key={m}
              onClick={() => setDisplayMode(m)}
              className={`flex-1 py-2 transition-colors ${displayMode === m ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* 柱一覧 */}
        <div className="space-y-3">
          {q.pillars.map((p, i) => {
            const mr = matchResults[i]
            const borderColor = phase === 'result'
              ? mr?.matched ? 'border-green-500/60' : 'border-red-500/40'
              : 'border-slate-700/50'
            return (
              <div key={i} className={`rounded-xl border ${borderColor} bg-slate-800 overflow-hidden transition-colors`}>
                {/* 柱タイトル */}
                <button
                  className="w-full text-left px-4 py-3 flex items-center justify-between gap-2"
                  onClick={() => setExpandedPillar(expandedPillar === i ? null : i)}
                >
                  <span className="font-medium text-sm leading-snug">
                    {displayMode === 'title'
                      ? `柱 ${i + 1}`
                      : p.pillar_title}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    {phase === 'result' && (
                      mr?.matched
                        ? <span className="text-green-400 text-lg">✓</span>
                        : <span className="text-red-400 text-lg">✗</span>
                    )}
                    {displayMode !== 'title' && (
                      <span className="text-slate-500 text-xs">{expandedPillar === i ? '▲' : '▼'}</span>
                    )}
                  </div>
                </button>

                {/* 本文 */}
                {(displayMode === 'full' || (displayMode !== 'title' && expandedPillar === i)) && (
                  <div className="px-4 pb-4 text-xs text-slate-400 leading-relaxed border-t border-slate-700/50 pt-3 whitespace-pre-wrap">
                    {p.body}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* 下部フローティングコントロール */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur border-t border-slate-700/50 px-4 py-4 max-w-lg mx-auto">
        {phase === 'study' && (
          <div className="space-y-3">
            {!isSupported && (
              <p className="text-xs text-amber-400 text-center">
                ※ 音声入力非対応のため、テキスト入力モードで使用します
              </p>
            )}
            <button
              onClick={handleStart}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-lg transition-colors"
            >
              {isSupported ? '🎤 柱挙げ開始' : '✏️ テキスト入力で開始'}
            </button>
          </div>
        )}

        {phase === 'recording' && (
          <div className="space-y-3">
            {isSupported ? (
              <div className="bg-slate-800 rounded-xl px-4 py-3 min-h-[60px]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-xs text-red-400">録音中…</span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {transcript || '話してください…'}
                </p>
              </div>
            ) : (
              <div className="bg-slate-800 rounded-xl px-4 py-3">
                <p className="text-xs text-slate-400 mb-2">覚えている柱のタイトルをすべて入力してください</p>
                <textarea
                  className="w-full bg-slate-700 text-slate-100 rounded-lg px-3 py-2 text-sm resize-none outline-none border border-slate-600 focus:border-blue-500"
                  rows={4}
                  placeholder="例：長期大規模工事の請負&#10;工事の請負に係る契約&#10;付記事項…"
                  value={textInput}
                  onChange={e => setTextInput(e.target.value)}
                  autoFocus
                />
              </div>
            )}
            <button
              onClick={handleStop}
              className="w-full py-3 bg-red-600 hover:bg-red-500 rounded-xl font-bold text-lg transition-colors"
            >
              ⏹ 停止して採点
            </button>
          </div>
        )}

        {phase === 'result' && (
          <div className="space-y-3">
            <div className="bg-slate-800 rounded-xl px-4 py-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-slate-400">正答率</span>
                <span className={`text-lg font-bold ${score >= 0.7 ? 'text-green-400' : score >= 0.4 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {Math.round(score * 100)}%（{matchResults.filter(r => r.matched).length}/{matchResults.length}柱）
                </span>
              </div>
              {effectiveTranscript && (
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">入力: {effectiveTranscript}</p>
              )}
            </div>
            <p className="text-xs text-center text-slate-500">難易度を評価してSRSを更新</p>
            <div className="grid grid-cols-4 gap-2">
              {qualityButtons.map(({ label, q: qual, color }) => (
                <button
                  key={qual}
                  onClick={() => handleRate(qual)}
                  className={`py-2.5 ${color} rounded-xl text-sm font-semibold transition-colors`}
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              onClick={() => { setPhase('study'); reset() }}
              className="w-full py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
            >
              もう一度
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
