import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, User, Sparkles, RotateCcw, Mic, MicOff } from 'lucide-react'
import useVoiceInput from '../hooks/useVoiceInput'

const QUICK = [
  '내 습관 현황이 어때?',
  '어떤 습관을 추가하면 좋을까?',
  '이번 주 어떻게 하면 잘 할 수 있을까?',
  '동기부여 한 마디만 해줘 🔥',
]

function buildContext(habits, entries) {
  const today = new Date().toISOString().split('T')[0]
  const total = habits.length
  const done = habits.filter(h => h.completedDates?.includes(today)).length
  const streaks = habits.map(h => {
    const dates = [...(h.completedDates || [])].sort((a, b) => new Date(b) - new Date(a))
    let s = 0, cur = new Date(); cur.setHours(0,0,0,0)
    for (const d of dates) {
      const dt = new Date(d); dt.setHours(0,0,0,0)
      const diff = (cur - dt) / 86400000
      if (diff === s) s++
      else if (diff === s + 1) { s++; cur = dt }
      else break
    }
    return `${h.emoji} ${h.name}: ${s}일 연속, 총 ${h.completedDates?.length || 0}회 완료`
  })
  const recentJournal = entries.slice(0, 2).map(e => `[${e.date}] ${e.text.slice(0, 80)}...`).join('\n')
  return `오늘 달성: ${done}/${total}개 (${total > 0 ? Math.round(done/total*100) : 0}%)\n\n습관 목록:\n${streaks.join('\n')}${recentJournal ? `\n\n최근 일기:\n${recentJournal}` : ''}`
}

export default function Coach() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '안녕하세요! 저는 당신의 AI 생산성 코치예요 🤖\n\n습관 현황, 목표 설정, 동기부여 등 무엇이든 물어보세요!' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  const onVoiceResult = useCallback((final, interim) => {
    setInput(final + (interim ? interim : ''))
  }, [])
  const { listening, error: voiceError, toggle: toggleVoice, stop: stopVoice } = useVoiceInput(onVoiceResult)

  const habits = (() => { try { return JSON.parse(localStorage.getItem('habits') || '[]') } catch { return [] } })()
  const entries = (() => { try { return JSON.parse(localStorage.getItem('journal') || '[]') } catch { return [] } })()
  const habitContext = buildContext(habits, entries)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const send = async (text) => {
    const userMsg = text || input.trim()
    if (!userMsg || loading) return
    if (listening) stopVoice()
    setInput('')
    const newMessages = [...messages, { role: 'user', content: userMsg }]
    setMessages(newMessages)
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          habitContext,
        }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply || '죄송해요, 응답을 받지 못했어요.' }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '연결 오류가 발생했어요. 다시 시도해주세요.' }])
    }
    setLoading(false)
  }

  const reset = () => {
    setMessages([{ role: 'assistant', content: '안녕하세요! 저는 당신의 AI 생산성 코치예요 🤖\n\n습관 현황, 목표 설정, 동기부여 등 무엇이든 물어보세요!' }])
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col" style={{ height: 'calc(100vh - 340px)', minHeight: 380 }}>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
            <Bot size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-black text-white">AI 코치</p>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-white/30">항상 온라인</span>
            </div>
          </div>
        </div>
        <button onClick={reset} className="text-white/20 hover:text-white/50 transition-colors p-1.5 rounded-lg hover:bg-white/10">
          <RotateCcw size={14} />
        </button>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={'flex gap-2.5 ' + (msg.role === 'user' ? 'flex-row-reverse' : '')}
            >
              <div className={'w-7 h-7 rounded-xl flex-shrink-0 flex items-center justify-center text-xs ' + (msg.role === 'user' ? 'bg-violet-600' : 'bg-gradient-to-br from-violet-500 to-pink-500')}>
                {msg.role === 'user' ? <User size={13} className="text-white" /> : <Bot size={13} className="text-white" />}
              </div>
              <div className={'max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ' + (msg.role === 'user' ? 'bg-violet-600 text-white rounded-tr-sm' : 'glass text-white/85 rounded-tl-sm')}>
                {msg.content}
              </div>
            </motion.div>
          ))}
          {loading && (
            <motion.div key="loading" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
                <Bot size={13} className="text-white" />
              </div>
              <div className="glass rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                {[0,1,2].map(i => (
                  <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-violet-400"
                    animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* 빠른 질문 */}
      {messages.length <= 1 && (
        <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-hide">
          {QUICK.map(q => (
            <button key={q} onClick={() => send(q)}
              className="flex-shrink-0 glass rounded-xl px-3 py-2 text-xs text-white/60 hover:text-white border border-white/10 hover:border-violet-400/40 transition-all whitespace-nowrap"
            >{q}</button>
          ))}
        </div>
      )}

      {/* 입력창 */}
      <div className="glass rounded-2xl flex items-center gap-2 px-4 py-3 border border-white/10 focus-within:border-violet-400/40 transition-colors">
        <Sparkles size={14} className="text-violet-400 flex-shrink-0" />
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder={listening ? '말씀해주세요...' : '코치에게 물어보세요...'}
          className="flex-1 bg-transparent text-white text-sm placeholder-white/20 focus:outline-none"
          disabled={loading}
        />
        {/* 마이크 버튼 */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={toggleVoice}
          className={'w-7 h-7 rounded-lg flex items-center justify-center transition-all ' + (listening ? 'bg-red-500/40 text-red-300' : 'text-white/25 hover:text-white/60')}
        >
          {listening
            ? <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.8, repeat: Infinity }}><MicOff size={13} /></motion.div>
            : <Mic size={13} />}
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => send()}
          disabled={!input.trim() || loading}
          className={'w-7 h-7 rounded-lg flex items-center justify-center transition-all ' + (input.trim() && !loading ? 'bg-violet-600 text-white' : 'text-white/20')}
        >
          <Send size={13} />
        </motion.button>
      </div>
      {voiceError && <p className="text-xs text-red-400/70 mt-2 text-center">{voiceError}</p>}
    </motion.div>
  )
}
