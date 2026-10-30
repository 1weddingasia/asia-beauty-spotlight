// src/lib/use-app-language.ts
"use client";

import { useState, useEffect, useCallback } from 'react';
import { getAppLanguage, setAppLanguage, SITE_I18N, type AppLanguage, APP_LANGUAGES } from './i18n';

export function useAppLanguage() {
  const [lang, setLangState] = useState<AppLanguage>('vi');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setLangState(getAppLanguage());

    const handleLangChange = (e: Event) => {
      const customEvent = e as CustomEvent<AppLanguage>;
      if (customEvent.detail && ['vi', 'en', 'ko', 'zh'].includes(customEvent.detail)) {
        setLangState(customEvent.detail);
      }
    };

    window.addEventListener('app_lang_change', handleLangChange);
    return () => window.removeEventListener('app_lang_change', handleLangChange);
  }, []);

  const changeLanguage = useCallback((newLang: AppLanguage) => {
    setLangState(newLang);
    setAppLanguage(newLang);
  }, []);

  const t = SITE_I18N[lang] || SITE_I18N.vi;

  return {
    lang,
    setLang: changeLanguage,
    t,
    languages: APP_LANGUAGES,
    isMounted: mounted,
  };
}
