import type { Backend } from "@/backend";
import type { Product } from "@/types/product";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type RenderResult, render } from "@testing-library/react";
import type { ReactElement } from "react";
import { vi } from "vitest";

/**
 * A typed local stand-in for the generated backend actor. Only the product
 * methods the app calls are implemented; every one is a `vi.fn` so tests can
 * assert on the calls the UI makes.
 */
export interface MockActor {
  listProducts: ReturnType<typeof vi.fn>;
  getProduct: ReturnType<typeof vi.fn>;
  setProductPrice: ReturnType<typeof vi.fn>;
  setProductAvailability: ReturnType<typeof vi.fn>;
  updateProductDetails: ReturnType<typeof vi.fn>;
  setProductImage: ReturnType<typeof vi.fn>;
  seedProducts: ReturnType<typeof vi.fn>;
  isCallerAdmin: ReturnType<typeof vi.fn>;
}

/** Build a mock actor backed by an in-memory product list. */
export function makeMockActor(products: Product[] = []): MockActor {
  const store = new Map(products.map((product) => [product.id, product]));
  return {
    listProducts: vi.fn(async () => [...store.values()]),
    getProduct: vi.fn(async (id: string) => store.get(id) ?? null),
    setProductPrice: vi.fn(async (id: string, priceInPaise: bigint | null) => {
      const product = store.get(id);
      if (product) {
        store.set(id, {
          ...product,
          priceInPaise: priceInPaise == null ? undefined : Number(priceInPaise),
        });
      }
    }),
    setProductAvailability: vi.fn(async (id: string, available: boolean) => {
      const product = store.get(id);
      if (product) store.set(id, { ...product, available });
    }),
    updateProductDetails: vi.fn(async () => undefined),
    setProductImage: vi.fn(async () => undefined),
    seedProducts: vi.fn(async () => undefined),
    isCallerAdmin: vi.fn(async () => true),
  };
}

/** Cast the mock to the app's `Backend` type at the seam. */
export function asBackend(actor: MockActor): Backend {
  return actor as unknown as Backend;
}

/**
 * Render a tree inside a fresh React Query client. The app's own providers
 * (Internet Identity, router) are supplied by the caller or mocked at module
 * level, so this only owns the query cache.
 */
export function renderWithQueryClient(ui: ReactElement): RenderResult {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}
