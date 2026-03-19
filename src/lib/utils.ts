// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(
  price: number | string,
  currency: string = "USD"
): string {
  const numPrice = typeof price === "string" ? parseFloat(price) : price;

  if (currency === "UZS") {
    return new Intl.NumberFormat("uz-UZ", {
      style: "currency",
      currency: "UZS",
      minimumFractionDigits: 0,
    }).format(numPrice);
  }

  if (currency === "RUB") {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      minimumFractionDigits: 0,
    }).format(numPrice);
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(numPrice);
}

export function formatDate(date: Date | string, locale: string = "en"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const localeMap: Record<string, string> = {
    en: "en-US",
    uz: "uz-UZ",
    ru: "ru-RU",
  };
  return new Intl.DateTimeFormat(localeMap[locale] ?? "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

export function formatRelativeTime(
  date: Date | string,
  locale: string = "en"
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  const localeMap: Record<string, string> = {
    en: "en-US",
    uz: "uz-UZ",
    ru: "ru-RU",
  };

  const rtf = new Intl.RelativeTimeFormat(localeMap[locale] ?? "en-US", {
    numeric: "auto",
  });

  if (days > 0) return rtf.format(-days, "day");
  if (hours > 0) return rtf.format(-hours, "hour");
  if (minutes > 0) return rtf.format(-minutes, "minute");
  return rtf.format(-seconds, "second");
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + "...";
}

export function normalizeTelegramUsername(username: string): string {
  return username.startsWith("@") ? username.slice(1) : username;
}

export function getTelegramLink(username: string): string {
  return `https://t.me/${normalizeTelegramUsername(username)}`;
}

export function getPhoneLink(phone: string): string {
  return `tel:${phone}`;
}
