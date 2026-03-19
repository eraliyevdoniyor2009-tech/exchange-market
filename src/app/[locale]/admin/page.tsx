// src/app/[locale]/admin/page.tsx
import { prisma } from "@/lib/prisma";
import { Users, Package, Tag, Flag, TrendingUp } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const [
    totalUsers,
    totalProducts,
    totalCategories,
    pendingReports,
    recentUsers,
    recentProducts,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.category.count(),
    prisma.report.count({ where: { status: "PENDING" } }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    }),
    prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        status: true,
        price: true,
        currency: true,
        createdAt: true,
        seller: { select: { name: true } },
      },
    }),
  ]);

  const stats = [
    { label: "Total Users",      value: totalUsers,      icon: Users,   color: "bg-blue-500",   light: "bg-blue-50 text-blue-700"   },
    { label: "Total Products",   value: totalProducts,   icon: Package, color: "bg-green-500",  light: "bg-green-50 text-green-700"  },
    { label: "Categories",       value: totalCategories, icon: Tag,     color: "bg-purple-500", light: "bg-purple-50 text-purple-700" },
    { label: "Pending Reports",  value: pendingReports,  icon: Flag,    color: "bg-red-500",    light: "bg-red-50 text-red-700"     },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-500 text-sm mt-1">Overview of your marketplace</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, light }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center shadow-sm`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-gray-400" />
              Recent Users
            </h3>
          </div>
          <div className="divide-y divide-gray-100">
            {recentUsers.map((user) => (
              <div key={user.id} className="px-5 py-3.5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <div className="text-right">
                  {user.role === "ADMIN" && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                      Admin
                    </span>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(user.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Products */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-gray-400" />
              Recent Products
            </h3>
          </div>
          <div className="divide-y divide-gray-100">
            {recentProducts.map((product) => (
              <div key={product.id} className="px-5 py-3.5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 line-clamp-1">{product.title}</p>
                  <p className="text-xs text-gray-500">by {product.seller.name}</p>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className="text-sm font-bold text-brand-700">
                    {Number(product.price).toLocaleString()} {product.currency}
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    product.status === "ACTIVE"   ? "bg-green-100 text-green-700"  :
                    product.status === "SOLD"     ? "bg-blue-100 text-blue-700"    :
                    product.status === "PENDING"  ? "bg-yellow-100 text-yellow-700" :
                    "bg-gray-100 text-gray-600"
                  }`}>
                    {product.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
