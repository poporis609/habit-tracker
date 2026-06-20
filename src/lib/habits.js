// 습관 관련 순수 계산 로직 (UI와 분리되어 테스트 가능)

/**
 * 오늘부터 거꾸로 이어지는 연속 달성(스트릭) 일수를 계산합니다.
 * @param {string[]} completedDates - 'YYYY-MM-DD' 형식의 완료 날짜 배열
 * @returns {number} 연속 달성 일수
 */
export function getStreak(completedDates) {
  if (!completedDates || !completedDates.length) return 0
  const sorted = [...completedDates].sort((a, b) => new Date(b) - new Date(a))
  let streak = 0
  let cur = new Date(); cur.setHours(0, 0, 0, 0)
  for (const d of sorted) {
    const date = new Date(d); date.setHours(0, 0, 0, 0)
    const diff = (cur - date) / 86400000
    if (diff === streak) streak++
    else if (diff === streak + 1) { streak++; cur = date }
    else break
  }
  return streak
}

/**
 * 오늘 완료한 습관 비율(0~100)을 계산합니다.
 * @param {{completedDates: string[]}[]} habits
 * @param {string} today - 'YYYY-MM-DD'
 * @returns {number} 0~100 사이 정수 달성률
 */
export function completionRate(habits, today) {
  if (!habits || habits.length === 0) return 0
  const done = habits.filter(h => h.completedDates.includes(today)).length
  return Math.round((done / habits.length) * 100)
}
