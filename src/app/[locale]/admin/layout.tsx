// src/app/[locale]/admin/layout.tsx
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const session = await auth();

  if (!session?.user) {
    redirect(`/${locale}/login`);
  }

  const role = (session.user as any).role;
  if (role !== "ADMIN") {
    redirect(`/${locale}`);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar locale={locale} />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Admin top bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900">Admin Panel</h1>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
            {session.user.name}
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
