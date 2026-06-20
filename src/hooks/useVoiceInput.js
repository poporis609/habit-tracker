import { useState, useRef, useCallback } from 'react'

export default function useVoiceInput(onResult) {
  const [listening, setListening] = useState(false)
  const [error, setError] = useState(null)
  const [interimText, setInterimText] = useState('')
  const recRef = useRef(null)

  const start = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) {
      setError('Chrome 또는 Safari 브라우저를 사용해주세요.')
      return
    }
    const rec = new SR()
    rec.lang = 'ko-KR'
    rec.interimResults = true
    rec.continuous = true
    recRef.current = rec

    let finalText = ''

    rec.onstart = () => { setListening(true); setError(null); setInterimText('') }
    rec.onend = () => { setListening(false); setInterimText(''); finalText = '' }
    rec.onerror = (e) => {
      setListening(false)
      setInterimText('')
      if (e.error === 'not-allowed') setError('마이크 권한이 필요합니다. 브라우저 주소창 🔒 아이콘을 클릭해 허용해주세요.')
      else if (e.error === 'no-speech') setError('음성이 감지되지 않았어요. 다시 시도해주세요.')
      else if (e.error !== 'aborted') setError('음성 인식 오류가 발생했어요.')
    }
    rec.onresult = (e) => {
      let interim = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) finalText += e.results[i][0].transcript
        else interim = e.results[i][0].transcript
      }
      setInterimText(interim)
      onResult(finalText, interim)
    }
    rec.start()
  }, [onResult])

  const stop = useCallback(() => {
    recRef.current?.stop()
    setListening(false)
    setInterimText('')
  }, [])

  const toggle = useCallback(() => {
    listening ? stop() : start()
  }, [listening, start, stop])

  return { listening, error, interimText, toggle, stop }
}
