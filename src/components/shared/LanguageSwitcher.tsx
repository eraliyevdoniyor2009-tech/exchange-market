// src/components/shared/LanguageSwitcher.tsx
"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Globe, ChevronDown } from "lucide-react";
import { routing } from "@/i18n/routing";

const LOCALE_LABELS: Record<string, { short: string; long: string; flag: string }> = {
  en: { short: "EN", long: "English",  flag: "🇺🇸" },
  uz: { short: "UZ", long: "O'zbek",   flag: "🇺🇿" },
  ru: { short: "RU", long: "Русский",  flag: "🇷🇺" },
};

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const switchLocale = (nextLocale: string) => {
    setOpen(false);
    // Replace locale prefix in the current path
    const segments = pathname.split("/");
    if (routing.locales.includes(segments[1] as any)) {
      segments[1] = nextLocale;
    } else {
      segments.splice(1, 0, nextLocale);
    }
    const newPath = segments.join("/") || "/";
    startTransition(() => {
      router.replace(newPath);
    });
  };

  const current = LOCALE_LABELS[locale] ?? LOCALE_LABELS.en;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={isPending}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
        aria-label="Switch language"
      >
        <Globe className="w-4 h-4 text-gray-400" />
        <span>{current.short}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-gray-200 py-1.5 z-20">
            {routing.locales.map((l) => {
              const info = LOCALE_LABELS[l];
              return (
                <button
                  key={l}
                  onClick={() => switchLocale(l)}
                  className={`
                    w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors text-left
                    ${l === locale
                      ? "bg-brand-50 text-brand-700 font-semibold"
                      : "text-gray-700 hover:bg-gray-100"}
                  `}
                >
                  <span className="text-base">{info.flag}</span>
                  <span>{info.long}</span>
                  {l === locale && (
                    <svg className="w-3.5 h-3.5 ml-auto text-brand-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
