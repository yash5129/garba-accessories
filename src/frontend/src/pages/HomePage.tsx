import { CategoryChips } from "@/components/CategoryChips";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/useProducts";
import { sortProducts } from "@/lib/products";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Heart, Sparkles } from "lucide-react";

const FEATURED_COUNT = 8;

/** Alternating polaroid tilt so the grid feels hand-pinned. */
const TILTS = [
  "left",
  "right",
  "none",
  "right",
  "left",
  "none",
  "right",
  "left",
] as const;

/**
 * Home page: festive hero, category shortcut strip, featured polaroid grid,
 * and a short handmade story band.
 */
export function HomePage() {
  const { data: products, isLoading, isError } = useProducts();
  const featured = sortProducts(products ?? []).slice(0, FEATURED_COUNT);

  return (
    <div data-ocid="home.page">
      {/* Hero */}
      <section
        data-ocid="home.hero"
        className="relative overflow-hidden border-b border-border bg-gradient-warm"
      >
        <div
          aria-hidden="true"
          className="paper-texture pointer-events-none absolute inset-0 opacity-60"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-gradient-gold opacity-20 blur-2xl"
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
          <div className="animate-fade-up">
            <p className="font-accent text-xl text-accent">
              Handmade with love
            </p>
            <h1 className="mt-3 font-display text-4xl font-semibold leading-[1.05] tracking-tight text-primary sm:text-5xl lg:text-6xl">
              Get Garba Ready for this{" "}
              <span className="text-gradient-gold">Navratri</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Handcrafted hair flowers, bows, and braided accessories for the
              festive season — made in small batches with marigold, pearls, and
              a whole lot of love.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button
                asChild
                size="lg"
                data-ocid="home.shop_button"
                className="rounded-full bg-secondary text-secondary-foreground shadow-gold-glow hover:bg-secondary/80"
              >
                <Link to="/shop" search={{}}>
                  Shop the collection
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                data-ocid="home.categories_button"
                className="rounded-full border-primary/30 bg-card/60 text-primary hover:bg-card"
              >
                <Link to="/shop" search={{}}>
                  Browse categories
                </Link>
              </Button>
            </div>
          </div>

          <div
            aria-hidden="true"
            className="relative hidden justify-center lg:flex"
          >
            <div className="relative w-full max-w-sm rotate-2 rounded-sm bg-card p-4 shadow-polaroid">
              <div className="aspect-[4/5] overflow-hidden rounded-sm bg-muted">
                <img
                  src="/assets/products/collage1-traditional-look.jpg"
                  alt=""
                  className="size-full object-cover"
                />
              </div>
              <p className="mt-3 text-center font-accent text-lg text-primary">
                Festive looks, styled by hand
              </p>
            </div>
            <div className="absolute -bottom-6 -left-4 w-40 -rotate-6 rounded-sm bg-card p-3 shadow-polaroid">
              <div className="aspect-square overflow-hidden rounded-sm bg-muted">
                <img
                  src="/assets/products/collage2-hair-flower.jpg"
                  alt=""
                  className="size-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category shortcuts */}
      <section
        data-ocid="home.categories"
        className="mx-auto max-w-6xl px-4 py-12 sm:px-6"
      >
        <div className="mb-6 text-center">
          <p className="font-accent text-lg text-accent">
            Find your festive look
          </p>
          <h2 className="mt-1 font-display text-2xl font-semibold text-primary sm:text-3xl">
            Shop by category
          </h2>
        </div>
        <CategoryChips />
      </section>

      {/* Featured products */}
      <section
        data-ocid="home.featured"
        className="mx-auto max-w-6xl px-4 py-8 sm:px-6"
      >
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-accent text-lg text-accent">Freshly pinned</p>
            <h2 className="mt-1 font-display text-2xl font-semibold text-primary sm:text-3xl">
              Featured products
            </h2>
          </div>
          <Link
            to="/shop"
            search={{}}
            data-ocid="home.view_all_link"
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            View all
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        {isLoading ? (
          <div
            data-ocid="home.featured.loading_state"
            className="grid grid-cols-2 gap-5 sm:gap-6 lg:grid-cols-3"
          >
            {Array.from({ length: 6 }, (_, i) => `featured-skeleton-${i}`).map(
              (id) => (
                <div
                  key={id}
                  className="rounded-sm bg-card p-3 pb-4 shadow-polaroid"
                >
                  <div className="aspect-square animate-pulse rounded-sm bg-muted" />
                  <div className="mx-auto mt-3 h-3 w-2/3 animate-pulse rounded-full bg-muted" />
                  <div className="mx-auto mt-2 h-3 w-1/3 animate-pulse rounded-full bg-muted" />
                </div>
              ),
            )}
          </div>
        ) : isError ? (
          <div
            data-ocid="home.featured.error_state"
            className="rounded-lg border border-border bg-card px-6 py-12 text-center shadow-card-warm"
          >
            <p className="font-display text-lg font-semibold text-primary">
              We couldn&apos;t load the collection
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Please refresh the page to try again.
            </p>
          </div>
        ) : featured.length === 0 ? (
          <div
            data-ocid="home.featured.empty_state"
            className="rounded-lg border border-dashed border-border bg-card px-6 py-14 text-center shadow-card-warm"
          >
            <Sparkles className="mx-auto size-8 text-gold" aria-hidden="true" />
            <p className="mt-3 font-display text-lg font-semibold text-primary">
              New pieces are on the way
            </p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              Our festive collection is being handmade right now. Check back
              soon for fresh hair flowers, bows, and braided accessories.
            </p>
            <Button
              asChild
              className="mt-6 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80"
            >
              <Link to="/shop" search={{}}>
                Visit the shop
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-5 sm:gap-6 lg:grid-cols-3">
            {featured.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                index={index}
                tilt={TILTS[index % TILTS.length]}
              />
            ))}
          </div>
        )}
      </section>

      {/* Handmade story band */}
      <section
        data-ocid="home.story"
        className="mx-auto mt-12 max-w-6xl px-4 sm:px-6"
      >
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card px-6 py-12 shadow-card-warm sm:px-12">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-16 -top-16 size-48 rounded-full bg-accent/10 blur-2xl"
          />
          <div className="relative mx-auto max-w-2xl text-center">
            <span className="inline-flex size-12 items-center justify-center rounded-full bg-gradient-gold text-gold-foreground shadow-gold-glow">
              <Heart className="size-6" aria-hidden="true" />
            </span>
            <h2 className="mt-5 font-display text-2xl font-semibold text-primary sm:text-3xl">
              Handmade with love
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Every piece is crocheted, braided, and finished by hand in small
              batches — so no two are exactly alike. From marigold gajras to
              pearl-studded clips, each accessory is made to bring a little
              festive sparkle to your Garba night.
            </p>
            <p className="mt-5 font-accent text-xl text-accent">
              Made in Ahmedabad, worn with joy.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
