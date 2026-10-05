import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProducts } from "@/hooks/useProducts";
import { CATEGORIES, getCategoryLabel } from "@/lib/categories";
import { formatPrice } from "@/lib/format";
import {
  filterByCategory,
  matchesSearch,
  productImageUrl,
  sortProducts,
} from "@/lib/products";
import type { Category, Product } from "@/types/product";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { Search, Sparkles, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

/** Debounce delay for the search field before it writes to the URL. */
const SEARCH_DEBOUNCE_MS = 300;

/**
 * Shop page — full catalog with URL-backed search and category filters.
 *
 * Search (`q`) and category (`category`) live in the route search params so the
 * page is shareable and the back button restores the previous view.
 */
export function ShopPage() {
  const search = useSearch({ from: "/shop" });
  const navigate = useNavigate({ from: "/shop" });
  const { data: products, isLoading, isError } = useProducts();

  const activeQuery = search.q ?? "";
  const activeCategory = search.category ?? null;

  // Local draft so typing stays responsive; committed to the URL after a pause.
  const [queryDraft, setQueryDraft] = useState(activeQuery);

  // Keep the draft in sync when the URL changes from outside (nav, reset, back).
  useEffect(() => {
    setQueryDraft(activeQuery);
  }, [activeQuery]);

  useEffect(() => {
    if (queryDraft === activeQuery) return;
    const timer = window.setTimeout(() => {
      void navigate({
        search: (prev) => ({ ...prev, q: queryDraft.trim() || undefined }),
        replace: true,
      });
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [queryDraft, activeQuery, navigate]);

  const visibleProducts = useMemo(() => {
    const all = sortProducts(products ?? []);
    const byCategory = filterByCategory(all, activeCategory);
    return byCategory.filter((product) => matchesSearch(product, activeQuery));
  }, [products, activeCategory, activeQuery]);

  const hasFilters = Boolean(activeQuery) || activeCategory !== null;

  function selectCategory(category: Category | null) {
    void navigate({
      search: (prev) => ({ ...prev, category: category ?? undefined }),
      replace: true,
    });
  }

  function resetFilters() {
    setQueryDraft("");
    void navigate({ search: {}, replace: true });
  }

  return (
    <div data-ocid="shop.page" className="bg-background">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <header className="max-w-2xl">
          <p className="font-accent text-lg text-accent">The full collection</p>
          <h1 className="mt-1 font-display text-4xl font-semibold tracking-tight text-primary sm:text-5xl">
            Shop Festive Accessories
          </h1>
          <p className="mt-3 text-muted-foreground">
            Handcrafted hair flowers, bows, braided pieces, and styled looks —
            made for Navratri nights and every celebration after.
          </p>
        </header>

        <div className="mt-8 flex flex-col gap-4">
          <div className="relative max-w-md">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={queryDraft}
              onChange={(event) => setQueryDraft(event.target.value)}
              placeholder="Search by name…"
              aria-label="Search products by name"
              data-ocid="shop.search_input"
              className="h-11 rounded-full border-input bg-card pl-9 pr-9"
            />
            {queryDraft ? (
              <button
                type="button"
                aria-label="Clear search"
                data-ocid="shop.search_clear_button"
                onClick={() => setQueryDraft("")}
                className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            ) : null}
          </div>

          <fieldset
            data-ocid="shop.category_filters"
            className="-mx-4 flex min-w-0 gap-2 overflow-x-auto border-0 px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
          >
            <legend className="sr-only">Filter by category</legend>
            <CategoryChip
              label="All"
              active={activeCategory === null}
              onClick={() => selectCategory(null)}
              ocid="shop.category.all"
            />
            {CATEGORIES.map((category) => (
              <CategoryChip
                key={category.value}
                label={category.label}
                active={activeCategory === category.value}
                onClick={() => selectCategory(category.value)}
                ocid={`shop.category.${category.value}`}
              />
            ))}
          </fieldset>
        </div>

        <div className="mt-6 flex items-center justify-between gap-4">
          <p
            data-ocid="shop.result_count"
            className="text-sm text-muted-foreground"
            aria-live="polite"
          >
            {isLoading
              ? "Loading products…"
              : `${visibleProducts.length} ${
                  visibleProducts.length === 1 ? "piece" : "pieces"
                }`}
          </p>
          {hasFilters ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              data-ocid="shop.reset_button"
              onClick={resetFilters}
              className="rounded-full text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" aria-hidden="true" />
              Clear filters
            </Button>
          ) : null}
        </div>

        {isLoading ? (
          <ProductGridSkeleton />
        ) : isError ? (
          <div
            data-ocid="shop.error_state"
            className="mt-10 rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-12 text-center"
          >
            <h2 className="font-display text-xl font-semibold text-primary">
              We couldn't load the collection
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Please refresh the page to try again.
            </p>
          </div>
        ) : visibleProducts.length === 0 ? (
          <EmptyState onReset={resetFilters} />
        ) : (
          <ul
            data-ocid="shop.product_grid"
            className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3"
          >
            {visibleProducts.map((product, index) => (
              <li key={product.id}>
                <ProductCard product={product} index={index} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

interface CategoryChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
  ocid: string;
}

function CategoryChip({ label, active, onClick, ocid }: CategoryChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      data-ocid={ocid}
      className={
        active
          ? "shrink-0 rounded-full border border-accent bg-accent px-4 py-2 text-sm font-medium text-accent-foreground shadow-card-warm transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          : "shrink-0 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground/80 transition-smooth hover:border-accent/50 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      }
    >
      {label}
    </button>
  );
}

interface ProductCardProps {
  product: Product;
  index: number;
}

function ProductCard({ product, index }: ProductCardProps) {
  return (
    <Link
      to="/product/$id"
      params={{ id: product.id }}
      data-ocid={`shop.product_card.${index + 1}`}
      className="group block h-full rounded-2xl bg-card p-3 shadow-polaroid transition-smooth hover:-translate-y-1 hover:shadow-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <div className="relative overflow-hidden rounded-xl bg-muted">
        <img
          src={productImageUrl(product.imageKey)}
          alt={product.name}
          loading="lazy"
          className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {!product.available ? (
          <Badge
            data-ocid={`shop.sold_out_badge.${index + 1}`}
            className="absolute left-2 top-2 rounded-full border-transparent bg-primary text-primary-foreground shadow-card-warm"
          >
            Sold out
          </Badge>
        ) : null}
      </div>
      <div className="px-1 pb-1 pt-3">
        <p className="text-[0.7rem] font-medium uppercase tracking-wider text-accent">
          {getCategoryLabel(product.category)}
        </p>
        <h3 className="mt-1 line-clamp-2 font-display text-base font-semibold leading-snug text-primary">
          {product.name}
        </h3>
        <p className="mt-2 font-display text-sm font-semibold text-foreground">
          {formatPrice(product.priceInPaise)}
        </p>
      </div>
    </Link>
  );
}

function ProductGridSkeleton() {
  const ids = Array.from({ length: 6 }, (_, i) => `shop-skeleton-${i}`);
  return (
    <ul
      data-ocid="shop.loading_state"
      className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3"
    >
      {ids.map((id) => (
        <li key={id} className="rounded-2xl bg-card p-3 shadow-polaroid">
          <div className="aspect-square w-full animate-pulse rounded-xl bg-muted" />
          <div className="mt-3 h-3 w-1/3 animate-pulse rounded-full bg-muted" />
          <div className="mt-2 h-4 w-3/4 animate-pulse rounded-full bg-muted" />
          <div className="mt-2 h-4 w-1/4 animate-pulse rounded-full bg-muted" />
        </li>
      ))}
    </ul>
  );
}

interface EmptyStateProps {
  onReset: () => void;
}

function EmptyState({ onReset }: EmptyStateProps) {
  return (
    <div
      data-ocid="shop.empty_state"
      className="mt-10 rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center shadow-card-warm"
    >
      <span
        aria-hidden="true"
        className="mx-auto grid size-14 place-items-center rounded-full bg-secondary text-secondary-foreground"
      >
        <Sparkles className="size-6" />
      </span>
      <h2 className="mt-4 font-display text-2xl font-semibold text-primary">
        No pieces match your search
      </h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
        Try a different name or browse another category to find your festive
        favourites.
      </p>
      <Button
        type="button"
        data-ocid="shop.empty_reset_button"
        onClick={onReset}
        className="mt-6 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80"
      >
        Show all products
      </Button>
    </div>
  );
}
