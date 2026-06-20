import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'

const EMOJIS = ['💧','🏃','📚','🧘','🍎','😴','✍️','🎯','🌿','💊','🎵','🏋️','🧠','🫁','🌅']
const COLORS = [
  { key: 'purple', bg: 'from-violet-500 to-purple-400' },
  { key: 'blue',   bg: 'from-blue-500 to-cyan-400' },
  { key: 'green',  bg: 'from-green-500 to-emerald-400' },
  { key: 'orange', bg: 'from-orange-500 to-amber-400' },
  { key: 'pink',   bg: 'from-pink-500 to-rose-400' },
]

export default function AddHabit({ onAdd }) {
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('🎯')
  const [color, setColor] = useState('purple')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    onAdd({ name: name.trim(), emoji, color })
    setName(''); setEmoji('🎯'); setColor('purple')
  }

  const selectedColor = COLORS.find(c => c.key === color)

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="glass rounded-3xl p-6 space-y-6"
    >
      <div>
        <h2 className="text-xl font-black text-white">새 습관 만들기</h2>
        <p className="text-sm text-white/40 mt-1">작은 습관이 큰 변화를 만들어요</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 block">이름</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="예: 물 2L 마시기"
            className="w-full bg-white/10 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm focus:outline-none focus:border-purple-400 focus:bg-white/15 transition-all"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3 block">이모지</label>
          <div className="flex flex-wrap gap-2">
            {EMOJIS.map(e => (
              <motion.button key={e} type="button" whileTap={{ scale: 0.85 }} onClick={() => setEmoji(e)}
                className={'w-11 h-11 rounded-xl text-xl flex items-center justify-center transition-all ' + (emoji === e ? 'bg-gradient-to-br from-violet-500 to-purple-400 shadow-lg scale-110' : 'bg-white/10 hover:bg-white/20')}
              >{e}</motion.button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3 block">색상 테마</label>
          <div className="flex gap-3">
            {COLORS.map(c => (
              <motion.button key={c.key} type="button" whileTap={{ scale: 0.85 }} onClick={() => setColor(c.key)}
                className={'w-10 h-10 rounded-xl bg-gradient-to-br ' + c.bg + ' transition-all ' + (color === c.key ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-transparent shadow-lg' : 'opacity-50')}
              />
            ))}
          </div>
        </div>

        <div className={'glass-light rounded-2xl p-4 flex items-center gap-3 border-2 ' + (name ? 'border-violet-400/40' : 'border-white/10')}>
          <div className={'w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-2xl shadow ' + (selectedColor?.bg || 'from-violet-500 to-purple-400')}>
            {emoji}
          </div>
          <div>
            <p className="font-bold text-white text-sm">{name || '습관 이름을 입력해주세요'}</p>
            <p className="text-xs text-white/30 mt-0.5">미리보기</p>
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.96 }}
          type="submit"
          disabled={!name.trim()}
          className={'w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all ' + (name.trim() ? 'bg-gradient-to-r from-violet-600 to-purple-500 text-white shadow-lg shadow-purple-500/30' : 'bg-white/10 text-white/30 cursor-not-allowed')}
        >
          <Plus size={16} />
          습관 추가하기
        </motion.button>
      </form>
    </motion.div>
  )
}
