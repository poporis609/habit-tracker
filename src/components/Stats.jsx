import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, TrendingUp, CheckCircle2, Trophy, Sparkles, Loader2, X, CalendarDays } from 'lucide-react'

function getStreak(completedDates) {
  if (!completedDates.length) return 0
  const sorted = [...completedDates].sort((a, b) => new Date(b) - new Date(a))
  let streak = 0; let cur = new Date(); cur.setHours(0,0,0,0)
  for (const d of sorted) {
    const date = new Date(d); date.setHours(0,0,0,0)
    const diff = (cur - date) / 86400000
    if (diff === streak) streak++
    else if (diff === streak + 1) { streak++; cur = date }
    else break
  }
  return streak
}

const GRAD_COLORS = { blue:'#3b82f6', green:'#22c55e', purple:'#a855f7', orange:'#f97316', pink:'#ec4899' }
const MOOD_SCORE = { '😄': 5, '🙂': 4, '😐': 3, '😔': 2, '😣': 1 }

export default function Stats({ habits, today }) {
  const [report, setReport] = useState('')
  const [reportLoading, setReportLoading] = useState(false)

  const totalCompleted = habits.reduce((s, h) => s + h.completedDates.length, 0)
  const maxStreak = habits.reduce((m, h) => Math.max(m, getStreak(h.completedDates)), 0)
  const todayCount = habits.filter(h => h.completedDates.includes(today)).length
  const todayRate = habits.length > 0 ? Math.round((todayCount / habits.length) * 100) : 0

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i))
    return d.toISOString().split('T')[0]
  })
  const maxDay = Math.max(...last7.map(d => habits.filter(h => h.completedDates.includes(d)).length), 1)

  // 히트맵: 최근 84일 (12주)
  const heatmapDays = Array.from({ length: 84 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (83 - i))
    return d.toISOString().split('T')[0]
  })
  const heatmapData = heatmapDays.map(date => {
    const count = habits.filter(h => h.completedDates.includes(date)).length
    const rate = habits.length > 0 ? count / habits.length : 0
    return { date, count, rate }
  })

  // 기분 추이: 일기에서 읽기 (최근 7일)
  const journal = (() => { try { return JSON.parse(localStorage.getItem('journal') || '[]') } catch { return [] } })()
  const moodByDate = {}
  journal.forEach(e => { if (e.mood) moodByDate[e.date] = e.mood })
  const moodDays = last7.map(date => ({ date, mood: moodByDate[date] || null }))
  const hasMoodData = moodDays.some(m => m.mood)

  const generateReport = async () => {
    if (reportLoading) return
    setReportLoading(true)
    setReport('')
    const summary = habits.map(h => {
      const week = last7.filter(d => h.completedDates.includes(d)).length
      return `- ${h.name}: 이번 주 ${week}/7일 완료, 최장 연속 ${getStreak(h.completedDates)}일`
    }).join('\n')
    const moodSummary = moodDays.filter(m => m.mood).map(m => `${m.date}: ${m.mood}`).join(', ') || '기록 없음'
    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summary, moodSummary }),
      })
      const data = await res.json()
      setReport(data.result || data.error || '리포트를 생성하지 못했습니다.')
    } catch {
      setReport('서버에 연결할 수 없습니다.')
    }
    setReportLoading(false)
  }

  const stats = [
    { icon: <CheckCircle2 size={18} className="text-purple-400" />, value: todayRate + '%', label: '오늘 달성률', sub: todayCount + '/' + habits.length + ' 완료' },
    { icon: <Flame size={18} className="text-orange-400" />, value: maxStreak + '일', label: '최장 스트릭', sub: '연속 달성' },
    { icon: <Trophy size={18} className="text-yellow-400" />, value: totalCompleted, label: '총 완료', sub: '누적 기록' },
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {stats.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="glass rounded-2xl p-4 text-center"
          >
            <div className="flex justify-center mb-2">{s.icon}</div>
            <p className="text-xl font-black text-white">{s.value}</p>
            <p className="text-xs font-semibold text-white/50 mt-0.5">{s.label}</p>
            <p className="text-xs text-white/25 mt-0.5">{s.sub}</p>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="glass rounded-2xl p-5"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-bold text-white/70">최근 7일 달성</h3>
          <div className="flex items-center gap-1">
            <TrendingUp size={12} className="text-purple-400" />
            <span className="text-xs text-purple-300">주간 현황</span>
          </div>
        </div>
        <div className="flex gap-2 items-end justify-between" style={{ height: 80 }}>
          {last7.map((date) => {
            const count = habits.filter(h => h.completedDates.includes(date)).length
            const rate = count / maxDay
            const isToday = date === today
            const dayName = new Date(date + 'T00:00:00').toLocaleDateString('ko-KR', { weekday: 'short' })
            return (
              <div key={date} className="flex flex-col items-center gap-1 flex-1">
                <div className="w-full flex items-end rounded-lg overflow-hidden" style={{ height: 60, background: 'rgba(255,255,255,0.06)' }}>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: Math.max(rate * 60, count > 0 ? 8 : 0) }}
                    transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
                    className={'w-full rounded-lg ' + (isToday ? 'bg-gradient-to-t from-violet-500 to-pink-400' : 'bg-gradient-to-t from-violet-700 to-violet-500')}
                    style={{ opacity: isToday ? 1 : 0.6 }}
                  />
                </div>
                <span className={'text-xs font-medium ' + (isToday ? 'text-purple-300' : 'text-white/30')}>{dayName}</span>
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* AI 주간 리포트 */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        className="glass rounded-2xl p-5 border border-violet-400/20"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles size={15} className="text-violet-400" />
            <h3 className="text-sm font-bold text-white/70">AI 주간 리포트</h3>
          </div>
          {report && (
            <button onClick={() => setReport('')} className="text-white/20 hover:text-white/50 transition-colors">
              <X size={14} />
            </button>
          )}
        </div>
        <AnimatePresence mode="wait">
          {report ? (
            <motion.p
              key="report"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-white/75 leading-relaxed whitespace-pre-wrap"
            >
              {report}
            </motion.p>
          ) : (
            <motion.div key="btn" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="text-xs text-white/35 mb-3 leading-relaxed">이번 주 습관과 기분 데이터를 AI가 분석해 회고와 다음 주 조언을 만들어드려요.</p>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={generateReport}
                disabled={reportLoading || habits.length === 0}
                className={'w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ' + (reportLoading ? 'bg-white/10 text-white/40' : 'bg-gradient-to-r from-violet-600 to-pink-500 text-white shadow-lg shadow-violet-500/30')}
              >
                {reportLoading
                  ? <><Loader2 size={15} className="animate-spin" /><span>AI가 분석 중...</span></>
                  : <><Sparkles size={15} /><span>주간 리포트 생성</span></>}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* 잔디 히트맵 */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="glass rounded-2xl p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CalendarDays size={14} className="text-violet-400" />
            <h3 className="text-sm font-bold text-white/70">최근 12주 기록</h3>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-white/25">적음</span>
            {[0.15, 0.4, 0.7, 1].map((o, i) => (
              <div key={i} className="w-2.5 h-2.5 rounded-sm" style={{ background: `rgba(139,92,246,${o})` }} />
            ))}
            <span className="text-xs text-white/25">많음</span>
          </div>
        </div>
        <div className="flex gap-1 justify-between">
          {Array.from({ length: 12 }, (_, week) => (
            <div key={week} className="flex flex-col gap-1">
              {Array.from({ length: 7 }, (_, day) => {
                const idx = week * 7 + day
                const cell = heatmapData[idx]
                if (!cell) return <div key={day} className="w-2.5 h-2.5" />
                const isToday = cell.date === today
                const opacity = cell.rate === 0 ? 0.06 : 0.2 + cell.rate * 0.8
                return (
                  <motion.div
                    key={day}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4 + idx * 0.004 }}
                    title={`${cell.date}: ${cell.count}개 완료`}
                    className={'w-2.5 h-2.5 rounded-sm ' + (isToday ? 'ring-1 ring-pink-400' : '')}
                    style={{ background: `rgba(139,92,246,${opacity})` }}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </motion.div>

      {/* 기분 추이 */}
      {hasMoodData && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="glass rounded-2xl p-5"
        >
          <h3 className="text-sm font-bold text-white/70 mb-4">최근 7일 기분 추이</h3>
          <div className="flex items-end justify-between gap-2" style={{ height: 80 }}>
            {moodDays.map(({ date, mood }) => {
              const score = mood ? MOOD_SCORE[mood] : 0
              const isToday = date === today
              const dayName = new Date(date + 'T00:00:00').toLocaleDateString('ko-KR', { weekday: 'short' })
              return (
                <div key={date} className="flex flex-col items-center gap-1 flex-1">
                  <div className="flex-1 flex items-end" style={{ height: 50 }}>
                    {mood ? <span className="text-xl">{mood}</span> : <span className="text-white/15 text-xs">–</span>}
                  </div>
                  <div className="w-full rounded-lg overflow-hidden" style={{ height: 4, background: 'rgba(255,255,255,0.06)' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: (score / 5) * 100 + '%' }}
                      transition={{ duration: 0.6 }}
                      className="h-full rounded-lg bg-gradient-to-r from-violet-500 to-pink-400"
                    />
                  </div>
                  <span className={'text-xs font-medium ' + (isToday ? 'text-purple-300' : 'text-white/30')}>{dayName}</span>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="glass rounded-2xl p-5"
      >
        <h3 className="text-sm font-bold text-white/70 mb-4">습관별 진행 현황</h3>
        <div className="space-y-4">
          {habits.map((h, i) => {
            const streak = getStreak(h.completedDates)
            const total = h.completedDates.length
            const color = GRAD_COLORS[h.color] || GRAD_COLORS.purple
            const done = h.completedDates.includes(today)
            return (
              <motion.div key={h.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.08 }}
                className="flex items-center gap-3"
              >
                <span className="text-xl w-8 text-center">{h.emoji}</span>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm font-semibold text-white/80">{h.name}</span>
                    <span className="text-xs text-white/30">{total}회 완료</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: Math.min(total * 5, 100) + '%' }}
                      transition={{ duration: 0.8, delay: 0.5 + i * 0.1 }}
                      className="h-1.5 rounded-full"
                      style={{ background: color }}
                    />
                  </div>
                </div>
                {streak > 0 && (
                  <div className="flex items-center gap-0.5 bg-orange-500/20 rounded-lg px-2 py-1">
                    <Flame size={10} className="text-orange-400" />
                    <span className="text-xs text-orange-300 font-bold">{streak}</span>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    </motion.div>
  )
}
