import { HomePage } from "@/pages/HomePage";
import { asBackend, makeMockActor, renderWithQueryClient } from "@/test/actor";
import { SAMPLE_PRODUCTS } from "@/test/fixtures";
import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The home page links into the shop and renders category shortcuts, so it is
 * rendered under a minimal router exposing `/` and `/shop`.
 */

const actor = makeMockActor(SAMPLE_PRODUCTS);

vi.mock("@caffeineai/core-infrastructure", () => ({
  useActor: () => ({ actor: asBackend(actor), isFetching: false }),
  useInternetIdentity: () => ({
    isAuthenticated: false,
    identity: undefined,
    login: vi.fn(),
    clear: vi.fn(),
    isLoggingIn: false,
  }),
}));

const {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} = await import("@tanstack/react-router");

function renderHome() {
  const rootRoute = createRootRoute();
  const homeRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: HomePage,
  });
  const shopRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/shop",
    validateSearch: (search: Record<string, unknown>) => ({
      q: typeof search.q === "string" && search.q ? search.q : undefined,
      category:
        typeof search.category === "string" ? search.category : undefined,
    }),
    component: () => <div>shop route</div>,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([homeRoute, shopRoute]),
    history: createMemoryHistory({ initialEntries: ["/"] }),
  });
  return renderWithQueryClient(<RouterProvider router={router} />);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("HomePage", () => {
  it("shows the festive hero and a shop call to action", async () => {
    renderHome();
    expect(
      await screen.findByRole("heading", {
        name: /Get Garba Ready for this Navratri/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Shop the collection/i }),
    ).toBeInTheDocument();
  });

  it("renders category shortcuts for the storefront categories", async () => {
    renderHome();
    expect(
      await screen.findByRole("heading", { name: "Shop by category" }),
    ).toBeInTheDocument();
    for (const label of [
      "Hair Flowers",
      "Hair Bows",
      "Braided Accessories",
      "Beanies & Hats",
      "Hair Clips",
      "Hairstyle Looks",
    ]) {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    }
  });

  it("renders featured products from the catalog", async () => {
    renderHome();
    expect(
      await screen.findByText("Marigold Gajra Hair Flower"),
    ).toBeInTheDocument();
    expect(screen.getByText("Pretty in Pink Hair Bow")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Featured products" }),
    ).toBeInTheDocument();
  });
});
