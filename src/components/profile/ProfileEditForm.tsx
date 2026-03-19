// src/components/profile/ProfileEditForm.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { User, Phone, MessageCircle, Camera } from "lucide-react";
import { updateProfileSchema, type UpdateProfileInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { toast } from "@/hooks/use-toast";

interface ProfileEditFormProps {
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    telegram?: string | null;
    avatar?: string | null;
  };
}

export function ProfileEditForm({ user }: ProfileEditFormProps) {
  const t = useTranslations("profile");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const locale = useLocale();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatar ?? null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    setError,
    setValue,
    watch,
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user.name,
      phone: user.phone ?? "",
      telegram: user.telegram ?? "",
      avatar: user.avatar ?? "",
    },
  });

  const onSubmit = async (data: UpdateProfileInput) => {
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        setError("root", { message: json.error ?? "Failed to update profile" });
        return;
      }

      toast({ variant: "success", title: "Profile updated successfully!" });
      router.push(`/${locale}/profile`);
      router.refresh();
    } catch {
      setError("root", { message: "Something went wrong. Please try again." });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Error banner */}
      {errors.root && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-red-700">{errors.root.message}</p>
        </div>
      )}

      {/* Avatar section */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">{t("avatarUpload")}</h2>
        <div className="flex items-center gap-5">
          <div className="relative">
            <UserAvatar
              name={watch("name") || user.name}
              image={avatarPreview}
              size="xl"
            />
            <label
              htmlFor="avatar-url"
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-brand-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-brand-700 transition-colors shadow-sm"
            >
              <Camera className="w-3.5 h-3.5 text-white" />
            </label>
          </div>
          <div className="flex-1">
            <Input
              id="avatar-url"
              {...register("avatar")}
              type="url"
              placeholder="https://example.com/avatar.jpg"
              error={errors.avatar?.message}
              hint="Paste a public image URL or upload via Cloudinary (Phase 2)"
              onChange={(e) => {
                setValue("avatar", e.target.value, { shouldDirty: true });
                setAvatarPreview(e.target.value || null);
              }}
            />
          </div>
        </div>
      </div>

      {/* Basic info */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
        <h2 className="font-semibold text-gray-900">Basic Information</h2>

        <Input
          {...register("name")}
          type="text"
          label={t("phone").replace("Phone", "Full Name")}
          placeholder="Your full name"
          required
          error={errors.name?.message}
          leftIcon={<User className="w-4 h-4" />}
        />

        {/* Email (read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Email address
          </label>
          <input
            value={user.email}
            disabled
            className="flex h-10 w-full rounded-md border border-input bg-gray-50 px-3 py-2 text-sm text-gray-500 cursor-not-allowed"
          />
          <p className="mt-1.5 text-xs text-gray-400">Email cannot be changed</p>
        </div>
      </div>

      {/* Contact info */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
        <div>
          <h2 className="font-semibold text-gray-900">{t("contactInfo")}</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Buyers will use these to contact you about your listings.
          </p>
        </div>

        <Input
          {...register("phone")}
          type="tel"
          label={t("phone")}
          placeholder="+998 90 123 45 67"
          error={errors.phone?.message}
          hint="Include country code (e.g. +998)"
          leftIcon={<Phone className="w-4 h-4" />}
        />

        <Input
          {...register("telegram")}
          type="text"
          label={t("telegram")}
          placeholder="@username"
          error={errors.telegram?.message}
          hint="Your Telegram username without @"
          leftIcon={<MessageCircle className="w-4 h-4" />}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/${locale}/profile`)}
          disabled={isSubmitting}
        >
          {tCommon("cancel")}
        </Button>
        <Button
          type="submit"
          loading={isSubmitting}
          disabled={!isDirty}
        >
          {tCommon("save")} Changes
        </Button>
      </div>
    </form>
  );
}
