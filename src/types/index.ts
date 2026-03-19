// src/types/index.ts
import { Role, ProductStatus, ReportStatus, ReportReason } from "@prisma/client";

// ─── Auth / Session ────────────────────────────────────────

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: Role;
  phone?: string | null;
  telegram?: string | null;
}

// ─── User ──────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  telegram?: string | null;
  avatar?: string | null;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  _count?: { products: number };
}

// ─── Category ─────────────────────────────────────────────

export interface Category {
  id: string;
  nameEn: string;
  nameUz: string;
  nameRu: string;
  slug: string;
  icon?: string | null;
  isActive: boolean;
  _count?: { products: number };
}

export type Locale = "en" | "uz" | "ru";

export function getCategoryName(category: Category, locale: Locale): string {
  switch (locale) {
    case "uz":
      return category.nameUz;
    case "ru":
      return category.nameRu;
    default:
      return category.nameEn;
  }
}

// ─── Product ──────────────────────────────────────────────

export interface ProductListItem {
  id: string;
  title: string;
  price: string | number;
  currency: string;
  location: string;
  images: string[];
  status: ProductStatus;
  views: number;
  createdAt: Date;
  seller: {
    id: string;
    name: string;
    avatar?: string | null;
    phone?: string | null;
    telegram?: string | null;
  };
  category: {
    id: string;
    nameEn: string;
    nameUz: string;
    nameRu: string;
    slug: string;
  };
}

export interface ProductDetail extends ProductListItem {
  description: string;
  updatedAt: Date;
}

// ─── Report ───────────────────────────────────────────────

export interface Report {
  id: string;
  reason: ReportReason;
  description?: string | null;
  status: ReportStatus;
  createdAt: Date;
  reporter: { id: string; name: string; email: string };
  product: { id: string; title: string };
}

// ─── API Response ─────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

// ─── Filters ──────────────────────────────────────────────

export interface ProductFilters {
  search?: string;
  categoryId?: string;
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  currency?: string;
  sortBy?: "createdAt" | "price" | "views";
  sortOrder?: "asc" | "desc";
  page?: number;
  perPage?: number;
}
