// src/app/[locale]/page.tsx
// Root locale page — delegates rendering to (main)/page.tsx via Next.js route groups.
// The (main) group's page.tsx handles the actual homepage render.
// This file intentionally re-exports to keep routing clean.
export { default } from "@/app/[locale]/(main)/page";
