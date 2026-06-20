import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Save, Sparkles, BookOpen, X, AlignLeft, ChevronRight, Loader2, Trash2, BookMarked, Mic, MicOff } from 'lucide-react'
import useVoiceInput from '../hooks/useVoiceInput'

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' })
}

function formatDateShort(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}

export default function Journal() {
  const [entries, setEntries] = useState(() => {
    try { return JSON.parse(localStorage.getItem('journal') || '[]') } catch { return [] }
  })
  const [text, setText] = useState('')
  const [aiResult, setAiResult] = useState('')
  const [loading, setLoading] = useState(null)
  const [showSidebar, setShowSidebar] = useState(false)
  const [viewEntry, setViewEntry] = useState(null)
  const [saved, setSaved] = useState(false)
  const [voiceBase, setVoiceBase] = useState('')
  const [interimDisplay, setInterimDisplay] = useState('')
  const textareaRef = useRef(null)

  const today = new Date().toISOString().split('T')[0]

  const onVoiceResult = useCallback((final, interim) => {
    setText(voiceBase + final)
    setInterimDisplay(interim)
  }, [voiceBase])

  const { listening, error: voiceError, interimText, toggle: toggleVoice, stop: stopVoice } = useVoiceInput(onVoiceResult)

  const handleMicClick = () => {
    if (!listening) setVoiceBase(text)
    else stopVoice()
    toggleVoice()
  }

  useEffect(() => {
    const existing = entries.find(e => e.date === today)
    if (existing) setText(existing.text)
  }, [])

  const callAI = async (action) => {
    if (!text.trim() || loading) return
    setLoading(action)
    setAiResult('')
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, action }),
      })
      const data = await res.json()
      setAiResult(data.result || data.error || '오류가 발생했습니다.')
    } catch {
      setAiResult('서버에 연결할 수 없습니다.')
    }
    setLoading(null)
  }

  const applyAI = () => {
    if (aiResult) { setText(aiResult); setAiResult('') }
  }

  const saveEntry = () => {
    if (!text.trim()) return
    const entry = { id: Date.now(), date: today, text, createdAt: new Date().toISOString() }
    const updated = [entry, ...entries.filter(e => e.date !== today)]
    setEntries(updated)
    localStorage.setItem('journal', JSON.stringify(updated))
    setText('')
    setVoiceBase('')
    setInterimDisplay('')
    setAiResult('')
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const deleteEntry = (id, e) => {
    e.stopPropagation()
    const updated = entries.filter(en => en.id !== id)
    setEntries(updated)
    localStorage.setItem('journal', JSON.stringify(updated))
    if (viewEntry?.id === id) setViewEntry(null)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative">

      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-black text-white">오늘의 일기</h2>
          <p className="text-xs text-white/30 mt-0.5">{formatDate(today)}</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.93 }}
          onClick={() => setShowSidebar(true)}
          className="flex items-center gap-2 glass px-3 py-2 rounded-xl text-xs font-semibold text-white/60 hover:text-white transition-colors"
        >
          <BookOpen size={14} />
          <span>{entries.length}개의 일기</span>
        </motion.button>
      </div>

      {/* 에디터 카드 */}
      <div className="glass rounded-3xl p-5 mb-4">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="오늘 하루 어떠셨나요? 자유롭게 적어보세요..."
          className="w-full bg-transparent text-white/90 placeholder-white/20 text-sm leading-relaxed resize-none focus:outline-none"
          rows={8}
          style={{ fontFamily: 'inherit' }}
        />
        {/* 음성 인식 중 interim 표시 */}
        {listening && interimText && (
          <p className="text-sm text-violet-300/60 italic mt-1 px-1">{interimText}...</p>
        )}
        {voiceError && (
          <p className="text-xs text-red-400/80 mt-2 px-1">{voiceError}</p>
        )}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/20">{text.length}자</span>
            {/* 마이크 버튼 */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleMicClick}
              className={'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ' + (listening ? 'bg-red-500/30 text-red-300 border border-red-400/40' : 'bg-white/10 text-white/50 hover:text-white hover:bg-white/15')}
            >
              {listening
                ? <><MicOff size={12} /><span>중지</span><motion.span animate={{ opacity: [1,0,1] }} transition={{ duration: 1, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-red-400 ml-0.5" /></>
                : <><Mic size={12} /><span>음성</span></>}
            </motion.button>
          </div>
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={saveEntry}
            disabled={!text.trim()}
            className={'flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ' + (saved ? 'bg-green-500/30 text-green-300' : text.trim() ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30' : 'bg-white/5 text-white/20 cursor-not-allowed')}
          >
            <Save size={13} />
            {saved ? '저장됨 ✓' : '저장'}
          </motion.button>
        </div>
      </div>

      {/* AI 버튼 */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => callAI('expand')}
          disabled={!text.trim() || !!loading}
          className={'glass rounded-2xl p-4 text-left transition-all border ' + (loading === 'expand' ? 'border-violet-400/40' : 'border-white/10 hover:border-violet-400/30')}
        >
          <div className="flex items-center gap-2 mb-1.5">
            {loading === 'expand' ? <Loader2 size={15} className="text-violet-400 animate-spin" /> : <Sparkles size={15} className="text-violet-400" />}
            <span className="text-xs font-bold text-white/80">AI 확장</span>
          </div>
          <p className="text-xs text-white/35 leading-snug">짧은 글을<br/>풍부하게 확장</p>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => callAI('summarize')}
          disabled={!text.trim() || !!loading}
          className={'glass rounded-2xl p-4 text-left transition-all border ' + (loading === 'summarize' ? 'border-pink-400/40' : 'border-white/10 hover:border-pink-400/30')}
        >
          <div className="flex items-center gap-2 mb-1.5">
            {loading === 'summarize' ? <Loader2 size={15} className="text-pink-400 animate-spin" /> : <AlignLeft size={15} className="text-pink-400" />}
            <span className="text-xs font-bold text-white/80">AI 요약</span>
          </div>
          <p className="text-xs text-white/35 leading-snug">긴 글을<br/>핵심만 요약</p>
        </motion.button>
      </div>

      {/* AI 결과 */}
      <AnimatePresence>
        {(aiResult || loading) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass rounded-2xl p-4 mb-4 border border-violet-400/20"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-violet-400 to-pink-400 animate-pulse" />
                <span className="text-xs font-semibold text-white/60">AI 결과</span>
              </div>
              {aiResult && (
                <button onClick={() => setAiResult('')} className="text-white/20 hover:text-white/50 transition-colors">
                  <X size={13} />
                </button>
              )}
            </div>
            {loading ? (
              <div className="flex items-center gap-2 text-white/40">
                <Loader2 size={14} className="animate-spin" />
                <span className="text-sm">AI가 작성 중입니다...</span>
              </div>
            ) : (
              <>
                <p className="text-sm text-white/75 leading-relaxed whitespace-pre-wrap">{aiResult}</p>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={applyAI}
                  className="mt-3 w-full bg-gradient-to-r from-violet-600 to-pink-500 text-white text-xs font-bold py-2.5 rounded-xl shadow-lg"
                >
                  일기에 적용하기 ✨
                </motion.button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 사이드바 드로어 */}
      <AnimatePresence>
        {showSidebar && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowSidebar(false); setViewEntry(null) }}
              className="fixed inset-0 bg-black/60 z-40"
              style={{ backdropFilter: 'blur(4px)' }}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed right-0 top-0 bottom-0 w-80 z-50 flex flex-col"
              style={{ background: 'linear-gradient(160deg, #1e1b4b 0%, #2d1b69 100%)', borderLeft: '1px solid rgba(139,92,246,0.2)' }}
            >
              {/* 사이드바 헤더 */}
              <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <BookMarked size={16} className="text-violet-400" />
                  <span className="font-bold text-white text-sm">저장된 일기</span>
                  <span className="text-xs bg-violet-500/30 text-violet-300 rounded-full px-2 py-0.5 font-semibold">{entries.length}</span>
                </div>
                <button onClick={() => { setShowSidebar(false); setViewEntry(null) }} className="text-white/30 hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>

              {/* 항목 목록 */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
                {entries.length === 0 ? (
                  <div className="text-center py-16 text-white/30">
                    <p className="text-4xl mb-3">📖</p>
                    <p className="text-sm">저장된 일기가 없어요</p>
                  </div>
                ) : (
                  entries.map(entry => (
                    <motion.div
                      key={entry.id}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setViewEntry(viewEntry?.id === entry.id ? null : entry)}
                      className={'rounded-2xl p-4 cursor-pointer transition-all border ' + (viewEntry?.id === entry.id ? 'bg-violet-500/20 border-violet-400/40' : 'bg-white/5 border-white/8 hover:bg-white/10')}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={'text-xs font-bold ' + (entry.date === today ? 'text-violet-300' : 'text-white/50')}>
                          {entry.date === today ? '오늘 ✨' : formatDateShort(entry.date)}
                        </span>
                        <button onClick={e => deleteEntry(entry.id, e)} className="text-white/15 hover:text-red-400 transition-colors">
                          <Trash2 size={12} />
                        </button>
                      </div>
                      <p className="text-xs text-white/60 leading-relaxed line-clamp-2">{entry.text}</p>
                    </motion.div>
                  ))
                )}
              </div>

              {/* 선택된 항목 상세 */}
              <AnimatePresence>
                {viewEntry && (
                  <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                    className="absolute inset-0 flex flex-col"
                    style={{ background: 'linear-gradient(160deg, #1a1040 0%, #2d1b69 100%)' }}
                  >
                    <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
                      <div>
                        <p className={'text-sm font-bold ' + (viewEntry.date === today ? 'text-violet-300' : 'text-white')}>
                          {viewEntry.date === today ? '오늘의 일기 ✨' : formatDate(viewEntry.date)}
                        </p>
                        <p className="text-xs text-white/30 mt-0.5">{new Date(viewEntry.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })} 작성</p>
                      </div>
                      <button onClick={() => setViewEntry(null)} className="text-white/30 hover:text-white transition-colors">
                        <ChevronRight size={18} />
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto px-5 py-5">
                      <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">{viewEntry.text}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
