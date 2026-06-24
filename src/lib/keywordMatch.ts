// 柱タイトルから法令参照部分（括弧）を除去してキーワード抽出
export function extractKeywords(pillarTitle: string): string[] {
  const cleaned = pillarTitle.replace(/\s*\(.*?\)/g, '').trim()
  // 読点・スラッシュ・中点で分割
  const parts = cleaned.split(/[・／\s]+/).filter(s => s.length >= 2)
  const result = [cleaned, ...parts]
  return [...new Set(result)]
}

// 音声テキストが柱タイトルのキーワードをどれだけ含むか（0〜1）
export function matchScore(spoken: string, pillarTitle: string): number {
  const keywords = extractKeywords(pillarTitle)
  if (keywords.length === 0) return 0
  const matched = keywords.filter(kw => spoken.includes(kw))
  return matched.length / keywords.length
}

export interface PillarMatchResult {
  pillarTitle: string
  score: number
  matched: boolean
}

// 全柱に対してマッチング実行
export function matchAllPillars(
  spoken: string,
  pillarTitles: string[]
): PillarMatchResult[] {
  return pillarTitles.map(title => {
    const score = matchScore(spoken, title)
    return { pillarTitle: title, score, matched: score >= 0.5 }
  })
}

// 全体の正答率（0〜1）
export function overallScore(results: PillarMatchResult[]): number {
  if (results.length === 0) return 0
  const matched = results.filter(r => r.matched).length
  return matched / results.length
}

// スコアから SM-2 quality（0〜5）に変換
export function scoreToQuality(rate: number): number {
  if (rate >= 0.9) return 5
  if (rate >= 0.7) return 4
  if (rate >= 0.5) return 3
  if (rate >= 0.3) return 2
  if (rate >= 0.1) return 1
  return 0
}
