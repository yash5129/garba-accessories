import type { Product } from "@/types/product";

/**
 * Build a `Product` fixture with sensible defaults. Tests override only the
 * fields they assert on, so a new required field does not break every test.
 */
export function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: "p1",
    name: "Marigold Gajra Hair Flower",
    category: "hairFlowers",
    description: "Fresh marigold gajra for Garba night.",
    imageKey: "collage1-hair-flower.jpg",
    priceInPaise: undefined,
    available: true,
    sortOrder: 0,
    createdAt: 1_700_000_000_000_000_000n,
    ...overrides,
  };
}

/** A small mixed catalog used across page tests. */
export const SAMPLE_PRODUCTS: Product[] = [
  makeProduct({
    id: "p1",
    name: "Marigold Gajra Hair Flower",
    category: "hairFlowers",
    priceInPaise: 129900,
    sortOrder: 0,
  }),
  makeProduct({
    id: "p2",
    name: "Pretty in Pink Hair Bow",
    category: "hairBows",
    priceInPaise: undefined,
    sortOrder: 1,
  }),
  makeProduct({
    id: "p3",
    name: "Pearl Detail Hair Clip",
    category: "hairClips",
    priceInPaise: 49900,
    available: false,
    sortOrder: 2,
  }),
];
