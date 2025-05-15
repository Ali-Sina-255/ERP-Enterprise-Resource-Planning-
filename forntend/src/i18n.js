// src/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Import your translation files
import translationEN from "./locales/en/translation.json";
import translationFA from "./locales/fa/translation.json"; // Persian/Dari
import translationPS from "./locales/ps/translation.json"; // Pashto

const resources = {
  en: {
    translation: translationEN,
  },
  fa: {
    translation: translationFA,
  },
  ps: {
    translation: translationPS,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    debug: process.env.NODE_ENV === "development",
    interpolation: {
      escapeValue: false, // React already protects from XSS
    },
    detection: {
      order: [
        "localStorage",
        "navigator",
        "htmlTag",
        "querystring",
        "cookie",
        "path",
        "subdomain",
      ],
      caches: ["localStorage", "cookie"], // Cache language in localStorage and cookie
    },
    supportedLngs: ["en", "fa", "ps"],
    // load: 'languageOnly', // Omit if you might have region-specific files like en-US vs en-GB
  });

// Function to set document direction based on language
const setDocumentDirection = (lng) => {
  const rtlLanguages = ["fa", "ps"]; // Add other RTL language codes if needed
  if (rtlLanguages.includes(lng)) {
    document.documentElement.dir = "rtl";
    document.documentElement.lang = lng;
  } else {
    document.documentElement.dir = "ltr";
    document.documentElement.lang = lng;
  }
};

// Listen for language changes to update document direction
i18n.on("languageChanged", (lng) => {
  setDocumentDirection(lng);
});

// Set initial direction on load
// i18n.resolvedLanguage might not be available immediately on init if LanguageDetector is async
// So, we also check after it's initialized or use the detected language.
// A common practice is to set it once the detector has run.
// The LanguageDetector will typically set the htmlTag's lang and dir if configured,
// but explicitly doing it ensures consistency.

// Let's ensure it's set after initialization too.
// The LanguageDetector should handle the initial `lang` and `dir` on the <html> tag if properly configured,
// but this is an extra safeguard.
if (i18n.isInitialized) {
  setDocumentDirection(i18n.language);
} else {
  // Fallback for initial load before full i18n init (LanguageDetector might be async)
  // This part is a bit tricky because LanguageDetector might run before or after this code.
  // Relying on LanguageDetector to set htmlTag attributes is usually best.
  // Or, if you want to force it from here:
  const initialLang =
    localStorage.getItem("i18nextLng") ||
    navigator.language.split("-")[0] ||
    "en";
  if (["fa", "ps"].includes(initialLang.toLowerCase())) {
    document.documentElement.dir = "rtl";
  } else {
    document.documentElement.dir = "ltr";
  }
  document.documentElement.lang = initialLang.toLowerCase();
}

export default i18n;
