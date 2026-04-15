import { useSettingsStore } from '../stores/settings-store'
import { translations } from './translations'
import type { TranslationKey } from './translations'

export function useTranslation() {
  const language = useSettingsStore((s) => s.language)
  const t = (key: TranslationKey, fallback?: string): string => {
    const map = translations[language] ?? translations.en
    return (map as Record<string, string>)[key] ?? fallback ?? key
  }
  return { t, language }
}
