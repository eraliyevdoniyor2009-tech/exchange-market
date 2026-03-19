// src/components/shared/SearchBar.tsx
"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Search, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  initialValue?: string;
}

export function SearchBar({ placeholder = "Search…", className, initialValue = "" }: SearchBarProps) {
  const router    = useRouter();
  const locale    = useLocale();
  const inputRef  = useRef<HTMLInputElement>(null);
  const [query, setQuery]             = useState(initialValue);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen]               = useState(false);
  const [isPending, startTransition]  = useTransition();
  const debounceRef = useRef<NodeJS.Timeout>();

  // Sync with URL on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      const q  = sp.get("search");
      if (q) setQuery(q);
    }
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (query.length < 2) { setSuggestions([]); return; }

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`);
        const { data } = await res.json();
        setSuggestions(data ?? []);
        setOpen(true);
      } catch { setSuggestions([]); }
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const submit = (term: string) => {
    setOpen(false);
    startTransition(() => {
      router.push(`/${locale}/products?search=${encodeURIComponent(term.trim())}`);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && query.trim()) submit(query);
    if (e.key === "Escape") setOpen(false);
  };

  return (
    <div className={cn("relative", className)}>
      <div className={cn(
        "flex items-center h-9 rounded-xl border bg-gray-50 transition-all",
        open
          ? "border-brand-400 bg-white ring-2 ring-brand-100"
          : "border-gray-200 hover:border-gray-300"
      )}>
        <span className="pl-3 text-gray-400 shrink-0">
          {isPending
            ? <Loader2 className="w-4 h-4 animate-spin text-brand-500" />
            : <Search className="w-4 h-4" />
          }
        </span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          onKeyDown={handleKeyDown}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={placeholder}
          className="flex-1 h-full bg-transparent px-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
          autoComplete="off"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setSuggestions([]); inputRef.current?.focus(); }}
            className="pr-2.5 text-gray-300 hover:text-gray-500 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Suggestions dropdown */}
      {open && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-200 py-1.5 z-50 overflow-hidden">
          {suggestions.map((s) => (
            <button
              key={s}
              onMouseDown={() => submit(s)}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-700 transition-colors text-left"
            >
              <Search className="w-3.5 h-3.5 text-gray-300 shrink-0" />
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
