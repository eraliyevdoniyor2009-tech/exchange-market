// src/app/[locale]/admin/categories/page.tsx
import { prisma } from "@/lib/prisma";
import { AdminCategoryManager } from "@/components/admin/AdminCategoryManager";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { nameEn: "asc" },
    select: {
      id: true,
      nameEn: true,
      nameUz: true,
      nameRu: true,
      slug: true,
      icon: true,
      isActive: true,
      _count: { select: { products: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Categories</h2>
        <p className="text-sm text-gray-500 mt-1">{categories.length} categories</p>
      </div>
      <AdminCategoryManager initialCategories={categories} />
    </div>
  );
}
