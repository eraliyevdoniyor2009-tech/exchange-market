// src/components/home/CategoryGrid.tsx
import Link from "next/link";
import {
  Laptop, Car, Home, Shirt, Sofa, Dumbbell,
  BookOpen, Leaf, Baby, Wrench, Tag,
} from "lucide-react";
import { getCategoryName } from "@/types";
import type { Category, Locale } from "@/types";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, React.ElementType> = {
  Laptop, Car, Home, Shirt, Sofa, Dumbbell,
  BookOpen, Leaf, Baby, Wrench, Tag,
};

const COLOR_PALETTE = [
  { bg: "bg-blue-50",   icon: "bg-blue-500",   text: "text-blue-700",   hover: "hover:bg-blue-100"   },
  { bg: "bg-rose-50",   icon: "bg-rose-500",   text: "text-rose-700",   hover: "hover:bg-rose-100"   },
  { bg: "bg-amber-50",  icon: "bg-amber-500",  text: "text-amber-700",  hover: "hover:bg-amber-100"  },
  { bg: "bg-green-50",  icon: "bg-green-500",  text: "text-green-700",  hover: "hover:bg-green-100"  },
  { bg: "bg-purple-50", icon: "bg-purple-500", text: "text-purple-700", hover: "hover:bg-purple-100" },
  { bg: "bg-sky-50",    icon: "bg-sky-500",    text: "text-sky-700",    hover: "hover:bg-sky-100"    },
  { bg: "bg-orange-50", icon: "bg-orange-500", text: "text-orange-700", hover: "hover:bg-orange-100" },
  { bg: "bg-teal-50",   icon: "bg-teal-500",   text: "text-teal-700",   hover: "hover:bg-teal-100"   },
  { bg: "bg-pink-50",   icon: "bg-pink-500",   text: "text-pink-700",   hover: "hover:bg-pink-100"   },
  { bg: "bg-indigo-50", icon: "bg-indigo-500", text: "text-indigo-700", hover: "hover:bg-indigo-100" },
];

interface CategoryGridProps {
  categories: Category[];
  locale: Locale;
  showCounts?: boolean;
}

export function CategoryGrid({ categories, locale, showCounts = true }: CategoryGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {categories.map((cat, i) => {
        const color   = COLOR_PALETTE[i % COLOR_PALETTE.length];
        const IconCmp = ICON_MAP[cat.icon ?? ""] ?? Tag;
        const name    = getCategoryName(cat, locale);
        const count   = cat._count?.products ?? 0;

        return (
          <Link
            key={cat.id}
            href={`/${locale}/categories/${cat.slug}`}
            className={cn(
              "group flex flex-col items-center gap-3 p-4 rounded-2xl border-2 border-transparent",
              "transition-all duration-200 hover:-translate-y-1 hover:shadow-md cursor-pointer",
              color.bg,
              color.hover,
              "hover:border-white hover:shadow-lg"
            )}
          >
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center shadow-sm",
              "group-hover:scale-110 transition-transform duration-200",
              color.icon
            )}>
              <IconCmp className="w-6 h-6 text-white" strokeWidth={1.8} />
            </div>
            <div className="text-center">
              <p className={cn("text-sm font-semibold leading-tight", color.text)}>
                {name}
              </p>
              {showCounts && count > 0 && (
                <p className="text-xs text-gray-400 mt-0.5">
                  {count.toLocaleString()} {count === 1 ? "listing" : "listings"}
                </p>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {categories.map((cat, i) => {
        const color   = COLOR_PALETTE[i % COLOR_PALETTE.length];
        const IconCmp = ICON_MAP[cat.icon ?? ""] ?? Tag;
        const name    = getCategoryName(cat, locale);
        const count   = cat._count?.products ?? 0;

        return (
          <Link
            key={cat.id}
            href={`/${locale}/categories/${cat.slug}`}
            className={cn(
              "group flex flex-col items-center gap-3 p-4 rounded-2xl border-2 border-transparent",
              "transition-all duration-200 hover:-translate-y-1 hover:shadow-md cursor-pointer",
              color.bg,
              color.hover,
              "hover:border-white hover:shadow-lg"
            )}
          >
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center shadow-sm",
              "group-hover:scale-110 transition-transform duration-200",
              color.icon
            )}>
              <IconCmp className="w-6 h-6 text-white" strokeWidth={1.8} />
            </div>
            <div className="text-center">
              <p className={cn("text-sm font-semibold leading-tight", color.text)}>
                {name}
              </p>
              {showCounts && count > 0 && (
                <p className="text-xs text-gray-400 mt-0.5">
                  {count.toLocaleString()} {count === 1 ? "listing" : "listings"}
                </p>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
                {name}
              </p>
              {showCounts && count > 0 && (
                <p className="text-xs text-gray-400 mt-0.5">
                  {count.toLocaleString()} {count === 1 ? "listing" : "listings"}
                </p>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
