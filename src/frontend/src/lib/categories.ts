import type { Category } from "@/types/product";

export interface CategoryMeta {
  /** Backend variant tag. */
  value: Category;
  /** Human label used in chips, filters, and footer links. */
  label: string;
  /** Short blurb for category landing copy. */
  blurb: string;
}

/**
 * Canonical category order and labels. The chip strip, shop filters, and footer
 * category links all render from this single source so they never drift.
 */
export const CATEGORIES: CategoryMeta[] = [
  {
    value: "hairFlowers",
    label: "Hair Flowers",
    blurb: "Fresh floral gajras and blossoms for every braid.",
  },
  {
    value: "hairBows",
    label: "Hair Bows",
    blurb: "Crochet and ribbon bows in festive colours.",
  },
  {
    value: "braidedAccessories",
    label: "Braided Accessories",
    blurb: "Parandis, tassels, and braid jewellery.",
  },
  {
    value: "beaniesAndHats",
    label: "Beanies & Hats",
    blurb: "Hand-knit caps and festive headwear.",
  },
  {
    value: "hairClips",
    label: "Hair Clips",
    blurb: "Pearl, mirror, and enamel clips.",
  },
  {
    value: "hairstyleLooks",
    label: "Hairstyle Looks",
    blurb: "Complete styled looks for Garba night.",
  },
];

const CATEGORY_BY_VALUE = new Map<Category, CategoryMeta>(
  CATEGORIES.map((category) => [category.value, category]),
);

/** Resolve a backend category tag to its display metadata. */
export function getCategoryMeta(value: Category): CategoryMeta | undefined {
  return CATEGORY_BY_VALUE.get(value);
}

/** Human label for a category tag, falling back to the raw tag. */
export function getCategoryLabel(value: Category): string {
  return CATEGORY_BY_VALUE.get(value)?.label ?? value;
}

/** Type guard for values arriving from the URL search params. */
export function isCategory(value: unknown): value is Category {
  return typeof value === "string" && CATEGORY_BY_VALUE.has(value as Category);
}
