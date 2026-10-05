import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useProduct, useProducts } from "@/hooks/useProducts";
import { getCategoryLabel } from "@/lib/categories";
import { formatPrice, hasPrice } from "@/lib/format";
import { productImageUrl, sortProducts } from "@/lib/products";
import type { Product } from "@/types/product";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, Mail, Sparkles } from "lucide-react";

/** Store contact address used to compose order enquiries. */
const ENQUIRY_EMAIL = "hello@logodiwati.in";

/** Build a prefilled mailto: enquiry for a specific product. */
function enquiryHref(product: Product): string {
  const subject = `Order enquiry: ${product.name}`;
  const body = [
    "Hello Logodiwati,",
    "",
    "I would like to order the following piece:",
    "",
    `Product: ${product.name}`,
    `Product ID: ${product.id}`,
    `Category: ${getCategoryLabel(product.category)}`,
    `Price: ${formatPrice(product.priceInPaise)}`,
    "",
    "Please share availability and delivery details.",
    "",
    "Thank you!",
  ].join("\n");
  return `mailto:${ENQUIRY_EMAIL}?subject=${encodeURIComponent(
    subject,
  )}&body=${encodeURIComponent(body)}`;
}

/** Small polaroid-style card used in the "You may also like" row. */
function RelatedCard({ product }: { product: Product }) {
  return (
    <Link
      to="/product/$id"
      params={{ id: product.id }}
      data-ocid="product.related_link"
      className="group block rounded-lg bg-card p-2.5 shadow-polaroid transition-smooth hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="aspect-square overflow-hidden rounded-md bg-muted">
        <img
          src={productImageUrl(product.imageKey)}
          alt={product.name}
          loading="lazy"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="px-1 pb-1 pt-3">
        <p className="line-clamp-2 font-display text-sm font-semibold text-primary">
          {product.name}
        </p>
        <p className="mt-1 text-sm font-medium text-foreground/80">
          {formatPrice(product.priceInPaise)}
        </p>
      </div>
    </Link>
  );
}

/** Layout-matched skeleton shown while the product loads. */
function DetailSkeleton() {
  return (
    <div
      data-ocid="product.loading_state"
      className="grid gap-10 lg:grid-cols-2 lg:gap-14"
    >
      <Skeleton className="aspect-square w-full rounded-lg" />
      <div className="flex flex-col gap-4">
        <Skeleton className="h-6 w-28 rounded-full" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="mt-2 h-8 w-40" />
        <Skeleton className="mt-4 h-12 w-full rounded-full" />
      </div>
    </div>
  );
}

/**
 * Product detail page: large polaroid photo, name, category, description,
 * price, and an enquire-to-order action. Sold-out products are marked and
 * cannot be ordered.
 */
export function ProductDetailPage() {
  const { id } = useParams({ from: "/product/$id" });
  const { data: product, isLoading } = useProduct(id);
  const { data: allProducts } = useProducts();

  const related = product
    ? sortProducts(
        (allProducts ?? []).filter(
          (item) =>
            item.category === product.category && item.id !== product.id,
        ),
      ).slice(0, 4)
    : [];

  return (
    <div
      data-ocid="product.page"
      className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14"
    >
      <Link
        to="/shop"
        data-ocid="product.back_link"
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to shop
      </Link>

      <div className="mt-8">
        {isLoading ? (
          <DetailSkeleton />
        ) : !product ? (
          <div
            data-ocid="product.not_found_state"
            className="mx-auto max-w-md rounded-lg border border-border bg-card px-6 py-14 text-center shadow-card-warm"
          >
            <span
              aria-hidden="true"
              className="mx-auto grid size-14 place-items-center rounded-full bg-secondary text-2xl"
            >
              🌸
            </span>
            <h1 className="mt-4 font-display text-2xl font-semibold text-primary">
              Piece not found
            </h1>
            <p className="mt-2 text-muted-foreground">
              This item may have been moved or is no longer part of the
              collection.
            </p>
            <Button
              asChild
              data-ocid="product.not_found_shop_button"
              className="mt-6 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80"
            >
              <Link to="/shop">Browse the collection</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
              {/* Polaroid photo */}
              <div className="mx-auto w-full max-w-md">
                <div className="rotate-[-1.5deg] rounded-lg bg-card p-3 pb-5 shadow-polaroid transition-smooth hover:rotate-0">
                  <div className="aspect-square overflow-hidden rounded-md bg-muted">
                    <img
                      src={productImageUrl(product.imageKey)}
                      alt={product.name}
                      className="size-full object-cover"
                    />
                  </div>
                  <p className="mt-3 text-center font-accent text-sm text-muted-foreground">
                    {getCategoryLabel(product.category)}
                  </p>
                </div>
              </div>

              {/* Details */}
              <div className="flex flex-col">
                <Badge
                  data-ocid="product.category_chip"
                  className="w-fit rounded-full border-transparent bg-accent/12 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent"
                >
                  {getCategoryLabel(product.category)}
                </Badge>

                <h1 className="mt-4 font-display text-3xl font-semibold leading-tight text-primary sm:text-4xl">
                  {product.name}
                </h1>

                <div
                  aria-hidden="true"
                  className="mt-5 h-px w-24 bg-gradient-gold"
                />

                <p className="mt-5 whitespace-pre-line text-base leading-relaxed text-foreground/85">
                  {product.description}
                </p>

                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <span
                    data-ocid="product.price"
                    className={
                      hasPrice(product.priceInPaise)
                        ? "font-display text-3xl font-semibold text-primary"
                        : "font-display text-2xl font-semibold text-muted-foreground"
                    }
                  >
                    {formatPrice(product.priceInPaise)}
                  </span>
                  {!hasPrice(product.priceInPaise) ? (
                    <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                      Set by the maker on request
                    </span>
                  ) : null}
                </div>

                {product.available ? (
                  <div className="mt-8">
                    <Button
                      asChild
                      size="lg"
                      data-ocid="product.enquire_button"
                      className="w-full rounded-full bg-secondary text-secondary-foreground shadow-gold-glow transition-smooth hover:bg-secondary/85 sm:w-auto"
                    >
                      <a href={enquiryHref(product)}>
                        <Mail className="size-5" aria-hidden="true" />
                        Enquire to order
                      </a>
                    </Button>
                    <p className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Sparkles
                        className="size-4 text-gold"
                        aria-hidden="true"
                      />
                      Opens a prefilled email — no cart, no checkout.
                    </p>
                  </div>
                ) : (
                  <div
                    data-ocid="product.sold_out_state"
                    className="mt-8 rounded-lg border border-border bg-muted/60 px-5 py-4"
                  >
                    <p className="font-display text-lg font-semibold text-primary">
                      Sold out
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      This piece has found its home. Browse the collection for
                      more festive favourites.
                    </p>
                    <Button
                      asChild
                      variant="outline"
                      data-ocid="product.sold_out_shop_button"
                      className="mt-4 rounded-full"
                    >
                      <Link to="/shop">See available pieces</Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {related.length > 0 ? (
              <section
                data-ocid="product.related_section"
                className="mt-16 border-t border-border pt-10"
              >
                <h2 className="font-display text-2xl font-semibold text-primary">
                  You may also like
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  More {getCategoryLabel(product.category).toLowerCase()} from
                  the collection.
                </p>
                <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
                  {related.map((item) => (
                    <RelatedCard key={item.id} product={item} />
                  ))}
                </div>
              </section>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
