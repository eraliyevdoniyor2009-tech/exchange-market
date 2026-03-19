// src/hooks/use-auth.ts
"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import type { SessionUser } from "@/types";

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const locale = useLocale();

  const user = session?.user as SessionUser | undefined;
  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";
  const isAdmin = user?.role === "ADMIN";

  const logout = async () => {
    await signOut({ redirect: false });
    router.push(`/${locale}/login`);
    router.refresh();
  };

  const requireAuth = () => {
    if (!isAuthenticated && !isLoading) {
      router.push(`/${locale}/login`);
      return false;
    }
    return true;
  };

  return {
    user,
    session,
    status,
    isLoading,
    isAuthenticated,
    isAdmin,
    logout,
    requireAuth,
  };
}
