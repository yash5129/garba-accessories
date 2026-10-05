import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice, hasPrice } from "@/lib/format";
import type { ProductId } from "@/types/product";
import { Check, Loader2 } from "lucide-react";
import { type FormEvent, useState } from "react";

interface PriceEditorProps {
  productId: ProductId;
  /** Current price in paise, or undefined when unset. */
  priceInPaise?: number | bigint;
  /** Persist the new price in paise, or null to clear it. */
  onSave: (priceInPaise: number | null) => void;
  isSaving: boolean;
}

/** Convert a paise amount to a plain rupee string for the input. */
function paiseToRupeeInput(priceInPaise?: number | bigint): string {
  if (priceInPaise == null) return "";
  // Normalize a bigint from the generated bindings before dividing.
  const paise =
    typeof priceInPaise === "bigint" ? Number(priceInPaise) : priceInPaise;
  const rupees = paise / 100;
  return Number.isInteger(rupees) ? String(rupees) : rupees.toFixed(2);
}

/**
 * Parse a rupee input into integer paise.
 * Returns `undefined` for an empty field (clear the price) and `null` for an
 * invalid entry so the caller can show a validation message.
 */
function parseRupeesToPaise(value: string): number | null | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const rupees = Number(trimmed);
  if (!Number.isFinite(rupees) || rupees < 0) return null;
  return Math.round(rupees * 100);
}

/**
 * Inline price field for a single product. The owner types rupees; the value is
 * converted to the backend's integer paise on save.
 */
export function PriceEditor({
  productId,
  priceInPaise,
  onSave,
  isSaving,
}: PriceEditorProps) {
  const [value, setValue] = useState(() => paiseToRupeeInput(priceInPaise));
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = parseRupeesToPaise(value);
    if (parsed === null) {
      setError("Enter a valid amount in rupees.");
      return;
    }
    setError(null);
    onSave(parsed ?? null);
  }

  const priced = hasPrice(priceInPaise);

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-1"
      data-ocid={`admin.price_form.${productId}`}
    >
      <div className="flex items-center gap-1.5">
        <div className="relative">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
          >
            ₹
          </span>
          <Input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              if (error) setError(null);
            }}
            placeholder="0"
            aria-label={`Price in rupees for product ${productId}`}
            aria-invalid={error != null}
            data-ocid={`admin.price_input.${productId}`}
            className="h-9 w-28 pl-6 text-right tabular-nums"
          />
        </div>
        <Button
          type="submit"
          size="sm"
          disabled={isSaving}
          data-ocid={`admin.save_price_button.${productId}`}
          className="rounded-full"
        >
          {isSaving ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Check className="size-4" aria-hidden="true" />
          )}
          Save
        </Button>
      </div>
      {error ? (
        <p
          role="alert"
          data-ocid={`admin.price_error.${productId}`}
          className="text-xs text-destructive"
        >
          {error}
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          {priced ? `Saved: ${formatPrice(priceInPaise)}` : "No price set yet"}
        </p>
      )}
    </form>
  );
}
