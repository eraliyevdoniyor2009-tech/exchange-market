// src/app/[locale]/(main)/products/[id]/edit/page.tsx
import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/products/ProductForm";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  return { title: "Edit Listing" };
}

export default async function EditProductPage({
  params: { locale, id },
}: {
  params: { locale: string; id: string };
}) {
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/login`);

  const userId = (session.user as any).id as string;
  const role   = (session.user as any).role as string;

  const product = await prisma.product.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      price: true,
      currency: true,
      location: true,
      images: true,
      categoryId: true,
      sellerId: true,
    },
  });

  if (!product) notFound();

  // Only owner or admin can edit
  if (product.sellerId !== userId && role !== "ADMIN") {
    redirect(`/${locale}/products/${id}`);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Listing</h1>
        <p className="text-gray-500 mt-1">Update your listing details.</p>
      </div>
      <ProductForm
        productId={product.id}
        defaultValues={{
          title: product.title,
          description: product.description,
          price: Number(product.price),
          currency: product.currency as "USD" | "UZS" | "RUB", 
          location: product.location,
          images: product.images,
          categoryId: product.categoryId,
        }}
      />
    </div>
  );
}
