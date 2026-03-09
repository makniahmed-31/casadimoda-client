"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { locales } from "@/i18n/config";
import { Globe } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const languageNames: Record<string, string> = {
  fr: "Français",
  en: "English",
  ar: "العربية",
};

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const switchLocale = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale as "fr" | "en" | "ar" });
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-secondary/70 hover:text-accent transition-colors cursor-pointer"
        aria-label="Change language"
      >
        <Globe className="w-4 h-4 md:w-[18px] md:h-[18px]" />
        <span className="hidden md:inline text-xs font-medium uppercase">
          {locale.toUpperCase()}
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-white shadow-xl border border-gray-100 min-w-[140px] z-[100]">
          {locales.map((loc) => (
            <button
              key={loc}
              onClick={() => switchLocale(loc)}
              className={`w-full text-left px-4 py-2.5 text-sm hover:bg-accent hover:text-white transition-colors cursor-pointer ${
                locale === loc ? "bg-accent/10 font-bold" : ""
              }`}
            >
              {languageNames[loc]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
