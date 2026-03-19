// src/app/[locale]/admin/reports/page.tsx
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { AdminReportActions } from "@/components/admin/AdminReportActions";
import Link from "next/link";

export default async function AdminReportsPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      reason: true,
      description: true,
      status: true,
      createdAt: true,
      reporter: { select: { id: true, name: true, email: true } },
      product: {
        select: {
          id: true,
          title: true,
          seller: { select: { name: true } },
        },
      },
    },
  });

  const statusColor: Record<string, string> = {
    PENDING:   "bg-yellow-100 text-yellow-700",
    REVIEWED:  "bg-blue-100 text-blue-700",
    RESOLVED:  "bg-green-100 text-green-700",
    DISMISSED: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Reports</h2>
        <p className="text-sm text-gray-500 mt-1">
          {reports.filter((r) => r.status === "PENDING").length} pending ·{" "}
          {reports.length} total
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {reports.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <p className="text-lg font-medium">No reports yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Reported by
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <Link
                        href={`/${locale}/products/${report.product.id}`}
                        target="_blank"
                        className="text-sm font-medium text-brand-600 hover:underline line-clamp-1 max-w-[180px] block"
                      >
                        {report.product.title}
                      </Link>
                      <p className="text-xs text-gray-400">
                        by {report.product.seller.name}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-gray-900">{report.reporter.name}</p>
                      <p className="text-xs text-gray-400">{report.reporter.email}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-semibold bg-red-50 text-red-700 px-2 py-0.5 rounded-full">
                        {report.reason.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {report.description ? (
                        <p className="text-xs text-gray-600 max-w-[200px] line-clamp-2">
                          {report.description}
                        </p>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {formatDate(report.createdAt)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          statusColor[report.status] ?? ""
                        }`}
                      >
                        {report.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <AdminReportActions
                        reportId={report.id}
                        status={report.status}
                        productId={report.product.id}
                        locale={locale}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
