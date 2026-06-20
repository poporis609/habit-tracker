import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { Download, Upload } from 'lucide-react'
import HabitList from './components/HabitList'
import AddHabit from './components/AddHabit'
import Stats from './components/Stats'
import Header from './components/Header'
import Journal from './components/Journal'
import Coach from './components/Coach'

const MESSAGES = [
  "오늘도 한 걸음씩! 작은 습관이 큰 변화를 만들어요 💪",
  "연속 달성 중! 멈추지 마세요 🔥",
  "꾸준함이 재능을 이깁니다 ⭐",
  "오늘 완료한 습관이 미래의 나를 만들어요 🌱",
  "완벽하지 않아도 괜찮아요. 그냥 하세요! 🚀",
]

function CircleProgress({ rate }) {
  const r = 42; const c = 2 * Math.PI * r
  const offset = c - (rate / 100) * c
  return (
    <svg width="110" height="110" className="rotate-[-90deg]">
      <circle cx="55" cy="55" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
      <motion.circle
        cx="55" cy="55" r={r} fill="none"
        stroke="url(#pg)" strokeWidth="8" strokeLinecap="round"
        strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />
      <defs>
        <linearGradient id="pg" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export default function App() {
  const [habits, setHabits] = useState(() => {
    const s = localStorage.getItem('habits')
    return s ? JSON.parse(s) : [
      { id: 1, name: '물 2L 마시기', emoji: '💧', color: 'blue', completedDates: [] },
      { id: 2, name: '30분 운동', emoji: '🏃', color: 'green', completedDates: [] },
      { id: 3, name: '책 20분 읽기', emoji: '📚', color: 'purple', completedDates: [] },
    ]
  })
  const [tab, setTab] = useState('today')
  const [motivation] = useState(MESSAGES[Math.floor(Math.random() * MESSAGES.length)])
  const prevRate = useRef(0)

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => { localStorage.setItem('habits', JSON.stringify(habits)) }, [habits])

  const todayDone = habits.filter(h => h.completedDates.includes(today)).length
  const rate = habits.length > 0 ? Math.round((todayDone / habits.length) * 100) : 0

  useEffect(() => {
    if (rate === 100 && prevRate.current < 100 && habits.length > 0) {
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.5 }, colors: ['#8b5cf6','#ec4899','#f59e0b','#10b981'] })
    }
    prevRate.current = rate
  }, [rate, habits.length])

  const addHabit = h => setHabits(p => [...p, { ...h, id: Date.now(), completedDates: [] }])
  const deleteHabit = id => setHabits(p => p.filter(h => h.id !== id))
  const toggleHabit = id => setHabits(p => p.map(h => {
    if (h.id !== id) return h
    const done = h.completedDates.includes(today)
    return { ...h, completedDates: done ? h.completedDates.filter(d => d !== today) : [...h.completedDates, today] }
  }))

  const exportData = () => {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      habits: JSON.parse(localStorage.getItem('habits') || '[]'),
      journal: JSON.parse(localStorage.getItem('journal') || '[]'),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `groo-backup-${today}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importData = e => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target.result)
        if (!Array.isArray(data.habits)) throw new Error('형식 오류')
        if (!window.confirm('현재 데이터를 가져온 백업으로 덮어쓸까요?')) return
        localStorage.setItem('habits', JSON.stringify(data.habits))
        if (Array.isArray(data.journal)) localStorage.setItem('journal', JSON.stringify(data.journal))
        setHabits(data.habits)
        alert('데이터를 복원했어요! 🎉')
      } catch {
        alert('올바른 Groo 백업 파일이 아니에요.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const tabs = [{ key: 'today', label: '오늘' }, { key: 'stats', label: '통계' }, { key: 'journal', label: '일기' }, { key: 'coach', label: '🤖' }, { key: 'add', label: '+' }]

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #1a1a2e 100%)' }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)', filter: 'blur(60px)' }} />
        <div className="absolute bottom-40 right-5 w-48 h-48 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #ec4899, transparent)', filter: 'blur(50px)' }} />
      </div>
      <div className="relative max-w-md mx-auto px-5 py-10">
        <Header motivation={motivation} />

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-3xl p-5 mb-6 glow-purple"
        >
          <div className="flex items-center gap-5">
            <div className="relative flex-shrink-0">
              <CircleProgress rate={rate} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-white">{rate}%</span>
                <span className="text-xs text-white/40">달성</span>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-white font-bold text-lg">
                {rate === 100 ? '완벽해요! 🎉' : rate >= 50 ? '잘 하고 있어요!' : '오늘도 화이팅!'}
              </p>
              <p className="text-white/40 text-sm mt-1">{todayDone}개 완료 · {habits.length - todayDone}개 남음</p>
              <div className="flex gap-1 mt-3">
                {habits.map(h => (
                  <div key={h.id} className={'flex-1 h-1 rounded-full transition-all duration-500 ' + (h.completedDates.includes(today) ? 'bg-gradient-to-r from-violet-500 to-pink-400' : 'bg-white/15')} />
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        <div className="glass rounded-2xl p-1.5 mb-6 flex">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={'relative flex-1 py-2 rounded-xl text-xs font-bold transition-all duration-200 ' + (tab === t.key ? 'text-white' : 'text-white/35 hover:text-white/60')}
            >
              {tab === t.key && (
                <motion.div layoutId="tabBg" className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 shadow-lg" />
              )}
              <span className="relative z-10">{t.label}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab === 'today' && <HabitList key="today" habits={habits} today={today} onToggle={toggleHabit} onDelete={deleteHabit} />}
          {tab === 'stats' && <Stats key="stats" habits={habits} today={today} />}
          {tab === 'journal' && <Journal key="journal" />}
          {tab === 'coach' && <Coach key="coach" />}
          {tab === 'add' && <AddHabit key="add" existingHabits={habits} onAdd={h => { addHabit(h); setTab('today') }} />}
        </AnimatePresence>

        <div className="mt-8 pt-5 border-t border-white/10 flex items-center justify-center gap-3">
          <button
            onClick={exportData}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white/55 hover:text-white hover:bg-white/10 transition-all"
          >
            <Download size={13} /> 백업 내보내기
          </button>
          <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white/55 hover:text-white hover:bg-white/10 transition-all cursor-pointer">
            <Upload size={13} /> 복원하기
            <input type="file" accept="application/json" onChange={importData} className="hidden" />
          </label>
        </div>
      </div>
    </div>
  )
}
