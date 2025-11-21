import { useCallback, useMemo, useState } from "react";
import { DEFAULT_LANG, translations } from "../i18n/config";
import { I18nContext } from "./I18nContextStore";

const STORAGE_KEY = "courses:lang";
const fallbackLang = DEFAULT_LANG;
const availableLanguages = Object.keys(translations);

function getValue(dict, key) {
  return key.split(".").reduce((acc, part) => (acc ? acc[part] : undefined), dict);
}

function format(template, vars) {
  if (!vars) return template;
  return template.replace(/{{\s*(\w+)\s*}}/g, (_, token) =>
    Object.prototype.hasOwnProperty.call(vars, token) ? String(vars[token]) : ""
  );
}

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved && availableLanguages.includes(saved)) {
        return saved;
      }
    }
    return DEFAULT_LANG;
  });

  const setLang = useCallback((next) => {
    if (!availableLanguages.includes(next)) return;
    setLangState(next);
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, next);
      }
    } catch {
      // ignore
    }
  }, []);

  const translate = useCallback(
    (key, vars) => {
      const template =
        getValue(translations[lang], key) ??
        getValue(translations[fallbackLang], key) ??
        key;
      if (typeof template !== "string") return template;
      return format(template, vars);
    },
    [lang]
  );

  const value = useMemo(
    () => ({
      lang,
      setLang,
      t: translate,
      languages: availableLanguages
    }),
    [lang, translate, setLang]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
