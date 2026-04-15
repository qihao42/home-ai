import { useState, useEffect, useCallback, useRef } from 'react'
import { useVoiceInput, speak } from '../../hooks/use-voice-input'
import { parseVoiceCommand, answerQuery } from '../../utils/voice-parser'
import type { ParsedCommand, ConversationContext } from '../../utils/voice-parser'
import { useEntityStore } from '../../stores/entity-store'
import { useNotificationStore } from '../../stores/notification-store'
import { callService, fetchScenes, activateScene } from '../../api/client'

const LANG_OPTIONS = [
  { code: 'zh-CN', label: '中文' },
  { code: 'en-US', label: 'EN' },
]

export function VoiceButton() {
  const [lang, setLang] = useState<string>(() =>
    localStorage.getItem('voice-lang') ?? 'zh-CN'
  )
  const [showPanel, setShowPanel] = useState(false)
  const [lastCommand, setLastCommand] = useState<ParsedCommand | null>(null)
  const [executing, setExecuting] = useState(false)
  const voice = useVoiceInput(lang)
  const entities = useEntityStore((s) => s.entities)
  const addNotification = useNotificationStore((s) => s.addNotification)
  const contextRef = useRef<ConversationContext>({})

  useEffect(() => {
    localStorage.setItem('voice-lang', lang)
  }, [lang])

  const executeCommand = useCallback(
    async (parsed: ParsedCommand) => {
      setExecuting(true)
      try {
        const { intent } = parsed
        let feedback = parsed.response

        switch (intent.kind) {
          case 'turn_on':
          case 'turn_off': {
            const action = intent.kind === 'turn_on' ? 'turn_on' : 'turn_off'
            if (intent.target === '所有灯') {
              const lights = Object.values(entities).filter((e) => e.domain === 'light')
              await Promise.all(
                lights.map((l) => {
                  const id = l.entityId.split('.').pop() ?? l.entityId
                  return callService('light', action, { entity_id: id })
                })
              )
            } else if (intent.entityId) {
              const [domain] = intent.entityId.split('.')
              const id = intent.entityId.split('.').pop() ?? intent.entityId
              if (domain === 'binary_sensor') {
                // Binary sensor doesn't have turn_on/off - use toggle
                await callService('binary_sensor', 'toggle', { entity_id: id })
              } else {
                await callService(domain, action, { entity_id: id })
              }
            } else {
              feedback = `找不到 ${intent.target}`
            }
            break
          }

          case 'toggle': {
            if (intent.entityId) {
              const [domain] = intent.entityId.split('.')
              const id = intent.entityId.split('.').pop() ?? intent.entityId
              await callService(domain, 'toggle', { entity_id: id })
            }
            break
          }

          case 'set_brightness': {
            if (intent.entityId) {
              const id = intent.entityId.split('.').pop() ?? intent.entityId
              await callService('light', 'turn_on', {
                entity_id: id,
                brightness: intent.brightness,
              })
            } else {
              feedback = `找不到 ${intent.target}`
            }
            break
          }

          case 'adjust_brightness': {
            if (intent.entityId) {
              const id = intent.entityId.split('.').pop() ?? intent.entityId
              // Read current brightness from store, apply delta, clamp 0..255
              const current = entities[intent.entityId] ?? Object.values(entities).find((e) => e.entityId === intent.entityId)
              const prev = (current?.attributes.brightness as number) ?? 128
              const next = Math.max(0, Math.min(255, prev + intent.delta))
              await callService('light', 'turn_on', { entity_id: id, brightness: next })
              feedback = `${intent.target} 亮度调到 ${Math.round((next / 255) * 100)}%`
            } else {
              feedback = '不知道要调哪个灯'
            }
            break
          }

          case 'activate_scene': {
            const scenes = await fetchScenes()
            const match = scenes.find(
              (s) => s.name.toLowerCase() === intent.sceneName.toLowerCase()
            )
            if (match) {
              await activateScene(match.id)
            } else {
              feedback = `找不到场景 ${intent.sceneName}`
            }
            break
          }

          case 'query_temperature':
          case 'query_humidity':
          case 'query_status': {
            feedback = answerQuery(intent, entities)
            break
          }

          case 'unknown': {
            break
          }
        }

        // Surface feedback
        if (feedback) {
          addNotification({
            type: parsed.intent.kind === 'unknown' ? 'warning' : 'success',
            title: parsed.intent.kind === 'unknown' ? '未识别' : '语音指令',
            message: feedback,
          })
          speak(feedback, lang)
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : '执行失败'
        addNotification({ type: 'alert', title: '错误', message: msg })
      } finally {
        setExecuting(false)
      }
    },
    [entities, addNotification, lang]
  )

  // When final transcript arrives, parse (with context) + execute
  useEffect(() => {
    if (!voice.transcript) return
    const parsed = parseVoiceCommand(voice.transcript, entities, contextRef.current)
    contextRef.current = parsed.nextContext
    setLastCommand(parsed)
    void executeCommand(parsed)
    voice.reset()
  }, [voice.transcript])

  const handleClick = () => {
    if (!voice.supported) {
      addNotification({
        type: 'warning',
        title: '不支持语音',
        message: '请使用 Chrome / Edge / Safari',
      })
      return
    }
    if (voice.listening) {
      voice.stop()
    } else {
      setShowPanel(true)
      voice.start()
    }
  }

  const handleClose = () => {
    voice.stop()
    setShowPanel(false)
    setLastCommand(null)
  }

  if (!voice.supported) {
    return null
  }

  return (
    <>
      {/* Floating mic button - sits above bottom nav on mobile */}
      <button
        onClick={handleClick}
        aria-label={voice.listening ? 'Stop listening' : 'Start voice command'}
        style={{ bottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))' }}
        className={`fixed right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full shadow-xl transition-all md:!bottom-6 md:right-6 md:h-16 md:w-16 ${
          voice.listening
            ? 'bg-red-500 animate-pulse scale-110'
            : 'bg-gradient-to-br from-purple-500 to-pink-500 hover:scale-105'
        }`}
      >
        <span className="text-2xl md:text-3xl">🎤</span>
        {voice.listening && (
          <span className="absolute inset-0 rounded-full border-4 border-red-300/50 animate-ping" />
        )}
      </button>

      {/* Voice panel overlay */}
      {showPanel && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm md:items-center"
          onClick={handleClose}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/50">
              <div className="flex items-center gap-2">
                <span className={`h-3 w-3 rounded-full ${
                  voice.listening ? 'bg-red-500 animate-pulse' : 'bg-slate-500'
                }`} />
                <span className="text-sm font-semibold text-white">
                  {voice.listening ? '正在聆听...' : executing ? '执行中...' : '语音助手'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {/* Language toggle */}
                <div className="flex rounded-lg border border-slate-700 p-0.5 text-xs">
                  {LANG_OPTIONS.map((opt) => (
                    <button
                      key={opt.code}
                      onClick={() => setLang(opt.code)}
                      className={`px-2 py-1 rounded ${
                        lang === opt.code
                          ? 'bg-purple-500/20 text-purple-300'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleClose}
                  className="rounded-lg px-2 py-1 text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Live transcript */}
            <div className="px-5 py-6 min-h-[120px] flex items-center justify-center">
              {voice.interimTranscript ? (
                <p className="text-2xl text-slate-400 text-center">
                  {voice.interimTranscript}
                </p>
              ) : voice.listening ? (
                <p className="text-lg text-slate-500 text-center">说话吧...</p>
              ) : lastCommand ? (
                <div className="text-center space-y-2">
                  <p className="text-lg text-white">{lastCommand.response}</p>
                  {lastCommand.confidence > 0 && (
                    <p className="text-xs text-slate-500">
                      置信度 {Math.round(lastCommand.confidence * 100)}%
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-slate-500 text-center">点下方按钮开始说话</p>
              )}
            </div>

            {/* Context indicator */}
            {contextRef.current.lastEntityName && (
              <div className="px-5 pb-2">
                <div className="flex items-center gap-2 text-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                  <span className="text-slate-400">
                    Remembers: <span className="text-purple-300 font-medium">{contextRef.current.lastEntityName}</span>
                    <span className="text-slate-500"> — say "再亮一点" / "关掉" / "it"</span>
                  </span>
                  <button
                    onClick={() => {
                      contextRef.current = {}
                      setLastCommand(null)
                    }}
                    className="ml-auto text-slate-500 hover:text-slate-300"
                  >
                    清除
                  </button>
                </div>
              </div>
            )}

            {/* Quick examples */}
            <div className="px-5 pb-4">
              <p className="text-xs text-slate-500 mb-2">试试说：</p>
              <div className="flex flex-wrap gap-2">
                {[
                  '打开客厅的灯',
                  '再亮一点',
                  '关掉',
                  '晚安',
                  '温度多少度',
                ].map((ex) => (
                  <span
                    key={ex}
                    className="px-2.5 py-1 rounded-full bg-slate-800 text-xs text-slate-400 border border-slate-700"
                  >
                    {ex}
                  </span>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="px-5 py-4 border-t border-slate-700/50 flex gap-2">
              <button
                onClick={() => voice.start()}
                disabled={voice.listening || executing}
                className="flex-1 py-2.5 rounded-lg bg-purple-500/20 border border-purple-500/40 text-purple-300 text-sm font-medium hover:bg-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🎤 {voice.listening ? '聆听中...' : '开始说话'}
              </button>
              {voice.listening && (
                <button
                  onClick={voice.stop}
                  className="px-4 py-2.5 rounded-lg bg-red-500/20 border border-red-500/40 text-red-300 text-sm font-medium hover:bg-red-500/30"
                >
                  停止
                </button>
              )}
            </div>

            {voice.error && (
              <div className="px-5 pb-4 text-xs text-red-400">
                错误: {voice.error}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
