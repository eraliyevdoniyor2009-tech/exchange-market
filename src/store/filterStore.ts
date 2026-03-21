// src/store/filterStore.ts
import { create } from "zustand";
import type { ProductFilters } from "@/types";

interface FilterStore extends ProductFilters {
  setFilter: <K extends keyof ProductFilters>(key: K, value: ProductFilters[K]) => void;
  setFilters: (filters: Partial<ProductFilters>) => void;
  resetFilters: () => void;
}

const DEFAULT_FILTERS: ProductFilters = {
  search: "",
  categorySlug: "",
  categoryId: "",
  location: "",
  minPrice: undefined,
  maxPrice: undefined,
  sortBy: "createdAt",
  sortOrder: "desc",
  page: 1,
  perPage: 20,
};

export const useFilterStore = create<FilterStore>((set) => ({
  ...DEFAULT_FILTERS,

  setFilter: (key, value) =>
    set((state) => ({ ...state, [key]: value, page: key !== "page" ? 1 : (value as number) })),

  setFilters: (filters) =>
    set((state) => ({ ...state, ...filters, page: 1 })),

  resetFilters: () => set({ ...DEFAULT_FILTERS }),
}));

// Build query string from filters
export function buildProductQueryString(filters: Partial<ProductFilters>): string {
  const params = new URLSearchParams();
  if (filters.search)       params.set("search",       filters.search);
  if (filters.categorySlug) params.set("categorySlug", filters.categorySlug);
  if (filters.categoryId)   params.set("categoryId",   filters.categoryId);
  if (filters.location)     params.set("location",     filters.location);
  if (filters.minPrice)     params.set("minPrice",     String(filters.minPrice));
  if (filters.maxPrice)     params.set("maxPrice",     String(filters.maxPrice));
  if (filters.sortBy)       params.set("sortBy",       filters.sortBy);
  if (filters.sortOrder)    params.set("sortOrder",    filters.sortOrder);
  if (filters.page)         params.set("page",         String(filters.page));
  if (filters.perPage)      params.set("perPage",      String(filters.perPage));
  if ((filters as any).sellerId) params.set("sellerId", (filters as any).sellerId); 
  return params.toString();
}
