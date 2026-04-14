import { useState, useEffect, useRef, useCallback } from 'react'

/** Web Speech API types (missing from some TS lib versions) */
interface SpeechRecognitionEventLike {
  results: {
    length: number
    [index: number]: {
      isFinal: boolean
      [index: number]: { transcript: string; confidence: number }
    }
  }
}

interface SpeechRecognitionLike {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  onresult: ((ev: SpeechRecognitionEventLike) => void) | null
  onerror: ((ev: { error: string }) => void) | null
  onstart: (() => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}

interface WindowWithSpeech extends Window {
  SpeechRecognition?: new () => SpeechRecognitionLike
  webkitSpeechRecognition?: new () => SpeechRecognitionLike
}

function getRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === 'undefined') return null
  const w = window as WindowWithSpeech
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export interface VoiceInputState {
  readonly supported: boolean
  readonly listening: boolean
  readonly transcript: string
  readonly interimTranscript: string
  readonly error: string | null
  start: () => void
  stop: () => void
  reset: () => void
}

export function useVoiceInput(language: string = 'zh-CN'): VoiceInputState {
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const [supported, setSupported] = useState(false)
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const Ctor = getRecognitionCtor()
    if (!Ctor) {
      setSupported(false)
      return
    }
    setSupported(true)
    const recognition = new Ctor()
    recognition.lang = language
    recognition.continuous = false
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setListening(true)
      setError(null)
    }

    recognition.onend = () => {
      setListening(false)
      setInterimTranscript('')
    }

    recognition.onerror = (ev) => {
      setError(ev.error)
      setListening(false)
    }

    recognition.onresult = (ev) => {
      let finalText = ''
      let interimText = ''
      for (let i = 0; i < ev.results.length; i++) {
        const result = ev.results[i]
        const text = result[0].transcript
        if (result.isFinal) {
          finalText += text
        } else {
          interimText += text
        }
      }
      if (finalText) setTranscript((prev) => prev + finalText)
      setInterimTranscript(interimText)
    }

    recognitionRef.current = recognition

    return () => {
      try {
        recognition.abort()
      } catch {
        /* noop */
      }
      recognitionRef.current = null
    }
  }, [language])

  const start = useCallback(() => {
    const r = recognitionRef.current
    if (!r) return
    setTranscript('')
    setInterimTranscript('')
    setError(null)
    try {
      r.start()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'start failed')
    }
  }, [])

  const stop = useCallback(() => {
    recognitionRef.current?.stop()
  }, [])

  const reset = useCallback(() => {
    setTranscript('')
    setInterimTranscript('')
    setError(null)
  }, [])

  return { supported, listening, transcript, interimTranscript, error, start, stop, reset }
}

/** Speak text using Web Speech Synthesis (TTS). Returns true if initiated. */
export function speak(text: string, lang: string = 'zh-CN'): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false
  try {
    window.speechSynthesis.cancel()
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = lang
    utter.rate = 1.05
    utter.pitch = 1.0
    window.speechSynthesis.speak(utter)
    return true
  } catch {
    return false
  }
}
