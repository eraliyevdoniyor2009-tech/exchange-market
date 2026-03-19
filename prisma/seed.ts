// prisma/seed.ts
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ─── Admin User ───────────────────────────────────────────
  const hashedPassword = await bcrypt.hash("Admin@123456", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@marketplace.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@marketplace.com",
      password: hashedPassword,
      phone: "+998901234567",
      telegram: "admin_marketplace",
      role: Role.ADMIN,
    },
  });
  console.log("✅ Admin user created:", admin.email);

  // ─── Categories ───────────────────────────────────────────
  const categories = [
    {
      nameEn: "Electronics",
      nameUz: "Elektronika",
      nameRu: "Электроника",
      slug: "electronics",
      icon: "Laptop",
    },
    {
      nameEn: "Vehicles",
      nameUz: "Transport",
      nameRu: "Транспорт",
      slug: "vehicles",
      icon: "Car",
    },
    {
      nameEn: "Real Estate",
      nameUz: "Ko'chmas mulk",
      nameRu: "Недвижимость",
      slug: "real-estate",
      icon: "Home",
    },
    {
      nameEn: "Clothing & Fashion",
      nameUz: "Kiyim-kechak",
      nameRu: "Одежда и мода",
      slug: "clothing-fashion",
      icon: "Shirt",
    },
    {
      nameEn: "Furniture",
      nameUz: "Mebel",
      nameRu: "Мебель",
      slug: "furniture",
      icon: "Sofa",
    },
    {
      nameEn: "Sports & Outdoors",
      nameUz: "Sport va turizm",
      nameRu: "Спорт и туризм",
      slug: "sports-outdoors",
      icon: "Dumbbell",
    },
    {
      nameEn: "Books & Education",
      nameUz: "Kitoblar va ta'lim",
      nameRu: "Книги и образование",
      slug: "books-education",
      icon: "BookOpen",
    },
    {
      nameEn: "Garden & Plants",
      nameUz: "Bog' va o'simliklar",
      nameRu: "Сад и растения",
      slug: "garden-plants",
      icon: "Leaf",
    },
    {
      nameEn: "Children & Toys",
      nameUz: "Bolalar va o'yinchoqlar",
      nameRu: "Дети и игрушки",
      slug: "children-toys",
      icon: "Baby",
    },
    {
      nameEn: "Services",
      nameUz: "Xizmatlar",
      nameRu: "Услуги",
      slug: "services",
      icon: "Wrench",
    },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }
  console.log(`✅ ${categories.length} categories seeded`);

  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
