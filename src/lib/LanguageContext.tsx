'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import en from '@/messages/en.json';
import es from '@/messages/es.json';
import zh from '@/messages/zh.json';
import fr from '@/messages/fr.json';
import de from '@/messages/de.json';
import ja from '@/messages/ja.json';
import ptBR from '@/messages/pt-BR.json';
import ru from '@/messages/ru.json';

type Messages = typeof en;

const messages: Record<string, Messages> = {
  en,
  es,
  zh,
  fr,
  de,
  ja,
  'pt-BR': ptBR,
  ru,
};

export const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'zh', name: '简体中文', flag: '🇨🇳' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'pt-BR', name: 'Português (Brasil)', flag: '🇧🇷' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
];

type LanguageContextType = {
  locale: string;
  setLocale: (locale: string) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType>({
  locale: 'zh',
  setLocale: () => {},
  t: (key: string) => key,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState('zh');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load saved locale from localStorage
    const saved = localStorage.getItem('locale');
    if (saved && messages[saved]) {
      setLocaleState(saved);
    } else {
      // Detect browser language
      const browserLang = navigator.language;
      const matched = languages.find(l => 
        browserLang.startsWith(l.code) || 
        (l.code === 'pt-BR' && browserLang.startsWith('pt'))
      );
      if (matched) {
        setLocaleState(matched.code);
      }
    }
    setMounted(true);
  }, []);

  const setLocale = (newLocale: string) => {
    if (messages[newLocale]) {
      setLocaleState(newLocale);
      localStorage.setItem('locale', newLocale);
    }
  };

  const t = (key: string): string => {
    const msg = messages[locale] || messages.zh;
    const keys = key.split('.');
    let value: any = msg;
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);