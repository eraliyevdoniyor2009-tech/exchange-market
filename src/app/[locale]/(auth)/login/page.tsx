// src/app/[locale]/(auth)/login/page.tsx
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth");
  return { title: t("loginTitle") };
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string; error?: string };
}) {
  return (
    <LoginForm
      callbackUrl={searchParams.callbackUrl}
      error={searchParams.error}
    />
  );
}
