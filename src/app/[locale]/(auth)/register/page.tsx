// src/app/[locale]/(auth)/register/page.tsx
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth");
  return { title: t("registerTitle") };
}

export default function RegisterPage() {
  return <RegisterForm />;
}
