import { createContext } from "react";
import { DEFAULT_LANG } from "../i18n/config";

export const I18nContext = createContext({
  lang: DEFAULT_LANG,
  setLang: () => {},
  t: (key) => key,
  languages: [DEFAULT_LANG]
});
