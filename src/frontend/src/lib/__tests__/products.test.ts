import type { Backend } from "@/backend";
import {
  filterByCategory,
  matchesSearch,
  productImageUrl,
  productsApi,
  sortProducts,
} from "@/lib/products";
import { makeProduct } from "@/test/fixtures";
import type { Product } from "@/types/product";
import { describe, expect, it, vi } from "vitest";

/**
 * A typed local stand-in for the generated actor, exposing only the product
 * methods `productsApi` narrows to. The raw shape mirrors the bindings, where
 * `priceInPaise` is a `bigint` and absent is `null`.
 */
interface RawProduct extends Omit<Product, "priceInPaise"> {
  priceInPaise?: bigint | null;
}

function makeRawProduct(overrides: Partial<RawProduct> = {}): RawProduct {
  return {
    id: "p1",
    name: "Marigold Gajra",
    category: "hairFlowers",
    description: "Fresh marigold gajra.",
    imageKey: "collage1-hair-flower.jpg",
    priceInPaise: 129900n,
    available: true,
    sortOrder: 0,
    createdAt: 1_700_000_000_000_000_000n,
    ...overrides,
  };
}

function makeActor(raw: RawProduct[]): Backend {
  return {
    listProducts: vi.fn(async () => raw),
    getProduct: vi.fn(
      async (id: string) => raw.find((p) => p.id === id) ?? null,
    ),
    setProductPrice: vi.fn(async () => undefined),
    setProductAvailability: vi.fn(async () => undefined),
    updateProductDetails: vi.fn(async () => undefined),
    setProductImage: vi.fn(async () => undefined),
    seedProducts: vi.fn(async () => undefined),
  } as unknown as Backend;
}

describe("productsApi adapter", () => {
  it("normalizes a bigint price to a plain number on read", async () => {
    const api = productsApi(makeActor([makeRawProduct()]));
    const [product] = await api.listProducts();
    expect(product.priceInPaise).toBe(129900);
    expect(typeof product.priceInPaise).toBe("number");
  });

  it("maps an absent price to undefined", async () => {
    const api = productsApi(
      makeActor([makeRawProduct({ priceInPaise: null })]),
    );
    const [product] = await api.listProducts();
    expect(product.priceInPaise).toBeUndefined();
  });

  it("converts a number price back to bigint on write", async () => {
    const actor = makeActor([]);
    const api = productsApi(actor);
    await api.setProductPrice("p1", 129900);
    expect(actor.setProductPrice).toHaveBeenCalledWith("p1", 129900n);
  });

  it("sends null when clearing a price", async () => {
    const actor = makeActor([]);
    const api = productsApi(actor);
    await api.setProductPrice("p1", null);
    expect(actor.setProductPrice).toHaveBeenCalledWith("p1", null);
  });

  it("returns null from getProduct when the row is absent", async () => {
    const api = productsApi(makeActor([]));
    await expect(api.getProduct("missing")).resolves.toBeNull();
  });
});

describe("productImageUrl", () => {
  it("builds a public asset path for a bare key", () => {
    expect(productImageUrl("collage1-hair-flower.jpg")).toBe(
      "/assets/products/collage1-hair-flower.jpg",
    );
  });

  it("passes through absolute and root-relative keys", () => {
    expect(productImageUrl("/assets/x.jpg")).toBe("/assets/x.jpg");
    expect(productImageUrl("https://cdn.example/x.jpg")).toBe(
      "https://cdn.example/x.jpg",
    );
  });

  it("falls back to a placeholder for an empty key", () => {
    expect(productImageUrl("")).toBe("/assets/images/placeholder.svg");
  });
});

describe("sortProducts", () => {
  it("orders by sortOrder then newest first", () => {
    const a = makeProduct({ id: "a", sortOrder: 1, createdAt: 1n });
    const b = makeProduct({ id: "b", sortOrder: 0, createdAt: 2n });
    const c = makeProduct({ id: "c", sortOrder: 1, createdAt: 5n });
    expect(sortProducts([a, b, c]).map((p) => p.id)).toEqual(["b", "c", "a"]);
  });
});

describe("matchesSearch", () => {
  it("matches name case-insensitively and ignores surrounding space", () => {
    const product = makeProduct({ name: "Marigold Gajra" });
    expect(matchesSearch(product, "  marigold ")).toBe(true);
    expect(matchesSearch(product, "bow")).toBe(false);
  });

  it("matches the description too", () => {
    const product = makeProduct({ description: "pearl-studded clip" });
    expect(matchesSearch(product, "pearl")).toBe(true);
  });

  it("returns everything for an empty query", () => {
    expect(matchesSearch(makeProduct(), "   ")).toBe(true);
  });
});

describe("filterByCategory", () => {
  it("returns all products when no category is selected", () => {
    const products = [makeProduct({ id: "a" }), makeProduct({ id: "b" })];
    expect(filterByCategory(products, null)).toHaveLength(2);
  });

  it("narrows to the selected category", () => {
    const products = [
      makeProduct({ id: "a", category: "hairFlowers" }),
      makeProduct({ id: "b", category: "hairBows" }),
    ];
    expect(filterByCategory(products, "hairBows").map((p) => p.id)).toEqual([
      "b",
    ]);
  });
});
