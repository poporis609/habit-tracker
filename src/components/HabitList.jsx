import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Flame, Check } from 'lucide-react'
import { getStreak } from '../lib/habits'

const GRADIENTS = {
  blue:   'from-blue-500 to-cyan-400',
  green:  'from-green-500 to-emerald-400',
  purple: 'from-violet-500 to-purple-400',
  orange: 'from-orange-500 to-amber-400',
  pink:   'from-pink-500 to-rose-400',
}

export default function HabitList({ habits, today, onToggle, onDelete }) {
  if (!habits.length) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
        <p className="text-6xl mb-4">🌱</p>
        <p className="font-semibold text-white/60">아직 습관이 없어요</p>
        <p className="text-sm mt-1 text-white/30">+ 탭에서 첫 습관을 만들어보세요</p>
        <div className="mt-6 glass rounded-2xl p-4 text-left max-w-xs mx-auto">
          <p className="text-xs font-bold text-purple-300 mb-2">Groo가 도와드릴게요</p>
          <ul className="space-y-1.5 text-xs text-white/50">
            <li>🤖 내 데이터를 아는 AI 코치와 대화</li>
            <li>📔 음성으로 일기 쓰고 AI가 다듬기</li>
            <li>📈 한 주를 AI가 자동 회고해주는 리포트</li>
          </ul>
        </div>
      </motion.div>
    )
  }
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
      <AnimatePresence>
        {habits.map((habit, i) => {
          const done = habit.completedDates.includes(today)
          const streak = getStreak(habit.completedDates)
          const grad = GRADIENTS[habit.color] || GRADIENTS.purple
          return (
            <motion.div
              key={habit.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 40, scale: 0.9 }}
              transition={{ delay: i * 0.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onToggle(habit.id)}
              className={'relative overflow-hidden rounded-2xl p-4 cursor-pointer transition-all duration-300 border ' + (done ? 'habit-done glow-purple' : 'glass')}
            >
              {done && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-pink-500/5 pointer-events-none"
                />
              )}
              <div className="flex items-center gap-4 relative">
                <div className={'w-11 h-11 rounded-xl bg-gradient-to-br ' + grad + ' flex items-center justify-center text-xl shadow-lg flex-shrink-0'}>
                  {habit.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={'font-bold text-sm truncate ' + (done ? 'text-white/40 line-through' : 'text-white')}>{habit.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {streak > 0 && (
                      <div className="flex items-center gap-1">
                        <Flame size={11} className="text-orange-400" />
                        <span className="text-xs text-orange-300 font-semibold">{streak}일 연속</span>
                      </div>
                    )}
                    {!streak && <span className="text-xs text-white/25">시작해보세요</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <motion.div
                    animate={{ scale: done ? 1 : 0.85 }}
                    className={'w-8 h-8 rounded-full flex items-center justify-center transition-all ' + (done ? 'bg-gradient-to-br from-violet-500 to-pink-500 shadow-lg pulse-glow' : 'border-2 border-white/20')}
                  >
                    {done && <Check size={14} className="text-white" strokeWidth={3} />}
                  </motion.div>
                  <button
                    onClick={e => { e.stopPropagation(); onDelete(habit.id) }}
                    className="text-white/20 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-red-400/10"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: habits.length * 0.05 + 0.1 }}
        className="glass rounded-2xl px-4 py-3 flex items-center gap-3 mt-4"
      >
        <span className="text-xl">🤖</span>
        <p className="text-xs text-white/55 leading-snug">
          오늘을 기록했다면 <span className="text-purple-300 font-semibold">AI 코치</span>·
          <span className="text-purple-300 font-semibold">일기</span> 탭에서 회고와 동기를 받아보세요
        </p>
      </motion.div>
    </motion.div>
  )
}
