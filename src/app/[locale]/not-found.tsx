// src/app/[locale]/not-found.tsx
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Search, ArrowLeft } from "lucide-react";

export default async function NotFound({
  params,
}: {
  params?: { locale?: string };
}) {
  const locale = params?.locale ?? "en";
  let tCommon: any;
  try {
    tCommon = await getTranslations({ locale, namespace: "common" });
  } catch {
    tCommon = (k: string) => k;
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* Big 404 */}
        <div className="relative mb-8">
          <span className="text-[120px] font-black text-gray-100 leading-none select-none">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-brand-50 rounded-2xl flex items-center justify-center border-2 border-brand-100">
              <Search className="w-10 h-10 text-brand-400" />
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Page not found
        </h1>
        <p className="text-gray-500 mb-8">
          The page you're looking for doesn't exist or has been removed.
        </p>

        <div className="flex items-center justify-center gap-3">
          <Link href={`/${locale}/products`}>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold transition-colors">
              Browse listings
            </button>
          </Link>
          <Link href={`/${locale}`}>
            <button className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-medium transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back home
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
