// src/components/products/DeleteProductButton.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Trash2, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface DeleteProductButtonProps {
  productId: string;
}

export function DeleteProductButton({ productId }: DeleteProductButtonProps) {
  const [open, setOpen]         = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router                  = useRouter();
  const locale                  = useLocale();

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/products/${productId}`, { method: "DELETE" });
      if (res.ok) {
        toast({ variant: "success", title: "Listing deleted" });
        router.push(`/${locale}/profile`);
        router.refresh();
      } else {
        const j = await res.json();
        toast({ variant: "destructive", title: j.error ?? "Delete failed" });
      }
    } finally {
      setDeleting(false);
      setOpen(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors py-1"
      >
        <Trash2 className="w-3.5 h-3.5" />
        Delete listing
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setOpen(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-1">Delete listing?</h3>
              <p className="text-sm text-gray-500 mb-6">
                This action cannot be undone. The listing will be permanently removed.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setOpen(false)}
                  disabled={deleting}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  onClick={handleDelete}
                  loading={deleting}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
