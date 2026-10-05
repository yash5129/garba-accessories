import { getCategoryLabel } from "@/lib/categories";
import { formatPrice, hasPrice } from "@/lib/format";
import { productImageUrl } from "@/lib/products";
import type { Product } from "@/types/product";
import { Link } from "@tanstack/react-router";

interface ProductCardProps {
  product: Product;
  /** Optional deterministic index used for the `data-ocid` marker. */
  index?: number;
  /** Slight polaroid tilt, alternating by position. */
  tilt?: "left" | "right" | "none";
}

const TILT_CLASS: Record<NonNullable<ProductCardProps["tilt"]>, string> = {
  left: "-rotate-1",
  right: "rotate-1",
  none: "rotate-0",
};

/**
 * Polaroid-style product card: white frame, pushpin, photo, name, category,
 * and price. Links to the product detail view. Shared by the home and shop
 * grids, so it stays presentational and takes only a `Product`.
 */
export function ProductCard({
  product,
  index,
  tilt = "none",
}: ProductCardProps) {
  const priced = hasPrice(product.priceInPaise);
  const marker = index != null ? `.${index + 1}` : "";

  return (
    <Link
      to="/product/$id"
      params={{ id: product.id }}
      data-ocid={`product.card${marker}`}
      className="group block focus-visible:outline-none"
    >
      <article
        className={`relative flex h-full flex-col rounded-sm bg-card p-3 pb-4 shadow-polaroid transition-transform duration-300 ease-out group-hover:-translate-y-1 group-hover:rotate-0 group-focus-visible:ring-2 group-focus-visible:ring-ring ${TILT_CLASS[tilt]}`}
      >
        <span
          aria-hidden="true"
          className="absolute left-1/2 top-1.5 z-10 size-3 -translate-x-1/2 rounded-full bg-gradient-gold shadow-gold-glow ring-2 ring-card"
        />
        <div className="relative aspect-square overflow-hidden rounded-sm bg-muted">
          <img
            src={productImageUrl(product.imageKey)}
            alt={product.name}
            loading="lazy"
            className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
          {!product.available ? (
            <span className="absolute left-2 top-2 rounded-full bg-primary/90 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wider text-primary-foreground">
              Sold out
            </span>
          ) : null}
        </div>

        <div className="mt-3 flex flex-1 flex-col items-center text-center">
          <p className="text-[0.7rem] font-medium uppercase tracking-wider text-accent">
            {getCategoryLabel(product.category)}
          </p>
          <h3 className="mt-1 line-clamp-2 font-display text-base font-semibold leading-snug text-primary">
            {product.name}
          </h3>
          <p
            className={`mt-2 font-display text-sm font-semibold ${
              priced ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            {formatPrice(product.priceInPaise)}
          </p>
        </div>
      </article>
    </Link>
  );
}
