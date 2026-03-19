// src/app/[locale]/admin/products/page.tsx
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { AdminProductActions } from "@/components/admin/AdminProductActions";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

export default async function AdminProductsPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      price: true,
      currency: true,
      status: true,
      images: true,
      createdAt: true,
      seller: { select: { id: true, name: true, email: true } },
      category: { select: { nameEn: true } },
    },
  });

  const statusColor: Record<string, string> = {
    ACTIVE:   "bg-green-100 text-green-700",
    INACTIVE: "bg-gray-100 text-gray-600",
    SOLD:     "bg-blue-100 text-blue-700",
    PENDING:  "bg-yellow-100 text-yellow-700",
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Products</h2>
        <p className="text-sm text-gray-500 mt-1">{products.length} total listings</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Seller</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Posted</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                        {product.images[0] ? (
                          <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gray-200" />
                        )}
                      </div>
                      <div className="max-w-[200px]">
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">{product.title}</p>
                        <Link
                          href={`/${locale}/products/${product.id}`}
                          className="text-xs text-brand-600 hover:underline flex items-center gap-1 mt-0.5"
                          target="_blank"
                        >
                          View <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm text-gray-900">{product.seller.name}</p>
                    <p className="text-xs text-gray-500">{product.seller.email}</p>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">{product.category.nameEn}</td>
                  <td className="px-5 py-4 text-sm font-semibold text-gray-900">
                    {Number(product.price).toLocaleString()} {product.currency}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[product.status] ?? ""}`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-500">{formatDate(product.createdAt)}</td>
                  <td className="px-5 py-4 text-right">
                    <AdminProductActions productId={product.id} status={product.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
