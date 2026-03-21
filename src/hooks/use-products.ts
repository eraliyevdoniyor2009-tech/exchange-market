// src/hooks/use-products.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import type { ProductListItem, PaginatedResponse, ProductFilters } from "@/types";
import { buildProductQueryString } from "@/store/filterStore";

interface UseProductsReturn {
  products: ProductListItem[];
  total: number;
  totalPages: number;
  page: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useProducts(filters: Partial<ProductFilters>): UseProductsReturn {
  const [products, setProducts]     = useState<ProductListItem[]>([]);
  const [total, setTotal]           = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage]             = useState(1);
  const [isLoading, setIsLoading]   = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [tick, setTick]             = useState(0);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    const qs = buildProductQueryString(filters);

    fetch(`/api/products?${qs}`)
      .then((r) => r.json())
      .then((json: PaginatedResponse<ProductListItem> & { error?: string }) => {
        if (cancelled) return;
        if (json.error) {
          setError(json.error);
          return;
        }
        setProducts(json.data ?? []);
        setTotal(json.total ?? 0);
        setTotalPages(json.totalPages ?? 0);
        setPage(json.page ?? 1);
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load products");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [
    filters.search,
    filters.categorySlug,
    filters.categoryId,
    filters.location,
    filters.minPrice,
    filters.maxPrice,
    filters.sortBy,
    filters.sortOrder,
    filters.page,
    filters.perPage,
    (filters as any).sellerId,
    tick,
  ]);

  return { products, total, totalPages, page, isLoading, error, refetch };
}

// Upload a single file to Cloudinary via signed upload
export async function uploadImageToCloudinary(
  file: File,
  folder = "marketplace/products"
): Promise<string> {
  // 1. Get signature from our API
  const sigRes = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder }),
  });

  if (!sigRes.ok) throw new Error("Failed to get upload signature");

  const { data } = await sigRes.json();
  const { signature, timestamp, cloudName, apiKey } = data;

  // 2. Upload to Cloudinary
  const formData = new FormData();
  formData.append("file", file);
  formData.append("signature", signature);
  formData.append("timestamp", String(timestamp));
  formData.append("api_key", apiKey);
  formData.append("folder", folder);
  formData.append("transformation", "c_limit,w_1200,h_1200,q_auto,f_auto");

  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!uploadRes.ok) throw new Error("Image upload failed");

  const uploadData = await uploadRes.json();
  return uploadData.secure_url as string;
}
