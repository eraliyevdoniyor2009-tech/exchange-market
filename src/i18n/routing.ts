// src/i18n/routing.ts
import { defineRouting } from "next-intl/routing";
import { createSharedPathnamesNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  locales: ["en", "uz", "ru"],
  defaultLocale: "en",
  pathnames: {
    "/": "/",
    "/login": "/login",
    "/register": "/register",
    "/products": "/products",
    "/products/new": "/products/new",
    "/profile": "/profile",
    "/profile/edit": "/profile/edit",
    "/admin": "/admin",
  },
});

export const { Link, redirect, usePathname, useRouter } =
  createSharedPathnamesNavigation(routing);
