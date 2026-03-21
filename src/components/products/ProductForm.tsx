// src/components/products/ProductForm.tsx
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  Tag, MapPin, DollarSign, AlignLeft, Type, ChevronDown,
} from "lucide-react";
import { createProductSchema, type CreateProductInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageUploader } from "./ImageUploader";
import { toast } from "@/hooks/use-toast";
import type { Category } from "@/types";
import { getCategoryName } from "@/types";
import { cn } from "@/lib/utils";

interface ProductFormProps {
  /** If provided, form is in edit mode */
  productId?: string;
  defaultValues?: Partial<CreateProductInput>;
}

const CURRENCIES = [
  { value: "USD", label: "USD ($)" },
  { value: "UZS", label: "UZS (soʻm)" },
  { value: "RUB", label: "RUB (₽)" },
];

export function ProductForm({ productId, defaultValues }: ProductFormProps) {
  const t       = useTranslations("product");
  const tCommon = useTranslations("common");
  const router  = useRouter();
  const locale  = useLocale() as "en" | "uz" | "ru";

  const [categories, setCategories] = useState<Category[]>([]);
  const [catOpen, setCatOpen]       = useState(false);
  const [curOpen, setCurOpen]       = useState(false);
  const isEdit = Boolean(productId);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    setValue,
    watch,
    setError,
  } = useForm<CreateProductInput>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      currency: "USD",
      images: [],
      ...defaultValues,
    },
  });

  const watchedImages   = watch("images");
  const watchedCatId    = watch("categoryId");
  const watchedCurrency = watch("currency");

  // Load categories
  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((json) => setCategories(json.data ?? []))
      .catch(() => {});
  }, []);

  const selectedCategory = categories.find((c) => c.id === watchedCatId);
  const selectedCurrency = CURRENCIES.find((c) => c.value === watchedCurrency);

  const onSubmit = async (data: CreateProductInput) => {
    try {
      const url    = isEdit ? `/api/products/${productId}` : "/api/products";
      const method = isEdit ? "PATCH" : "POST";

      const res  = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (!res.ok) {
        setError("root", { message: json.error ?? "Something went wrong" });
        return;
      }

      toast({
        variant: "success",
        title: isEdit ? "Listing updated!" : "Listing published!",
      });

      const productId_ = json.data?.id ?? productId;
      router.push(`/${locale}/products/${productId_}`);
      router.refresh();
    } catch {
      setError("root", { message: "Network error. Please try again." });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>

      {/* ── Root error ── */}
      {errors.root && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200">
          <p className="text-sm text-red-700 font-medium">{errors.root.message}</p>
        </div>
      )}

      {/* ── Section 1: Basic info ── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <Type className="w-4 h-4 text-gray-400" />
          Basic Information
        </h2>

        <Input
          {...register("title")}
          label={t("title")}
          placeholder="e.g. iPhone 14 Pro 256GB Space Black"
          required
          error={errors.title?.message}
          hint="Be specific: include brand, model, and key specs"
        />

        {/* Description textarea */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {t("description")} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <AlignLeft className="absolute top-3 left-3 w-4 h-4 text-gray-400 pointer-events-none" />
            <textarea
              {...register("description")}
              rows={6}
              placeholder="Describe your item: condition, features, reason for selling, what's included..."
              className={cn(
                "w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm",
                "placeholder:text-muted-foreground resize-none",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:border-transparent",
                "transition-colors duration-150",
                errors.description && "border-red-500 focus-visible:ring-red-500"
              )}
            />
          </div>
          {errors.description && (
            <p className="mt-1.5 text-xs text-red-600">{errors.description.message}</p>
          )}
          <p className="mt-1.5 text-xs text-gray-400">
            {watch("description")?.length ?? 0} / 5000 characters
          </p>
        </div>
      </div>

      {/* ── Section 2: Category & Location ── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <Tag className="w-4 h-4 text-gray-400" />
          Category & Location
        </h2>

        {/* Category select */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {t("category")} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setCatOpen(!catOpen)}
              className={cn(
                "w-full flex items-center justify-between h-10 rounded-md border border-input bg-background px-3 text-sm",
                "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors",
                errors.categoryId && "border-red-500"
              )}
            >
              <span className={selectedCategory ? "text-gray-900" : "text-gray-400"}>
                {selectedCategory
                  ? getCategoryName(selectedCategory, locale)
                  : "Select a category…"}
              </span>
              <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform", catOpen && "rotate-180")} />
            </button>

            {catOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setCatOpen(false)} />
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-200 z-20 max-h-60 overflow-y-auto">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setValue("categoryId", cat.id, { shouldValidate: true, shouldDirty: true });
                        setCatOpen(false);
                      }}
                      className={cn(
                        "w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center justify-between",
                        cat.id === watchedCatId && "bg-brand-50 text-brand-700 font-medium"
                      )}
                    >
                      {getCategoryName(cat, locale)}
                      {cat.id === watchedCatId && (
                        <svg className="w-4 h-4 text-brand-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          {errors.categoryId && (
            <p className="mt-1.5 text-xs text-red-600">{errors.categoryId.message}</p>
          )}
          {/* Hidden input for form registration */}
          <input type="hidden" {...register("categoryId")} />
        </div>

        <Input
          {...register("location")}
          label={t("location")}
          placeholder="e.g. Tashkent, Mirzo-Ulugbek"
          required
          error={errors.location?.message}
          hint="City, district or neighbourhood"
          leftIcon={<MapPin className="w-4 h-4" />}
        />
      </div>

      {/* ── Section 3: Price ── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-gray-400" />
          Pricing
        </h2>

        <div className="flex gap-3 items-start">
          {/* Currency select */}
          <div className="relative w-36 shrink-0">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t("currency")}
            </label>
            <button
              type="button"
              onClick={() => setCurOpen(!curOpen)}
              className="w-full flex items-center justify-between h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
            >
              <span className="text-gray-900">{selectedCurrency?.label ?? "USD"}</span>
              <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform", curOpen && "rotate-180")} />
            </button>

            {curOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setCurOpen(false)} />
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-200 z-20">
                  {CURRENCIES.map((cur) => (
                    <button
                      key={cur.value}
                      type="button"
                      onClick={() => {
                        setValue("currency", cur.value as "USD" | "UZS" | "RUB", { shouldDirty: true }); 
                        setCurOpen(false);
                      }}
                      className={cn(
                        "w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors",
                        cur.value === watchedCurrency && "bg-brand-50 text-brand-700 font-semibold"
                      )}
                    >
                      {cur.label}
                    </button>
                  ))}
                </div>
              </>
            )}
            <input type="hidden" {...register("currency")} />
          </div>

          {/* Price input */}
          <div className="flex-1">
            <Input
              {...register("price", { valueAsNumber: true })}
              type="number"
              label={t("price")}
              placeholder="0"
              required
              min={0}
              step="any"
              error={errors.price?.message}
              hint="Enter 0 for free items"
              leftIcon={<DollarSign className="w-4 h-4" />}
            />
          </div>
        </div>
      </div>

      {/* ── Section 4: Images ── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <div>
          <h2 className="font-semibold text-gray-900 mb-1">{t("images")}</h2>
          <p className="text-sm text-gray-500">
            Add up to 8 photos. Good photos get more attention.
          </p>
        </div>

        <ImageUploader
          value={watchedImages}
          onChange={(urls) =>
            setValue("images", urls, { shouldValidate: true, shouldDirty: true })
          }
          maxImages={8}
          error={errors.images?.message as string}
        />
        <input type="hidden" {...register("images")} />
      </div>

      {/* ── Actions ── */}
      <div className="flex items-center gap-3 justify-end pb-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          {tCommon("cancel")}
        </Button>
        <Button
          type="submit"
          size="lg"
          loading={isSubmitting}
          className="px-8"
        >
          {isEdit ? "Save Changes" : t("postAd")}
        </Button>
      </div>
    </form>
  );
}
