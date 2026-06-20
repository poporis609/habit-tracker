import { motion } from 'framer-motion'

export default function Header({ motivation }) {
  const today = new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' })
  return (
    <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-7">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs font-semibold text-purple-300 tracking-widest uppercase">My Habits</span>
      </div>
      <h1 className="text-4xl font-black text-white leading-tight">
        오늘의 <span className="text-gradient">습관</span>
      </h1>
      <p className="text-sm text-white/40 mt-1 font-medium">{today}</p>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-4 glass rounded-2xl px-4 py-3 flex items-center gap-3"
      >
        <span className="text-2xl">✨</span>
        <p className="text-sm text-white/80 font-medium leading-snug">{motivation}</p>
      </motion.div>
    </motion.div>
  )
}
