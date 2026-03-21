// src/components/products/ProductDetail.tsx
import Link from "next/link";
import {
  MapPin, Eye, Clock, Tag, Calendar,
  Pencil, ArrowLeft, Package,
} from "lucide-react";
import { ImageGallery }      from "@/components/shared/ImageGallery";
import { ContactButtons }    from "@/components/products/ContactButtons";
import { ReportButton }      from "@/components/products/ReportButton";
import { ShareButton }       from "@/components/products/ShareButton";
import { DeleteProductButton } from "@/components/products/DeleteProductButton";
import { UserAvatar }        from "@/components/shared/UserAvatar";
import { formatPrice, formatDate, formatRelativeTime } from "@/lib/utils";
import { getCategoryName }   from "@/types";
import type { Locale }       from "@/types";
import { Button }            from "@/components/ui/button";
import { cn }                from "@/lib/utils";

// This component receives fully-fetched data from the page server component
export interface ProductDetailData {
  id: string;
  title: string;
  description: string;
  price: number | string;
  currency: string;
  location: string;
  images: string[];
  status: string;
  views: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  sellerId: string;
  seller: {
    id: string;
    name: string;
    avatar?: string | null;
    phone?: string | null;
    telegram?: string | null;
    createdAt: Date | string;
    _count: { products: number };
  };
  category: {
    id: string;
    nameEn: string;
    nameUz: string;
    nameRu: string;
    slug: string;
    icon?: string | null;
  };
}

interface ProductDetailProps {
  product: ProductDetailData;
  relatedProducts: Array<{
    id: string;
    title: string;
    price: number | string;
    currency: string;
    images: string[];
    location: string;
    views: number;
    createdAt: Date | string;
    category: { nameEn: string; nameUz: string; nameRu: string; slug: string };
    seller: { name: string; avatar?: string | null };
  }>;
  locale: Locale;
  currentUserId?: string | null;
  isAuthenticated: boolean;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  ACTIVE:   { bg: "bg-green-50",  text: "text-green-700",  dot: "bg-green-500",  label: "Active"   },
  SOLD:     { bg: "bg-blue-50",   text: "text-blue-700",   dot: "bg-blue-500",   label: "Sold"     },
  INACTIVE: { bg: "bg-gray-100",  text: "text-gray-600",   dot: "bg-gray-400",   label: "Inactive" },
  PENDING:  { bg: "bg-yellow-50", text: "text-yellow-700", dot: "bg-yellow-500", label: "Pending"  },
};

export function ProductDetail({
  product,
  relatedProducts,
  locale,
  currentUserId,
  isAuthenticated,
}: ProductDetailProps) {
  const isOwner    = currentUserId === product.sellerId;
  const statusInfo = STATUS_STYLES[product.status] ?? STATUS_STYLES.ACTIVE;
  const catName = getCategoryName(
    { ...product.category, isActive: true },
    locale
  ); 
  const isSold     = product.status === "SOLD";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* ── Breadcrumb ── */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6 flex-wrap">
        <Link
          href={`/${locale}/products`}
          className="flex items-center gap-1.5 hover:text-brand-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          All listings
        </Link>
        <span>/</span>
        <Link
          href={`/${locale}/products?category=${product.category.slug}`}
          className="hover:text-brand-600 transition-colors"
        >
          {catName}
        </Link>
        <span>/</span>
        <span className="text-gray-600 line-clamp-1 max-w-[200px]">{product.title}</span>
      </nav>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

        {/* ── Left: Images + Description ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Sold overlay banner */}
          {isSold && (
            <div className="flex items-center gap-2.5 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-blue-800">
                This item has been sold. Contact the seller for similar items.
              </p>
            </div>
          )}

          {/* Gallery */}
          <div className={cn("relative", isSold && "opacity-80")}>
            <ImageGallery images={product.images} title={product.title} />
            {isSold && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-blue-600/90 text-white text-2xl font-black px-8 py-3 rounded-2xl rotate-[-8deg] shadow-2xl tracking-wider">
                  SOLD
                </div>
              </div>
            )}
          </div>

          {/* ── Description card ── */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="font-bold text-gray-900 text-lg mb-4">Description</h2>
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">
                {product.description}
              </p>
            </div>
          </div>

          {/* ── Details table ── */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="font-bold text-gray-900 text-lg mb-4">Details</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DetailRow
                icon={<Tag className="w-4 h-4" />}
                label="Category"
                value={catName}
              />
              <DetailRow
                icon={<MapPin className="w-4 h-4" />}
                label="Location"
                value={product.location}
              />
              <DetailRow
                icon={<Eye className="w-4 h-4" />}
                label="Views"
                value={`${product.views.toLocaleString()} views`}
              />
              <DetailRow
                icon={<Calendar className="w-4 h-4" />}
                label="Posted"
                value={formatDate(product.createdAt, locale)}
              />
              <DetailRow
                icon={<Clock className="w-4 h-4" />}
                label="Updated"
                value={formatRelativeTime(product.updatedAt, locale)}
              />
              <DetailRow
                icon={
                  <div className={cn("w-2 h-2 rounded-full mt-0.5 shrink-0", statusInfo.dot)} />
                }
                label="Status"
                value={
                  <span className={cn("px-2 py-0.5 rounded-full text-xs font-semibold", statusInfo.bg, statusInfo.text)}>
                    {statusInfo.label}
                  </span>
                }
              />
            </dl>
          </div>
        </div>

        {/* ── Right: Sticky sidebar ── */}
        <aside className="space-y-4 lg:sticky lg:top-24">

          {/* Price card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            {/* Title + price */}
            <h1 className="text-xl font-bold text-gray-900 leading-snug mb-3">
              {product.title}
            </h1>

            <div className="flex items-baseline gap-2 mb-1">
              {Number(product.price) === 0 ? (
                <span className="text-3xl font-black text-green-600">Free</span>
              ) : (
                <span className="text-3xl font-black text-brand-700">
                  {formatPrice(product.price, product.currency)}
                </span>
              )}
            </div>

            {/* Location & time */}
            <div className="flex items-center gap-3 text-sm text-gray-400 mb-5">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {product.location}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {formatRelativeTime(product.createdAt, locale)}
              </span>
            </div>

            {/* Contact buttons */}
            <ContactButtons
              phone={product.seller.phone}
              telegram={product.seller.telegram}
              sellerName={product.seller.name}
              productTitle={product.title}
            />
          </div>

          {/* Seller card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Seller
            </h3>
            <Link
              href={`/${locale}/profile/${product.seller.id}`}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <UserAvatar
                name={product.seller.name}
                image={product.seller.avatar}
                size="md"
              />
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 text-sm">{product.seller.name}</p>
                <p className="text-xs text-gray-400">
                  {product.seller._count.products} listing{product.seller._count.products !== 1 ? "s" : ""}
                  {" · "}Member since {formatDate(product.seller.createdAt, locale)}
                </p>
              </div>
            </Link>

            <Link href={`/${locale}/profile/${product.seller.id}`}>
              <Button variant="outline" size="sm" className="w-full mt-3 text-xs">
                View all listings
              </Button>
            </Link>
          </div>

          {/* Owner actions */}
          {isOwner && (
            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4">
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-3">
                Your listing
              </p>
              <div className="flex flex-col gap-2">
                <Link href={`/${locale}/products/${product.id}/edit`}>
                  <Button variant="outline" size="sm" className="w-full gap-2 border-amber-300 text-amber-800 hover:bg-amber-100">
                    <Pencil className="w-3.5 h-3.5" />
                    Edit listing
                  </Button>
                </Link>
                <DeleteProductButton productId={product.id} />
              </div>
            </div>
          )}

          {/* Actions row: share + report */}
          <div className="flex items-center justify-between px-1">
            <ShareButton title={product.title} />
            <ReportButton productId={product.id} isAuthenticated={isAuthenticated} />
          </div>
        </aside>
      </div>

      {/* ── Related products ── */}
      {relatedProducts.length > 0 && (
        <section className="mt-14">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-gray-900">
              More in {catName}
            </h2>
            <Link
              href={`/${locale}/products?category=${product.category.slug}`}
              className="text-sm text-brand-600 hover:underline font-medium"
            >
              See all →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {relatedProducts.map((related) => (
              <Link
                key={related.id}
                href={`/${locale}/products/${related.id}`}
                className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="aspect-square bg-gray-100 overflow-hidden">
                  {related.images[0] ? (
                    <img
                      src={related.images[0]}
                      alt={related.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-8 h-8 text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-xs font-semibold text-gray-900 line-clamp-2 leading-snug group-hover:text-brand-700 transition-colors">
                    {related.title}
                  </p>
                  <p className="text-sm font-bold text-brand-700 mt-1.5">
                    {Number(related.price) === 0
                      ? "Free"
                      : formatPrice(related.price, related.currency)}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {related.location}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// ── Helper sub-component ────────────────────────────────────
function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="text-gray-400 mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0">
        <dt className="text-xs text-gray-400 mb-0.5">{label}</dt>
        <dd className="text-sm font-medium text-gray-800">{value}</dd>
      </div>
    </div>
  );
}
