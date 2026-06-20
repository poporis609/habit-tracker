import { motion } from 'framer-motion'
import { Flame, TrendingUp, CheckCircle2, Trophy } from 'lucide-react'

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

export default function Stats({ habits, today }) {
  const totalCompleted = habits.reduce((s, h) => s + h.completedDates.length, 0)
  const maxStreak = habits.reduce((m, h) => Math.max(m, getStreak(h.completedDates)), 0)
  const todayCount = habits.filter(h => h.completedDates.includes(today)).length
  const todayRate = habits.length > 0 ? Math.round((todayCount / habits.length) * 100) : 0

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i))
    return d.toISOString().split('T')[0]
  })
  const maxDay = Math.max(...last7.map(d => habits.filter(h => h.completedDates.includes(d)).length), 1)

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
