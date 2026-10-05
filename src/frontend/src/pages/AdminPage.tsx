import { ImageUploader } from "@/components/admin/ImageUploader";
import { PriceEditor } from "@/components/admin/PriceEditor";
import { ProductEditDialog } from "@/components/admin/ProductEditDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  useIsAdmin,
  useProducts,
  useSeedProducts,
  useSetProductAvailability,
  useSetProductImage,
  useSetProductPrice,
  useUpdateProductDetails,
} from "@/hooks/useProducts";
import { getCategoryLabel } from "@/lib/categories";
import { formatPrice, hasPrice } from "@/lib/format";
import { productImageUrl, sortProducts } from "@/lib/products";
import type { Product, ProductDetails, ProductId } from "@/types/product";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  PackageOpen,
  Pencil,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";

type Feedback = { tone: "success" | "error"; message: string };

/**
 * Owner-only price setup area.
 *
 * Gated behind Internet Identity sign-in and the backend admin check. Lists
 * every product with an editable rupee price, an availability toggle, detail
 * editing, and photo replacement through platform object storage.
 */
export function AdminPage() {
  const { isAuthenticated, login, isLoggingIn } = useInternetIdentity();
  const { data: isAdmin, isLoading: isAdminLoading } = useIsAdmin();

  if (!isAuthenticated) {
    return <SignInGate onSignIn={() => login()} isLoggingIn={isLoggingIn} />;
  }

  if (isAdminLoading) {
    return <AdminLoading />;
  }

  if (!isAdmin) {
    return <NotOwner />;
  }

  return <AdminTools />;
}

/** Sign-in prompt shown to signed-out visitors. */
function SignInGate({
  onSignIn,
  isLoggingIn,
}: {
  onSignIn: () => void;
  isLoggingIn: boolean;
}) {
  return (
    <div
      data-ocid="admin.signin_gate"
      className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center sm:px-6"
    >
      <span
        aria-hidden="true"
        className="grid size-14 place-items-center rounded-full bg-gradient-primary text-primary-foreground shadow-gold-glow"
      >
        <ShieldCheck className="size-7" />
      </span>
      <h1 className="mt-5 font-display text-3xl font-semibold text-primary">
        Owner sign-in
      </h1>
      <p className="mt-3 text-muted-foreground">
        The price setup area is private. Sign in with Internet Identity to
        manage products, prices, and photos.
      </p>
      <Button
        type="button"
        onClick={onSignIn}
        disabled={isLoggingIn}
        data-ocid="admin.signin_button"
        className="mt-6 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80"
      >
        {isLoggingIn ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : null}
        {isLoggingIn ? "Signing in…" : "Sign in with Internet Identity"}
      </Button>
    </div>
  );
}

/** Shown to a signed-in visitor who is not the store owner. */
function NotOwner() {
  return (
    <div
      data-ocid="admin.access_denied"
      className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center sm:px-6"
    >
      <span
        aria-hidden="true"
        className="grid size-14 place-items-center rounded-full bg-muted text-muted-foreground"
      >
        <AlertCircle className="size-7" />
      </span>
      <h1 className="mt-5 font-display text-3xl font-semibold text-primary">
        Owner access only
      </h1>
      <p className="mt-3 text-muted-foreground">
        This account is not the store owner, so the price setup tools are not
        available. Sign in with the owner's Internet Identity to continue.
      </p>
    </div>
  );
}

/** Loading skeleton matching the admin list layout. */
function AdminLoading() {
  const rows = Array.from({ length: 4 }, (_, i) => `admin-skeleton-${i}`);
  return (
    <div
      data-ocid="admin.loading_state"
      className="mx-auto max-w-5xl px-4 py-12 sm:px-6"
    >
      <Skeleton className="h-9 w-56" />
      <Skeleton className="mt-4 h-20 w-full rounded-xl" />
      <div className="mt-6 flex flex-col gap-3">
        {rows.map((id) => (
          <Skeleton key={id} className="h-28 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

/** The owner's product management surface. */
function AdminTools() {
  const { data: products, isLoading, isError, error } = useProducts();
  const seedProducts = useSeedProducts();
  const setPrice = useSetProductPrice();
  const setAvailability = useSetProductAvailability();
  const setImage = useSetProductImage();
  const updateDetails = useUpdateProductDetails();

  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [editing, setEditing] = useState<Product | null>(null);
  const [busyId, setBusyId] = useState<ProductId | null>(null);

  const sorted = useMemo(() => sortProducts(products ?? []), [products]);
  const needsPriceCount = useMemo(
    () => sorted.filter((product) => !hasPrice(product.priceInPaise)).length,
    [sorted],
  );

  function report(tone: Feedback["tone"], message: string) {
    setFeedback({ tone, message });
  }

  function handleSavePrice(id: ProductId, priceInPaise: number | null) {
    setBusyId(id);
    setPrice.mutate(
      { id, priceInPaise },
      {
        onSuccess: () =>
          report(
            "success",
            priceInPaise == null
              ? "Price cleared."
              : `Price saved: ${formatPrice(priceInPaise)}.`,
          ),
        onError: (mutationError) =>
          report("error", mutationError.message || "Could not save the price."),
        onSettled: () => setBusyId(null),
      },
    );
  }

  function handleToggleAvailability(product: Product) {
    setBusyId(product.id);
    setAvailability.mutate(
      { id: product.id, available: !product.available },
      {
        onSuccess: () =>
          report(
            "success",
            `${product.name} marked ${product.available ? "sold out" : "available"}.`,
          ),
        onError: (mutationError) =>
          report(
            "error",
            mutationError.message || "Could not update availability.",
          ),
        onSettled: () => setBusyId(null),
      },
    );
  }

  function handleSaveDetails(details: ProductDetails) {
    if (!editing) return;
    const id = editing.id;
    updateDetails.mutate(
      { id, details },
      {
        onSuccess: () => {
          report("success", "Product details updated.");
          setEditing(null);
        },
        onError: (mutationError) =>
          report(
            "error",
            mutationError.message || "Could not update the product.",
          ),
      },
    );
  }

  function handleImageUploaded(product: Product, imageKey: string) {
    setBusyId(product.id);
    setImage.mutate(
      { id: product.id, imageKey },
      {
        onSuccess: () =>
          report("success", `Photo updated for ${product.name}.`),
        onError: (mutationError) =>
          report(
            "error",
            mutationError.message || "Photo uploaded but could not be saved.",
          ),
        onSettled: () => setBusyId(null),
      },
    );
  }

  function handleSeed() {
    seedProducts.mutate(undefined, {
      onSuccess: () => report("success", "Starter products created."),
      onError: (mutationError) =>
        report(
          "error",
          mutationError.message || "Could not create starter products.",
        ),
    });
  }

  return (
    <div
      data-ocid="admin.page"
      className="mx-auto max-w-5xl px-4 py-10 sm:px-6"
    >
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-accent text-lg text-accent">Owner's atelier</p>
          <h1 className="font-display text-3xl font-semibold text-primary sm:text-4xl">
            Price setup
          </h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Set a price for each piece in rupees, mark what is sold out, and
            refresh photos. Prices appear on the storefront right away.
          </p>
        </div>
      </header>

      <SummaryBar
        total={sorted.length}
        needsPrice={needsPriceCount}
        isLoading={isLoading}
      />

      {feedback ? (
        <FeedbackBanner
          feedback={feedback}
          onDismiss={() => setFeedback(null)}
        />
      ) : null}

      {isError ? (
        <div
          data-ocid="admin.error_state"
          className="mt-6 rounded-xl border border-destructive/30 bg-destructive/5 p-5 text-sm text-destructive"
        >
          <p className="font-medium">Could not load products.</p>
          <p className="mt-1 text-destructive/80">
            {error instanceof Error ? error.message : "Please try again."}
          </p>
        </div>
      ) : null}

      {isLoading ? (
        <AdminLoading />
      ) : sorted.length === 0 ? (
        <EmptyCatalog onSeed={handleSeed} isSeeding={seedProducts.isPending} />
      ) : (
        <ul data-ocid="admin.product_list" className="mt-6 flex flex-col gap-3">
          {sorted.map((product, index) => (
            <ProductRow
              key={product.id}
              product={product}
              index={index}
              isBusy={busyId === product.id}
              onSavePrice={handleSavePrice}
              onToggleAvailability={handleToggleAvailability}
              onEdit={() => setEditing(product)}
              onImageUploaded={handleImageUploaded}
              onImageError={(message) => report("error", message)}
            />
          ))}
        </ul>
      )}

      <ProductEditDialog
        product={editing}
        open={editing != null}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
        onSave={handleSaveDetails}
        isSaving={updateDetails.isPending}
      />
    </div>
  );
}

/** Summary bar: totals and how many products still need a price. */
function SummaryBar({
  total,
  needsPrice,
  isLoading,
}: {
  total: number;
  needsPrice: number;
  isLoading: boolean;
}) {
  return (
    <div
      data-ocid="admin.summary_bar"
      className="mt-6 grid grid-cols-2 gap-3 rounded-xl border border-border bg-card p-4 shadow-card-warm sm:grid-cols-3"
    >
      <div className="flex flex-col">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Products
        </span>
        <span className="mt-1 font-display text-2xl font-semibold text-primary tabular-nums">
          {isLoading ? "—" : total}
        </span>
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Need a price
        </span>
        <span
          data-ocid="admin.needs_price_count"
          className={`mt-1 font-display text-2xl font-semibold tabular-nums ${
            needsPrice > 0 ? "text-secondary-foreground" : "text-accent"
          }`}
        >
          {isLoading ? "—" : needsPrice}
        </span>
      </div>
      <div className="col-span-2 flex items-center gap-2 sm:col-span-1">
        {needsPrice > 0 ? (
          <Badge
            variant="secondary"
            className="rounded-full bg-secondary text-secondary-foreground"
          >
            <Sparkles className="size-3" aria-hidden="true" />
            {needsPrice} awaiting a price
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="rounded-full border-accent/40 text-accent"
          >
            <CheckCircle2 className="size-3" aria-hidden="true" />
            All priced
          </Badge>
        )}
      </div>
    </div>
  );
}

/** Success/error banner for the most recent action. */
function FeedbackBanner({
  feedback,
  onDismiss,
}: {
  feedback: Feedback;
  onDismiss: () => void;
}) {
  const isSuccess = feedback.tone === "success";
  return (
    <output
      data-ocid={isSuccess ? "admin.success_state" : "admin.error_state"}
      className={`mt-4 flex items-start gap-3 rounded-xl border p-4 text-sm ${
        isSuccess
          ? "border-accent/30 bg-accent/5 text-accent"
          : "border-destructive/30 bg-destructive/5 text-destructive"
      }`}
    >
      {isSuccess ? (
        <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      ) : (
        <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      )}
      <p className="flex-1">{feedback.message}</p>
      <button
        type="button"
        onClick={onDismiss}
        data-ocid="admin.dismiss_feedback_button"
        className="rounded-full px-2 text-xs font-medium underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Dismiss
      </button>
    </output>
  );
}

/** Empty catalog state with the seed action. */
function EmptyCatalog({
  onSeed,
  isSeeding,
}: {
  onSeed: () => void;
  isSeeding: boolean;
}) {
  return (
    <div
      data-ocid="admin.empty_state"
      className="mt-6 flex flex-col items-center rounded-xl border border-dashed border-border bg-card px-6 py-14 text-center shadow-card-warm"
    >
      <span
        aria-hidden="true"
        className="grid size-14 place-items-center rounded-full bg-muted text-muted-foreground"
      >
        <PackageOpen className="size-7" />
      </span>
      <h2 className="mt-4 font-display text-xl font-semibold text-primary">
        No products yet
      </h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Create the starter catalog of 25 pieces, then set a price for each one.
      </p>
      <Button
        type="button"
        onClick={onSeed}
        disabled={isSeeding}
        data-ocid="admin.seed_button"
        className="mt-5 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80"
      >
        {isSeeding ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <Sparkles className="size-4" aria-hidden="true" />
        )}
        {isSeeding ? "Creating…" : "Seed starter products"}
      </Button>
    </div>
  );
}

interface ProductRowProps {
  product: Product;
  index: number;
  isBusy: boolean;
  onSavePrice: (id: ProductId, priceInPaise: number | null) => void;
  onToggleAvailability: (product: Product) => void;
  onEdit: () => void;
  onImageUploaded: (product: Product, imageKey: string) => void;
  onImageError: (message: string) => void;
}

/** One product row: thumbnail, details, price, availability, photo, edit. */
function ProductRow({
  product,
  index,
  isBusy,
  onSavePrice,
  onToggleAvailability,
  onEdit,
  onImageUploaded,
  onImageError,
}: ProductRowProps) {
  const priced = hasPrice(product.priceInPaise);
  const marker = index + 1;

  return (
    <li
      data-ocid={`admin.product_row.${marker}`}
      className="rounded-xl border border-border bg-card p-4 shadow-card-warm"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="relative size-20 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
          <img
            src={productImageUrl(product.imageKey)}
            alt={product.name}
            loading="lazy"
            className="size-full object-cover"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="min-w-0 font-display text-lg font-semibold text-primary">
              {product.name}
            </h2>
            {!priced ? (
              <Badge
                variant="secondary"
                data-ocid={`admin.needs_price_flag.${marker}`}
                className="rounded-full bg-secondary text-secondary-foreground"
              >
                Needs price
              </Badge>
            ) : null}
            {!product.available ? (
              <Badge
                variant="outline"
                className="rounded-full border-primary/30 text-primary"
              >
                Sold out
              </Badge>
            ) : null}
          </div>
          <p className="mt-1 text-xs font-medium uppercase tracking-wider text-accent">
            {getCategoryLabel(product.category)}
          </p>
          {product.description ? (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {product.description}
            </p>
          ) : null}

          <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-3">
            <PriceEditor
              key={product.id}
              productId={product.id}
              priceInPaise={product.priceInPaise}
              onSave={(priceInPaise) => onSavePrice(product.id, priceInPaise)}
              isSaving={isBusy}
            />

            <div className="flex items-center gap-2">
              <Switch
                id={`admin-availability-${product.id}`}
                checked={product.available}
                disabled={isBusy}
                onCheckedChange={() => onToggleAvailability(product)}
                data-ocid={`admin.availability_toggle.${marker}`}
                aria-label={`Mark ${product.name} as ${
                  product.available ? "sold out" : "available"
                }`}
              />
              <label
                htmlFor={`admin-availability-${product.id}`}
                className="text-sm text-muted-foreground"
              >
                {product.available ? "Available" : "Sold out"}
              </label>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onEdit}
              disabled={isBusy}
              data-ocid={`admin.edit_button.${marker}`}
              className="rounded-full"
            >
              <Pencil className="size-4" aria-hidden="true" />
              Edit details
            </Button>

            <ImageUploader
              productName={product.name}
              onUploaded={(imageKey) => onImageUploaded(product, imageKey)}
              onError={onImageError}
              disabled={isBusy}
            />
          </div>
        </div>
      </div>
    </li>
  );
}
