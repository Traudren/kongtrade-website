

'use client'

import { useState, useEffect } from 'react'
import { translations, Language, TranslationKey } from '@/lib/translations'

export function useTranslation() {
  const [language, setLanguage] = useState<Language>('en')

  const changeLanguage = (newLanguage: Language) => {
    // Only English is supported now
    setLanguage('en')
  }

  const t = (key: TranslationKey): string => {
    return translations.en[key] || key
  }

  return {
    language: 'en' as Language,
    changeLanguage,
    t
  }
}

