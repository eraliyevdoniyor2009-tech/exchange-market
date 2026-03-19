// src/components/admin/AdminSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, Package,
  Tag, Flag, ShoppingBag, ChevronLeft,
} from "lucide-react";

interface AdminSidebarProps {
  locale: string;
}

export function AdminSidebar({ locale }: AdminSidebarProps) {
  const pathname = usePathname();

  const links = [
    { href: `/${locale}/admin`,            label: "Dashboard",   icon: LayoutDashboard, exact: true },
    { href: `/${locale}/admin/users`,       label: "Users",       icon: Users            },
    { href: `/${locale}/admin/products`,    label: "Products",    icon: Package          },
    { href: `/${locale}/admin/categories`,  label: "Categories",  icon: Tag              },
    { href: `/${locale}/admin/reports`,     label: "Reports",     icon: Flag             },
  ];

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <aside className="w-60 shrink-0 bg-gray-900 text-white min-h-screen flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
            <ShoppingBag className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-sm">Marketplace</p>
            <p className="text-xs text-gray-400">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {links.map(({ href, label, icon: Icon, exact }) => (
          <Link
            key={href}
            href={href}
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
              ${isActive(href, exact)
                ? "bg-brand-600 text-white"
                : "text-gray-300 hover:bg-gray-800 hover:text-white"}
            `}
          >
            <Icon className="w-4.5 h-4.5 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Back to site */}
      <div className="px-3 py-4 border-t border-gray-800">
        <Link
          href={`/${locale}/products`}
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to site
        </Link>
      </div>
    </aside>
  );
}
