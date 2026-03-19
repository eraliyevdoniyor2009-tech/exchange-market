// src/components/admin/AdminProductActions.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, CheckCircle, XCircle, Trash2, EyeOff } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface AdminProductActionsProps {
  productId: string;
  status: string;
}

export function AdminProductActions({ productId, status }: AdminProductActionsProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const updateStatus = async (newStatus: string) => {
    setOpen(false);
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast({ variant: "success", title: `Product marked as ${newStatus.toLowerCase()}` });
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Permanently delete this product?")) return;
    setOpen(false);
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${productId}`, { method: "DELETE" });
      if (res.ok) {
        toast({ variant: "success", title: "Product deleted" });
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        disabled={loading}
        className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors disabled:opacity-50"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-gray-200 py-1.5 z-20">
            {status !== "ACTIVE" && (
              <button onClick={() => updateStatus("ACTIVE")} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-green-600 hover:bg-green-50">
                <CheckCircle className="w-4 h-4" /> Activate
              </button>
            )}
            {status !== "INACTIVE" && (
              <button onClick={() => updateStatus("INACTIVE")} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-orange-600 hover:bg-orange-50">
                <EyeOff className="w-4 h-4" /> Deactivate
              </button>
            )}
            {status !== "SOLD" && (
              <button onClick={() => updateStatus("SOLD")} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50">
                <XCircle className="w-4 h-4" /> Mark sold
              </button>
            )}
            <div className="border-t border-gray-100 mt-1 pt-1">
              <button onClick={handleDelete} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
