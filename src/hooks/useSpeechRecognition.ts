import { useState, useRef, useCallback } from 'react'

type Status = 'idle' | 'listening' | 'done' | 'unsupported'

export function useSpeechRecognition() {
  const [status, setStatus] = useState<Status>('idle')
  const [transcript, setTranscript] = useState('')
  const recogRef = useRef<SpeechRecognition | null>(null)

  const isSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  const start = useCallback(() => {
    if (!isSupported) {
      setStatus('unsupported')
      return
    }

    const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition
    const recognition: SpeechRecognition = new SR()
    recognition.lang = 'ja-JP'
    recognition.continuous = true
    recognition.interimResults = true

    recognition.onstart = () => setStatus('listening')

    recognition.onresult = (e: SpeechRecognitionEvent) => {
      let final = ''
      let interim = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript
        if (e.results[i].isFinal) final += t
        else interim += t
      }
      setTranscript(prev => prev + final || interim)
    }

    recognition.onerror = () => setStatus('done')
    recognition.onend = () => setStatus('done')

    recogRef.current = recognition
    setTranscript('')
    setStatus('listening')
    recognition.start()
  }, [isSupported])

  const stop = useCallback(() => {
    recogRef.current?.stop()
    setStatus('done')
  }, [])

  const reset = useCallback(() => {
    recogRef.current?.stop()
    setTranscript('')
    setStatus('idle')
  }, [])

  return { status, transcript, start, stop, reset, isSupported }
}
