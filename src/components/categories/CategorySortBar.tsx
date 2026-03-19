// src/components/categories/CategorySortBar.tsx
"use client";

import { useRouter, usePathname } from "next/navigation";
import { ArrowUpDown, TrendingUp, Clock, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategorySortBarProps {
  baseHref: string;
  currentSortBy: string;
  currentSortOrder: string;
  currentPage: number;
  total: number;
}

const SORT_OPTIONS = [
  { label: "Newest",        sortBy: "createdAt", sortOrder: "desc", icon: Clock        },
  { label: "Oldest",        sortBy: "createdAt", sortOrder: "asc",  icon: Clock        },
  { label: "Price: Low–Hi", sortBy: "price",     sortOrder: "asc",  icon: DollarSign   },
  { label: "Price: Hi–Low", sortBy: "price",     sortOrder: "desc", icon: DollarSign   },
  { label: "Most Viewed",   sortBy: "views",     sortOrder: "desc", icon: TrendingUp   },
];

export function CategorySortBar({
  baseHref, currentSortBy, currentSortOrder, currentPage, total,
}: CategorySortBarProps) {
  const router   = useRouter();
  const pathname = usePathname();

  const navigate = (sortBy: string, sortOrder: string) => {
    const url = new URL(baseHref, "http://x");
    url.searchParams.set("sortBy",    sortBy);
    url.searchParams.set("sortOrder", sortOrder);
    url.searchParams.set("page",      "1");
    router.push(`${baseHref}?${url.searchParams.toString()}`);
  };

  return (
    <div className="flex items-center justify-between gap-3 flex-wrap">
      <p className="text-sm text-gray-500">
        <span className="font-semibold text-gray-900">{total.toLocaleString()}</span>{" "}
        {total === 1 ? "listing" : "listings"}
      </p>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
          <ArrowUpDown className="w-3.5 h-3.5" />
          Sort:
        </span>
        {SORT_OPTIONS.map((opt) => {
          const active =
            currentSortBy === opt.sortBy && currentSortOrder === opt.sortOrder;
          return (
            <button
              key={`${opt.sortBy}-${opt.sortOrder}`}
              onClick={() => navigate(opt.sortBy, opt.sortOrder)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
                active
                  ? "bg-brand-600 text-white border-brand-600 shadow-sm"
                  : "bg-white text-gray-600 border-gray-200 hover:border-brand-300 hover:text-brand-700"
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
