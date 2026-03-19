// src/components/products/ReportButton.tsx
"use client";

import { useState } from "react";
import { Flag, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface ReportButtonProps {
  productId: string;
  isAuthenticated: boolean;
}

const REASONS = [
  { value: "SPAM",           label: "Spam or misleading" },
  { value: "FRAUD",          label: "Fraud or scam" },
  { value: "INAPPROPRIATE",  label: "Inappropriate content" },
  { value: "WRONG_CATEGORY", label: "Wrong category" },
  { value: "DUPLICATE",      label: "Duplicate listing" },
  { value: "OTHER",          label: "Other reason" },
] as const;

export function ReportButton({ productId, isAuthenticated }: ReportButtonProps) {
  const [open, setOpen]         = useState(false);
  const [reason, setReason]     = useState("");
  const [desc, setDesc]         = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);

  const handleSubmit = async () => {
    if (!reason) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, reason, description: desc }),
      });
      if (res.ok) {
        setSubmitted(true);
        toast({ variant: "success", title: "Report submitted. Thank you." });
        setTimeout(() => { setOpen(false); setSubmitted(false); setReason(""); setDesc(""); }, 1500);
      } else {
        const j = await res.json();
        toast({ variant: "destructive", title: j.error ?? "Failed to submit report" });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => {
          if (!isAuthenticated) {
            toast({ title: "Please log in to report a listing" });
            return;
          }
          setOpen(true);
        }}
        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors py-1"
      >
        <Flag className="w-3.5 h-3.5" />
        Report listing
      </button>

      {/* Modal */}
      {open && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setOpen(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center">
                    <AlertTriangle className="w-4.5 h-4.5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Report listing</h3>
                    <p className="text-xs text-gray-400">Help us keep the marketplace safe</p>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {submitted ? (
                <div className="py-8 text-center">
                  <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-7 h-7 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="font-semibold text-gray-900">Report submitted</p>
                  <p className="text-sm text-gray-500 mt-1">We'll review it shortly.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Reason selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Reason *</label>
                    {REASONS.map((r) => (
                      <label
                        key={r.value}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                          reason === r.value
                            ? "border-red-400 bg-red-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="reason"
                          value={r.value}
                          checked={reason === r.value}
                          onChange={() => setReason(r.value)}
                          className="accent-red-500"
                        />
                        <span className="text-sm text-gray-700">{r.label}</span>
                      </label>
                    ))}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">
                      Additional details (optional)
                    </label>
                    <textarea
                      value={desc}
                      onChange={(e) => setDesc(e.target.value)}
                      rows={3}
                      maxLength={500}
                      placeholder="Provide more context..."
                      className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
                    />
                    <p className="text-xs text-gray-400 text-right">{desc.length}/500</p>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      className="flex-1 bg-red-600 hover:bg-red-700"
                      onClick={handleSubmit}
                      loading={submitting}
                      disabled={!reason}
                    >
                      Submit Report
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
