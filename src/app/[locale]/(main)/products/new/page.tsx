// src/app/[locale]/(main)/products/new/page.tsx
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { ProductForm } from "@/components/products/ProductForm";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Post a Listing" };
}

export default async function NewProductPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/login?callbackUrl=/${locale}/products/new`);

  const t = await getTranslations("product");

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t("postAd")}</h1>
        <p className="text-gray-500 mt-1">
          Fill in the details below to publish your listing.
        </p>
      </div>
      <ProductForm />
    </div>
  );
}
