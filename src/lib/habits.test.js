import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { getStreak, completionRate } from './habits'

function isoOffset(days) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().split('T')[0]
}

describe('getStreak', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-20T09:00:00'))
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('빈 배열이면 0을 반환한다', () => {
    expect(getStreak([])).toBe(0)
    expect(getStreak(undefined)).toBe(0)
  })

  it('오늘만 완료하면 스트릭은 1이다', () => {
    expect(getStreak(['2026-06-20'])).toBe(1)
  })

  it('오늘·어제·그제 연속이면 3이다', () => {
    expect(getStreak(['2026-06-20', '2026-06-19', '2026-06-18'])).toBe(3)
  })

  it('어제까지만 연속이면(오늘 미완료) 어제 기준 스트릭을 센다', () => {
    expect(getStreak(['2026-06-19', '2026-06-18'])).toBe(2)
  })

  it('오늘 이후 큰 공백이 있으면 오늘까지만(1) 센다', () => {
    expect(getStreak(['2026-06-20', '2026-06-16'])).toBe(1)
  })

  it('순서가 뒤섞여도 정렬해서 올바르게 계산한다', () => {
    expect(getStreak(['2026-06-18', '2026-06-20', '2026-06-19'])).toBe(3)
  })
})

describe('completionRate', () => {
  it('습관이 없으면 0%', () => {
    expect(completionRate([], '2026-06-20')).toBe(0)
  })

  it('절반 완료 시 50%로 반올림한다', () => {
    const habits = [
      { completedDates: ['2026-06-20'] },
      { completedDates: [] },
    ]
    expect(completionRate(habits, '2026-06-20')).toBe(50)
  })

  it('전부 완료 시 100%', () => {
    const habits = [
      { completedDates: ['2026-06-20'] },
      { completedDates: ['2026-06-20'] },
    ]
    expect(completionRate(habits, '2026-06-20')).toBe(100)
  })

  it('3개 중 1개 완료 시 33%로 반올림한다', () => {
    const habits = [
      { completedDates: ['2026-06-20'] },
      { completedDates: [] },
      { completedDates: [] },
    ]
    expect(completionRate(habits, '2026-06-20')).toBe(33)
  })
})
