// src/components/admin/AdminUserActions.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Ban, CheckCircle, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface AdminUserActionsProps {
  userId: string;
  isActive: boolean;
  role: string;
}

export function AdminUserActions({ userId, isActive, role }: AdminUserActionsProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleToggleBan = async () => {
    setOpen(false);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/ban`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      if (res.ok) {
        toast({ variant: "success", title: isActive ? "User banned" : "User unbanned" });
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to permanently delete this user?")) return;
    setOpen(false);
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${userId}`, { method: "DELETE" });
      if (res.ok) {
        toast({ variant: "success", title: "User deleted" });
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
            <button
              onClick={handleToggleBan}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "text-orange-600 hover:bg-orange-50"
                  : "text-green-600 hover:bg-green-50"
              }`}
            >
              {isActive
                ? <><Ban className="w-4 h-4" /> Ban user</>
                : <><CheckCircle className="w-4 h-4" /> Unban user</>
              }
            </button>
            {role !== "ADMIN" && (
              <button
                onClick={handleDelete}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete user
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
