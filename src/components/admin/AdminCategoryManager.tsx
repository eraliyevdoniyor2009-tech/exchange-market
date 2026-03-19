// src/components/admin/AdminCategoryManager.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Tag, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

interface Category {
  id: string;
  nameEn: string;
  nameUz: string;
  nameRu: string;
  slug: string;
  icon?: string | null;
  isActive: boolean;
  _count: { products: number };
}

export function AdminCategoryManager({ initialCategories }: { initialCategories: Category[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ nameEn: "", nameUz: "", nameRu: "", slug: "", icon: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleCreate = async () => {
    setErrors({});
    if (!form.nameEn || !form.nameUz || !form.nameRu || !form.slug) {
      setErrors({ general: "All name fields and slug are required." });
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) {
        setErrors({ general: json.error ?? "Failed to create" });
        return;
      }
      toast({ variant: "success", title: "Category created!" });
      setForm({ nameEn: "", nameUz: "", nameRu: "", slug: "", icon: "" });
      setShowForm(false);
      router.refresh();
    } finally {
      setCreating(false);
    }
  };

  const handleAutoSlug = (value: string) => {
    const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    setForm((f) => ({ ...f, nameEn: value, slug }));
  };

  return (
    <div className="space-y-4">
      {/* Add button */}
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setShowForm(!showForm)} className="gap-1.5">
          <Plus className="w-4 h-4" />
          Add Category
        </Button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-brand-200 p-5 space-y-4">
          <h3 className="font-semibold text-gray-900">New Category</h3>
          {errors.general && (
            <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{errors.general}</p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="English name *" value={form.nameEn} onChange={(e) => handleAutoSlug(e.target.value)} placeholder="Electronics" />
            <Input label="Slug *" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} placeholder="electronics" hint="Auto-generated, lowercase, no spaces" />
            <Input label="Uzbek name *" value={form.nameUz} onChange={(e) => setForm((f) => ({ ...f, nameUz: e.target.value }))} placeholder="Elektronika" />
            <Input label="Russian name *" value={form.nameRu} onChange={(e) => setForm((f) => ({ ...f, nameRu: e.target.value }))} placeholder="Электроника" />
            <Input label="Icon (lucide name)" value={form.icon} onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))} placeholder="Laptop" hint="Optional: lucide-react icon name" />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button size="sm" loading={creating} onClick={handleCreate}>Create</Button>
          </div>
        </div>
      )}

      {/* Category list */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">Category</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">Slug</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">Uz / Ru</th>
              <th className="text-center px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">Products</th>
              <th className="text-center px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {initialCategories.map((cat) => (
              <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center">
                      <Tag className="w-4 h-4 text-brand-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-900">{cat.nameEn}</p>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <code className="text-xs bg-gray-100 px-2 py-0.5 rounded">{cat.slug}</code>
                </td>
                <td className="px-5 py-4">
                  <p className="text-xs text-gray-600">{cat.nameUz}</p>
                  <p className="text-xs text-gray-400">{cat.nameRu}</p>
                </td>
                <td className="px-5 py-4 text-center">
                  <span className="text-sm font-semibold text-gray-700">{cat._count.products}</span>
                </td>
                <td className="px-5 py-4 text-center">
                  {cat.isActive
                    ? <ToggleRight className="w-6 h-6 text-green-500 inline" />
                    : <ToggleLeft className="w-6 h-6 text-gray-300 inline" />
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
