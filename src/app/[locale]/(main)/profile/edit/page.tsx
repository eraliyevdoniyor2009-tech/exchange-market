// src/app/[locale]/(main)/profile/edit/page.tsx
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileEditForm } from "@/components/profile/ProfileEditForm";

export default async function ProfileEditPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/login`);

  const t = await getTranslations("profile");

  const user = await prisma.user.findUnique({
    where: { id: (session.user as any).id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      telegram: true,
      avatar: true,
    },
  });

  if (!user) redirect(`/${locale}/login`);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t("editProfile")}</h1>
        <p className="text-gray-500 text-sm mt-1">Update your public profile and contact information.</p>
      </div>
      <ProfileEditForm user={user} />
    </div>
  );
}
