import { useTranslation } from '../i18n/useTranslation'

interface Feature {
  icon: string
  titleEn: string
  titleZh: string
  descEn: string
  descZh: string
}

const FEATURES: Feature[] = [
  {
    icon: '🧠',
    titleEn: 'Conversation Memory',
    titleZh: '对话上下文记忆',
    descEn: 'Say "turn on the light", then "make it brighter" — Orbital remembers what "it" means. Siri, Alexa, and Google forget every sentence.',
    descZh: '说"开灯"然后"再亮一点" — Orbital 记得"它"是什么。Siri、Alexa、Google 每句话都失忆。',
  },
  {
    icon: '🔒',
    titleEn: 'Privacy by Default',
    titleZh: '隐私优先设计',
    descEn: 'Voice processing happens in your browser. No audio uploaded. Cloud AI is strictly opt-in per command.',
    descZh: '语音识别在浏览器本地进行，音频不上传。AI 云服务每次单独授权。',
  },
  {
    icon: '💡',
    titleEn: 'Ambient LED Feedback',
    titleZh: '环境灯光反馈',
    descEn: 'The LED sphere shows you what\'s happening at a glance — motion, temperature, weather, notifications.',
    descZh: 'LED 球一眼就让你看到正在发生的事 — 人体感应、温度、天气、通知。',
  },
  {
    icon: '🌐',
    titleEn: 'Fully Bilingual',
    titleZh: '中英双语',
    descEn: 'Speak Chinese or English. Mix them. UI, voice, and responses all switch instantly.',
    descZh: '说中文、英文，或者混着说。UI / 语音 / 反馈全部实时切换。',
  },
  {
    icon: '🔗',
    titleEn: 'Shareable Scenes',
    titleZh: '可分享场景',
    descEn: 'Share a "good night" scene via URL. Friends click once to activate it on their Orbital.',
    descZh: '用链接分享你的"晚安"场景。朋友一点就能在他的 Orbital 上激活。',
  },
  {
    icon: '🔧',
    titleEn: 'Open Source',
    titleZh: '开源',
    descEn: 'MIT licensed. Audit every line. Self-host. No vendor lock-in.',
    descZh: 'MIT 协议。代码可审计，可自部署。不绑定厂商。',
  },
  {
    icon: '📱',
    titleEn: 'Install Like An App',
    titleZh: '可安装成 App',
    descEn: 'Add to your home screen. Works offline-first. No app store needed.',
    descZh: '加到桌面像原生 App 一样启动。离线优先，无需应用商店。',
  },
  {
    icon: '⚡',
    titleEn: 'Sub-500ms Latency',
    titleZh: '延迟 < 500ms',
    descEn: '60fps LED animations. Voice command to light reaction in under half a second.',
    descZh: 'LED 动画 60fps，语音指令到灯光反应不到半秒。',
  },
]

interface Row {
  labelEn: string
  labelZh: string
  orbital: boolean | string
  siri: boolean | string
  alexa: boolean | string
  google: boolean | string
}

const COMPARE_ROWS: Row[] = [
  { labelEn: 'Context memory ("it", follow-ups)', labelZh: '上下文记忆（指代词/接话）', orbital: true, siri: false, alexa: false, google: 'partial' },
  { labelEn: 'Works offline', labelZh: '离线可用', orbital: true, siri: false, alexa: false, google: false },
  { labelEn: 'No audio uploaded', labelZh: '音频不上传', orbital: true, siri: 'partial', alexa: false, google: false },
  { labelEn: 'Open source', labelZh: '开源', orbital: true, siri: false, alexa: false, google: false },
  { labelEn: 'Share scenes via URL', labelZh: '分享场景链接', orbital: true, siri: false, alexa: false, google: false },
  { labelEn: 'Ambient visual display', labelZh: '环境视觉显示', orbital: true, siri: false, alexa: 'partial', google: 'partial' },
  { labelEn: 'Chinese + English mix', labelZh: '中英混合识别', orbital: true, siri: 'partial', alexa: false, google: true },
  { labelEn: 'Self-hostable on your server', labelZh: '可自部署', orbital: true, siri: false, alexa: false, google: false },
  { labelEn: 'No subscription required', labelZh: '不用订阅', orbital: true, siri: true, alexa: true, google: true },
  { labelEn: 'Upfront hardware cost', labelZh: '硬件价格', orbital: '$149', siri: '$99 (Home)', alexa: '$99 (Echo Show)', google: '$99 (Nest Hub)' },
]

function Cell({ value }: { value: boolean | string }) {
  if (value === true) {
    return <span className="text-green-400" aria-label="Yes">✓</span>
  }
  if (value === false) {
    return <span className="text-slate-600" aria-label="No">—</span>
  }
  if (value === 'partial') {
    return <span className="text-amber-400" aria-label="Partial">◐</span>
  }
  return <span className="text-xs text-slate-400">{value}</span>
}

export function FeaturesPage() {
  const { t, language } = useTranslation()

  return (
    <div className="space-y-10">
      {/* Hero */}
      <div className="rounded-3xl bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-pink-500/10 border p-6 md:p-10"
        style={{ borderColor: 'var(--border)' }}
      >
        <h1 className="text-2xl md:text-4xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          {t('features.title')}
        </h1>
        <p className="mt-3 text-base md:text-lg" style={{ color: 'var(--text-secondary)' }}>
          {t('features.subtitle')}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href="#dashboard"
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:scale-[1.02] transition-transform"
          >
            🎤 {t('features.ctaTry')}
          </a>
          <a
            href="https://github.com/qihao42/home-ai"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-semibold transition-colors"
            style={{ borderColor: 'var(--border-strong)', color: 'var(--text-primary)' }}
          >
            ⭐ GitHub
          </a>
        </div>
      </div>

      {/* Core features grid */}
      <section>
        <h2 className="mb-5 text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          {t('features.section.core')}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div
              key={f.titleEn}
              className="rounded-2xl border p-5 transition-colors"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>
                {language === 'en' ? f.titleEn : f.titleZh}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {language === 'en' ? f.descEn : f.descZh}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison table */}
      <section>
        <h2 className="mb-5 text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          {t('features.section.compare')}
        </h2>
        <div
          className="overflow-x-auto rounded-2xl border"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-secondary)' }}>
                  {language === 'en' ? 'Feature' : '功能'}
                </th>
                <th className="px-4 py-3 text-center font-semibold text-purple-400">HomeAI</th>
                <th className="px-4 py-3 text-center font-semibold" style={{ color: 'var(--text-secondary)' }}>Siri</th>
                <th className="px-4 py-3 text-center font-semibold" style={{ color: 'var(--text-secondary)' }}>Alexa</th>
                <th className="px-4 py-3 text-center font-semibold" style={{ color: 'var(--text-secondary)' }}>Google</th>
              </tr>
            </thead>
            <tbody>
              {COMPARE_ROWS.map((row) => (
                <tr key={row.labelEn} className="border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
                  <td className="px-4 py-3" style={{ color: 'var(--text-primary)' }}>
                    {language === 'en' ? row.labelEn : row.labelZh}
                  </td>
                  <td className="px-4 py-3 text-center text-lg">
                    <Cell value={row.orbital} />
                  </td>
                  <td className="px-4 py-3 text-center text-lg">
                    <Cell value={row.siri} />
                  </td>
                  <td className="px-4 py-3 text-center text-lg">
                    <Cell value={row.alexa} />
                  </td>
                  <td className="px-4 py-3 text-center text-lg">
                    <Cell value={row.google} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
          <span>✓ = {language === 'en' ? 'Yes' : '支持'}</span>
          <span>◐ = {language === 'en' ? 'Partial' : '部分支持'}</span>
          <span>— = {language === 'en' ? 'No' : '不支持'}</span>
        </div>
      </section>
    </div>
  )
}
