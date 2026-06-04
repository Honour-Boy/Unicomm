// i18next setup for full UI localization (ROADMAP Phase 2). This is separate
// from per-message chat translation (services/messages.js): this localizes the
// interface chrome, picked at the landing screen and persisted in localStorage.
//
// Catalogs ship for the languages in UI_LANGUAGES; any other code (the chat
// picker offers 30) falls back to English via `fallbackLng`. RTL is applied to
// <html dir> on language change. Add a locale by dropping a JSON catalog in
// `locales/` and registering it here + in UI_LANGUAGES.
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "@/locales/en.json";
import fr from "@/locales/fr.json";
import es from "@/locales/es.json";
import ar from "@/locales/ar.json";
import zh from "@/locales/zh.json";

// UI languages with a hand-written catalog (a subset of the 30 chat languages).
export const UI_LANGUAGES = ["en", "fr", "es", "ar", "zh"];

// Codes that render right-to-left (kept here so adding an RTL catalog is a
// one-line change). Matches against the base code (e.g. "ar-EG" -> "ar").
const RTL_LANGUAGES = ["ar", "he", "fa", "ur"];

const applyDirection = (lng) => {
  const base = (lng || "en").split("-")[0];
  document.documentElement.lang = base;
  document.documentElement.dir = RTL_LANGUAGES.includes(base) ? "rtl" : "ltr";
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      fr: { translation: fr },
      es: { translation: es },
      ar: { translation: ar },
      zh: { translation: zh },
    },
    fallbackLng: "en",
    supportedLngs: UI_LANGUAGES,
    // Treat "fr-FR" as "fr" rather than falling straight back to English.
    nonExplicitSupportedLngs: true,
    interpolation: { escapeValue: false }, // React already escapes
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "uiLang",
      caches: ["localStorage"],
    },
  });

applyDirection(i18n.resolvedLanguage || i18n.language);
i18n.on("languageChanged", applyDirection);

export default i18n;
