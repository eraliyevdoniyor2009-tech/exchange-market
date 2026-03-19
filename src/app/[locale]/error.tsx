// src/app/[locale]/error.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const router = useRouter();
  const locale = useLocale();

  useEffect(() => {
    // Log to your error tracking service here (e.g. Sentry)
    console.error("[Page Error]", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-6">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Something went wrong
        </h1>
        <p className="text-gray-500 mb-2">
          An unexpected error occurred. We've been notified and are looking into it.
        </p>

        {/* Digest for support */}
        {error.digest && (
          <p className="text-xs text-gray-400 font-mono bg-gray-100 rounded-lg px-3 py-1.5 inline-block mb-6">
            Error ID: {error.digest}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center justify-center gap-3 mt-6">
          <Button
            variant="outline"
            onClick={() => router.push(`/${locale}`)}
            className="gap-2"
          >
            <Home className="w-4 h-4" />
            Go home
          </Button>
          <Button onClick={reset} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Try again
          </Button>
        </div>
      </div>
    </div>
  );
}
