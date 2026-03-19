// src/components/home/StatsBar.tsx
import { Package, Users, Tag } from "lucide-react";

interface StatsBarProps {
  stats: {
    activeListings: number;
    totalUsers: number;
    totalCategories: number;
  };
}

export function StatsBar({ stats }: StatsBarProps) {
  const items = [
    { icon: Package, value: stats.activeListings, label: "Active listings" },
    { icon: Users,   value: stats.totalUsers,     label: "Registered users" },
    { icon: Tag,     value: stats.totalCategories, label: "Categories"      },
  ];

  return (
    <div className="flex items-center justify-center gap-8 sm:gap-16 flex-wrap">
      {items.map(({ icon: Icon, value, label }) => (
        <div key={label} className="flex items-center gap-2.5 text-white/80">
          <Icon className="w-4 h-4 text-white/60" />
          <span>
            <strong className="text-white font-bold text-lg">
              {value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
            </strong>{" "}
            <span className="text-sm">{label}</span>
          </span>
        </div>
      ))}
    </div>
  );
}
