// src/components/layout/Header.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import {
  ShoppingBag, Plus, User, LogOut, Settings,
  LayoutDashboard, Menu, X, ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { SearchBar } from "@/components/shared/SearchBar";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { useAuth } from "@/hooks/use-auth";
import type { SessionUser } from "@/types";

export function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const { data: session } = useSession();
  const { logout, isAdmin } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const user = session?.user as SessionUser | undefined;

  const navLinks = [
    { href: `/${locale}`,          label: t("home")     },
    { href: `/${locale}/products`, label: t("products") },
  ];

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ── */}
          <Link
            href={`/${locale}/products`}
            className="flex items-center gap-2.5 shrink-0"
          >
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center shadow-sm">
              <ShoppingBag className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-lg text-gray-900 hidden sm:block">
              Marketplace
            </span>
          </Link>

          {/* ── Desktop Nav ── */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  px-4 py-2 rounded-md text-sm font-medium transition-colors
                  ${isActive(link.href)
                    ? "bg-brand-50 text-brand-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"}
                `}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* ── Desktop Search ── */}
          <div className="hidden md:block flex-1 max-w-sm mx-4">
            <SearchBar placeholder="Search listings…" />
          </div>

          {/* ── Right Side ── */}
          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <LanguageSwitcher />

            {user ? (
              <>
                {/* Post Ad button */}
                <Link href={`/${locale}/products/new`}>
                  <Button size="sm" className="hidden sm:flex gap-1.5">
                    <Plus className="w-4 h-4" />
                    {t("postAd")}
                  </Button>
                </Link>

                {/* Profile dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <UserAvatar
                      name={user.name}
                      image={user.image}
                      size="sm"
                    />
                    <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[100px] truncate">
                      {user.name}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${profileOpen ? "rotate-180" : ""}`} />
                  </button>

                  {/* Dropdown */}
                  {profileOpen && (
                    <>
                      {/* Backdrop */}
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setProfileOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-200 py-1.5 z-20">
                        {/* User info */}
                        <div className="px-3 py-2 border-b border-gray-100 mb-1">
                          <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>

                        <DropdownLink
                          href={`/${locale}/profile`}
                          icon={<User className="w-4 h-4" />}
                          label={t("myListings")}
                          onClick={() => setProfileOpen(false)}
                        />
                        <DropdownLink
                          href={`/${locale}/profile/edit`}
                          icon={<Settings className="w-4 h-4" />}
                          label={t("settings")}
                          onClick={() => setProfileOpen(false)}
                        />

                        {isAdmin && (
                          <DropdownLink
                            href={`/${locale}/admin`}
                            icon={<LayoutDashboard className="w-4 h-4" />}
                            label={t("admin")}
                            onClick={() => setProfileOpen(false)}
                          />
                        )}

                        <div className="border-t border-gray-100 mt-1 pt-1">
                          <button
                            onClick={() => { setProfileOpen(false); logout(); }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors rounded-md mx-1 text-left"
                            style={{ width: "calc(100% - 8px)" }}
                          >
                            <LogOut className="w-4 h-4" />
                            {t("logout")}
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link href={`/${locale}/login`}>
                  <Button variant="ghost" size="sm">{t("login")}</Button>
                </Link>
                <Link href={`/${locale}/register`}>
                  <Button size="sm">{t("register")}</Button>
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 py-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`
                block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive(link.href)
                  ? "bg-brand-50 text-brand-700"
                  : "text-gray-700 hover:bg-gray-100"}
              `}
            >
              {link.label}
            </Link>
          ))}

          {user ? (
            <>
              <Link
                href={`/${locale}/products/new`}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium bg-brand-600 text-white"
              >
                <Plus className="w-4 h-4" />
                {t("postAd")}
              </Link>
              <Link
                href={`/${locale}/profile`}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                {t("myListings")}
              </Link>
              <button
                onClick={() => { setMobileOpen(false); logout(); }}
                className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
              >
                {t("logout")}
              </button>
            </>
          ) : (
            <div className="flex gap-2 pt-1">
              <Link href={`/${locale}/login`} className="flex-1" onClick={() => setMobileOpen(false)}>
                <Button variant="outline" size="sm" className="w-full">{t("login")}</Button>
              </Link>
              <Link href={`/${locale}/register`} className="flex-1" onClick={() => setMobileOpen(false)}>
                <Button size="sm" className="w-full">{t("register")}</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

function DropdownLink({
  href, icon, label, onClick,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors rounded-md mx-1"
      style={{ width: "calc(100% - 8px)" }}
    >
      <span className="text-gray-400">{icon}</span>
      {label}
    </Link>
  );
}
