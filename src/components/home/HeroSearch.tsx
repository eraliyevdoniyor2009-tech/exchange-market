// src/components/home/HeroSearch.tsx
"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Search, X, TrendingUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const POPULAR_SEARCHES = [
  "iPhone", "MacBook", "Toyota", "Sofa", "Nike", "Apartment",
];

interface HeroSearchProps {
  placeholder: string;
}

export function HeroSearch({ placeholder }: HeroSearchProps) {
  const router      = useRouter();
  const locale      = useLocale();
  const inputRef    = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [query, setQuery]               = useState("");
  const [suggestions, setSuggestions]   = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIdx, setActiveIdx]       = useState(-1);
  const [isPending, startTransition]    = useTransition();
  const debounceRef = useRef<NodeJS.Timeout>();

  // Fetch suggestions with debounce
  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`);
        const { data } = await res.json();
        setSuggestions(data ?? []);
      } catch {
        setSuggestions([]);
      }
    }, 250);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current && !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const navigate = (term: string) => {
    setShowDropdown(false);
    startTransition(() => {
      router.push(`/${locale}/products?search=${encodeURIComponent(term)}`);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const items = suggestions.length > 0 ? suggestions : POPULAR_SEARCHES;
    if (!showDropdown) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIdx >= 0 && items[activeIdx]) {
        navigate(items[activeIdx]);
      } else if (query.trim()) {
        navigate(query.trim());
      }
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  const showPopular = showDropdown && query.length < 2;
  const showSuggestions = showDropdown && suggestions.length > 0 && query.length >= 2;

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Search input */}
      <div className={cn(
        "flex items-center bg-white rounded-2xl shadow-xl border-2 transition-all duration-200",
        showDropdown
          ? "border-brand-400 shadow-2xl ring-4 ring-brand-100"
          : "border-transparent hover:border-gray-200"
      )}>
        <div className="pl-5 pr-3 text-gray-400 shrink-0">
          {isPending
            ? <Loader2 className="w-5 h-5 animate-spin text-brand-500" />
            : <Search className="w-5 h-5" />
          }
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setShowDropdown(true); setActiveIdx(-1); }}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 h-14 bg-transparent text-gray-900 text-base placeholder:text-gray-400 focus:outline-none"
          autoComplete="off"
          spellCheck={false}
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setSuggestions([]); inputRef.current?.focus(); }}
            className="px-3 text-gray-300 hover:text-gray-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={() => query.trim() && navigate(query.trim())}
          className="m-2 px-6 h-10 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white text-sm font-semibold rounded-xl transition-colors shrink-0"
        >
          Search
        </button>
      </div>

      {/* Dropdown */}
      {(showPopular || showSuggestions) && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
        >
          {showPopular && (
            <div className="p-3">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">
                <TrendingUp className="w-3.5 h-3.5" />
                Popular searches
              </p>
              <div className="flex flex-wrap gap-2 px-2">
                {POPULAR_SEARCHES.map((term, i) => (
                  <button
                    key={term}
                    onClick={() => navigate(term)}
                    onMouseEnter={() => setActiveIdx(i)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                      activeIdx === i
                        ? "bg-brand-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-brand-50 hover:text-brand-700"
                    )}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {showSuggestions && (
            <ul className="py-2">
              {suggestions.map((s, i) => (
                <li key={s}>
                  <button
                    onClick={() => navigate(s)}
                    onMouseEnter={() => setActiveIdx(i)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors",
                      activeIdx === i
                        ? "bg-brand-50 text-brand-700"
                        : "text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    <Search className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                    <span>
                      {/* Bold the matching portion */}
                      {s.toLowerCase().startsWith(query.toLowerCase()) ? (
                        <>
                          <strong className="font-semibold">{s.slice(0, query.length)}</strong>
                          {s.slice(query.length)}
                        </>
                      ) : s}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
