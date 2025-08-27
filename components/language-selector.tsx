
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Check, ChevronDown, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Language } from '@/lib/translations'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface LanguageOption {
  code: string
  name: string
  flag: string
}

const languages: LanguageOption[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
]

interface LanguageSelectorProps {
  currentLanguage: string
  onLanguageChange: (language: Language) => void
}

export function LanguageSelector({ currentLanguage, onLanguageChange }: LanguageSelectorProps) {
  const currentLang = languages.find(lang => lang.code === currentLanguage) || languages[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="text-white hover:text-cyan-400 hover:bg-white/10 rounded-xl">
          <Globe className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline mr-1">{currentLang.flag}</span>
          <span className="hidden md:inline">{currentLang.name}</span>
          <ChevronDown className="h-4 w-4 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="glass-effect border-white/20 rounded-xl">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => onLanguageChange(language.code as Language)}
            className={cn(
              "text-white cursor-pointer rounded-lg",
              currentLanguage === language.code && "bg-white/10"
            )}
          >
            <span className="mr-2">{language.flag}</span>
            <span className="flex-1">{language.name}</span>
            {currentLanguage === language.code && (
              <Check className="h-4 w-4 text-cyan-400" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
