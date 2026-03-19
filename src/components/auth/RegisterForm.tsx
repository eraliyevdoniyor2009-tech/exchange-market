// src/components/auth/RegisterForm.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import {
  Eye, EyeOff, Mail, Lock, User, Phone, MessageCircle, ShoppingBag,
} from "lucide-react";
import { registerSchema, type RegisterInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

export function RegisterForm() {
  const t = useTranslations("auth");
  const tErr = useTranslations("errors");
  const router = useRouter();
  const locale = useLocale();
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    trigger,
    getValues,
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
  });

  // Step 1 → Step 2 validation
  const handleNextStep = async () => {
    const valid = await trigger(["name", "email", "password"]);
    if (valid) setStep(2);
  };

  const onSubmit = async (data: RegisterInput) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          setError("email", { message: t("emailTaken") });
          setStep(1);
          return;
        }
        setError("root", { message: json.error || tErr("serverError") });
        return;
      }

      // Auto-login after registration
      const signInResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signInResult?.ok) {
        toast({ variant: "success", title: t("registerSuccess") });
        router.push(`/${locale}/profile`);
        router.refresh();
      } else {
        // Registration worked but auto-login failed — redirect to login
        router.push(`/${locale}/login`);
      }
    } catch {
      setError("root", { message: tErr("serverError") });
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Top accent */}
        <div className="h-1.5 bg-gradient-to-r from-brand-400 via-brand-600 to-brand-400" />

        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-50 rounded-2xl mb-4">
              <ShoppingBag className="w-7 h-7 text-brand-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{t("registerTitle")}</h1>
            <p className="text-gray-500 text-sm mt-1">{t("registerSubtitle")}</p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-7">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={`
                    flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all duration-300
                    ${step >= s
                      ? "bg-brand-600 text-white"
                      : "bg-gray-100 text-gray-400"}
                  `}
                >
                  {step > s ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : s}
                </div>
                {s < 2 && (
                  <div className={`flex-1 h-0.5 mx-2 rounded transition-all ${step > s ? "bg-brand-600" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>

          {/* Error banner */}
          {errors.root && (
            <div className="mb-5 p-3.5 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-700 font-medium">{errors.root.message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* ── Step 1: Account info ── */}
            <div className={step === 1 ? "space-y-5" : "hidden"}>
              <Input
                {...register("name")}
                type="text"
                label={t("name")}
                placeholder="John Doe"
                autoComplete="name"
                required
                error={errors.name?.message}
                leftIcon={<User className="w-4 h-4" />}
              />

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
                autoComplete="new-password"
                required
                error={errors.password?.message}
                hint="Min 8 chars, uppercase, lowercase & number"
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

              <Button
                type="button"
                size="lg"
                className="w-full"
                onClick={handleNextStep}
              >
                Continue
              </Button>
            </div>

            {/* ── Step 2: Contact info ── */}
            <div className={step === 2 ? "space-y-5" : "hidden"}>
              <div className="p-3.5 rounded-lg bg-blue-50 border border-blue-100">
                <p className="text-sm text-blue-700">
                  Contact info helps buyers reach you. You can add this later.
                </p>
              </div>

              <Input
                {...register("phone")}
                type="tel"
                label={t("phone")}
                placeholder="+998 90 123 45 67"
                autoComplete="tel"
                error={errors.phone?.message}
                hint={t("phoneOptional")}
                leftIcon={<Phone className="w-4 h-4" />}
              />

              <Input
                {...register("telegram")}
                type="text"
                label={t("telegram")}
                placeholder="@username"
                autoComplete="off"
                error={errors.telegram?.message}
                hint={t("telegramOptional")}
                leftIcon={<MessageCircle className="w-4 h-4" />}
              />

              <div className="flex gap-3 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  onClick={() => setStep(1)}
                  disabled={isSubmitting}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  size="lg"
                  className="flex-1"
                  loading={isSubmitting}
                >
                  {t("signUp")}
                </Button>
              </div>
            </div>
          </form>

          {/* Login link */}
          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-600">
              {t("hasAccount")}{" "}
              <Link
                href={`/${locale}/login`}
                className="font-semibold text-brand-600 hover:text-brand-700 hover:underline"
              >
                {t("signIn")}
              </Link>
            </p>
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-gray-400 mt-6">{t("agreeToTerms")}</p>
    </div>
  );
}
