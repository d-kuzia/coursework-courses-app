import React from "react";
import { I18nProvider as Provider } from "./I18nContextHook.jsx";

export function I18nProvider({ children }) {
  return <Provider>{children}</Provider>;
}
