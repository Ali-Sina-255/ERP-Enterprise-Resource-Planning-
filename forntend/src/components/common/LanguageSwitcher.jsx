// src/components/common/LanguageSwitcher.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "fa", name: "فارسی (Persian)", flag: "🇮🇷" }, // Or Afghanistan flag 🇦🇫 for Dari
  { code: "ps", name: "پښتو (Pashto)", flag: "🇦🇫" },
];

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  // Basic dropdown, can be styled more elaborately
  return (
    <div className="relative">
      <button
        type="button"
        className="flex items-center p-2 text-gray-500 hover:text-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
        id="language-menu-button"
        aria-expanded="true"
        aria-haspopup="true"
        // onClick logic for dropdown would go here for a more complex dropdown
      >
        <Globe size={22} />
        <span className="sr-only">Change language</span>
      </button>

      {/* Simple links for now, a proper dropdown is better UX */}
      <div className="ml-2 flex items-center space-x-2">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            disabled={i18n.resolvedLanguage === lang.code}
            title={lang.name}
            className={`p-1 rounded-md text-xs sm:text-sm hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed ${
              i18n.resolvedLanguage === lang.code
                ? "font-bold text-accent ring-1 ring-accent"
                : "text-gray-600"
            }`}
          >
            {lang.flag}{" "}
            <span className="hidden sm:inline">{lang.name.split(" ")[0]}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSwitcher;
