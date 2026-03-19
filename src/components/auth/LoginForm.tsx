// src/components/auth/LoginForm.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, ShoppingBag } from "lucide-react";
import { loginSchema, type LoginInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

interface LoginFormProps {
  callbackUrl?: string;
  error?: string;
}

export function LoginForm({ callbackUrl, error }: LoginFormProps) {
  const t = useTranslations("auth");
  const tErr = useTranslations("errors");
  const router = useRouter();
  const locale = useLocale();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError("root", { message: t("invalidCredentials") });
        return;
      }

      toast({ variant: "success", title: t("loginSuccess") });

      // Redirect to callback or profile
      router.push(callbackUrl || `/${locale}/profile`);
      router.refresh();
    } catch {
      setError("root", { message: tErr("serverError") });
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Top accent */}
        <div className="h-1.5 bg-gradient-to-r from-brand-400 via-brand-600 to-brand-400" />

        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-50 rounded-2xl mb-4">
              <ShoppingBag className="w-7 h-7 text-brand-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{t("loginTitle")}</h1>
            <p className="text-gray-500 text-sm mt-1">{t("loginSubtitle")}</p>
          </div>

          {/* Auth error banner */}
          {(error || errors.root) && (
            <div className="mb-6 p-3.5 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2.5">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-700 font-medium">
                {errors.root?.message || t("invalidCredentials")}
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <Input
              {...register("email")}
              type="email"
              label={t("email")}
              placeholder="you@example.com"
              autoComplete="email"
              required
              error={errors.email?.message}
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <Input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              label={t("password")}
              placeholder="••••••••"
              autoComplete="current-password"
              required
              error={errors.password?.message}
              leftIcon={<Lock className="w-4 h-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            <div className="flex items-center justify-end">
              <Link
                href={`/${locale}/forgot-password`}
                className="text-sm text-brand-600 hover:text-brand-700 hover:underline"
              >
                {t("forgotPassword")}
              </Link>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              loading={isSubmitting}
            >
              {t("signIn")}
            </Button>
          </form>

          {/* Divider */}
          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-600">
              {t("noAccount")}{" "}
              <Link
                href={`/${locale}/register`}
                className="font-semibold text-brand-600 hover:text-brand-700 hover:underline"
              >
                {t("signUp")}
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Language hints */}
      <p className="text-center text-xs text-gray-400 mt-6">
        {t("agreeToTerms")}
      </p>
    </div>
  );
}
