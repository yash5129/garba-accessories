import { CATEGORIES } from "@/lib/categories";
import type { Category } from "@/types/product";
import { Link } from "@tanstack/react-router";

interface CategoryChipsProps {
  /** Currently selected category, when used as a filter control. */
  active?: Category | null;
  /** Optional heading rendered above the strip. */
  heading?: string;
  /** `link` navigates to the shop; `button` calls `onSelect`. */
  mode?: "link" | "button";
  onSelect?: (category: Category) => void;
}

/**
 * Horizontal, scrollable strip of category pills. In `link` mode each chip
 * navigates to the shop filtered by that category; in `button` mode it reports
 * the selection to the caller. Shared by the home hero and the shop filters.
 */
export function CategoryChips({
  active = null,
  heading,
  mode = "link",
  onSelect,
}: CategoryChipsProps) {
  return (
    <div data-ocid="category.section">
      {heading ? (
        <h2 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {heading}
        </h2>
      ) : null}
      <ul className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0">
        {CATEGORIES.map((category) => {
          const isActive = active === category.value;
          const chipClass = `inline-flex shrink-0 snap-start items-center rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            isActive
              ? "border-accent bg-accent text-accent-foreground"
              : "border-border bg-card text-foreground/80 hover:border-accent/50 hover:bg-accent/10 hover:text-accent"
          }`;

          return (
            <li key={category.value}>
              {mode === "link" ? (
                <Link
                  to="/shop"
                  search={{ category: category.value }}
                  data-ocid={`category.chip.${category.value}`}
                  className={chipClass}
                >
                  {category.label}
                </Link>
              ) : (
                <button
                  type="button"
                  data-ocid={`category.chip.${category.value}`}
                  aria-pressed={isActive}
                  onClick={() => onSelect?.(category.value)}
                  className={chipClass}
                >
                  {category.label}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
