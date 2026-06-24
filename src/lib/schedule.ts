// 曜日 → rotation_group のマッピング
// 0=日→G7, 1=月→G1, 2=火→G2, 3=水→G3, 4=木→G4, 5=金→G5, 6=土→G6
const DAY_TO_GROUP: Record<number, number> = {
  0: 7,
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6
}

export function todayGroup(): number {
  return DAY_TO_GROUP[new Date().getDay()]
}

export const GROUP_LABELS: Record<number, string> = {
  1: 'G1（月）第1章 課税の対象',
  2: 'G2（火）第2章 納税義務者',
  3: 'G3（水）第3-5章 譲渡等の時期の特例・課税期間・課税標準',
  4: 'G4（木）第6章前半 税額控除・調整対象固定資産等',
  5: 'G5（金）第6章後半 簡易課税・対価の返還等・貸倒れ',
  6: 'G6（土）第7章 申告等',
  7: 'G7（日）第8章 雑則・その他'
}

export const DAY_NAMES = ['日', '月', '火', '水', '木', '金', '土']

export function todayLabel(): string {
  const d = new Date()
  const dow = DAY_NAMES[d.getDay()]
  const g = todayGroup()
  return `${d.getMonth() + 1}月${d.getDate()}日（${dow}）— G${g}`
}
