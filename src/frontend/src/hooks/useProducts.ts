import { createActor } from "@/backend";
import { productsApi } from "@/lib/products";
import type { ProductDetails, ProductId } from "@/types/product";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/** Query key for the full product list. */
export const PRODUCTS_KEY = ["products"] as const;

/** Query key for a single product detail. */
export const productKey = (id: ProductId) => ["product", id] as const;

/**
 * All products for the storefront, ordered by sortOrder then createdAt.
 */
export function useProducts() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: PRODUCTS_KEY,
    queryFn: async () => {
      if (!actor) return [];
      return productsApi(actor).listProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

/**
 * A single product by id. Disabled until an id is available.
 */
export function useProduct(id: ProductId | undefined) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: productKey(id ?? ""),
    queryFn: async () => {
      if (!actor || !id) return null;
      return productsApi(actor).getProduct(id);
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

/** Admin: set or clear a product's price in paise. */
export function useSetProductPrice() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      priceInPaise,
    }: {
      id: ProductId;
      priceInPaise: number | null;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return productsApi(actor).setProductPrice(id, priceInPaise);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
    },
  });
}

/** Admin: mark a product available or sold out. */
export function useSetProductAvailability() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      available,
    }: {
      id: ProductId;
      available: boolean;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return productsApi(actor).setProductAvailability(id, available);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
    },
  });
}

/** Admin: update a product's name, category, and description. */
export function useUpdateProductDetails() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      details,
    }: {
      id: ProductId;
      details: ProductDetails;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return productsApi(actor).updateProductDetails(id, details);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
    },
  });
}

/** Admin: replace a product's object-storage image key. */
export function useSetProductImage() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      imageKey,
    }: {
      id: ProductId;
      imageKey: string;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return productsApi(actor).setProductImage(id, imageKey);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
    },
  });
}

/** Admin: ensure the initial product rows exist. Idempotent. */
export function useSeedProducts() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Backend is not ready");
      return productsApi(actor).seedProducts();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
    },
  });
}

/** Whether the signed-in caller is the store owner. */
export function useIsAdmin() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}
