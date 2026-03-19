// src/components/admin/AdminReportActions.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  MoreHorizontal, CheckCircle, XCircle, ExternalLink,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface AdminReportActionsProps {
  reportId: string;
  status: string;
  productId: string;
  locale: string;
}

export function AdminReportActions({
  reportId,
  status,
  productId,
  locale,
}: AdminReportActionsProps) {
  const router  = useRouter();
  const [open, setOpen]     = useState(false);
  const [loading, setLoading] = useState(false);

  const updateStatus = async (newStatus: string) => {
    setOpen(false);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast({ variant: "success", title: `Report ${newStatus.toLowerCase()}` });
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
          <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1.5 z-20">
            <Link
              href={`/${locale}/products/${productId}`}
              target="_blank"
              className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => setOpen(false)}
            >
              <ExternalLink className="w-4 h-4 text-gray-400" />
              View product
            </Link>

            <div className="border-t border-gray-100 my-1" />

            {status !== "RESOLVED" && (
              <button
                onClick={() => updateStatus("RESOLVED")}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-green-600 hover:bg-green-50 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                Mark resolved
              </button>
            )}
            {status !== "DISMISSED" && (
              <button
                onClick={() => updateStatus("DISMISSED")}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 transition-colors"
              >
                <XCircle className="w-4 h-4" />
                Dismiss
              </button>
            )}
            {status !== "PENDING" && (
              <button
                onClick={() => updateStatus("PENDING")}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-yellow-600 hover:bg-yellow-50 transition-colors"
              >
                <MoreHorizontal className="w-4 h-4" />
                Mark pending
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
