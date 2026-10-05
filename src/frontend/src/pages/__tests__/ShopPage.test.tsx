import { ShopPage } from "@/pages/ShopPage";
import { asBackend, makeMockActor, renderWithQueryClient } from "@/test/actor";
import { SAMPLE_PRODUCTS } from "@/test/fixtures";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The shop page reads its search params from the router. These tests render it
 * under a minimal router that exposes the same `/shop` search contract as
 * `App.tsx`, so URL-backed search and category filtering are exercised for real.
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

// A tiny router that mirrors the app's `/shop` route and its search validation.
const {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} = await import("@tanstack/react-router");

function renderShop(initialEntry = "/shop") {
  const rootRoute = createRootRoute();
  const shopRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/shop",
    validateSearch: (search: Record<string, unknown>) => ({
      q: typeof search.q === "string" && search.q ? search.q : undefined,
      category:
        typeof search.category === "string" ? search.category : undefined,
    }),
    component: ShopPage,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([shopRoute]),
    history: createMemoryHistory({ initialEntries: [initialEntry] }),
  });
  const result = renderWithQueryClient(<RouterProvider router={router} />);
  return { router, ...result };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ShopPage", () => {
  it("renders a card for every product with name, category, and price", async () => {
    renderShop();

    expect(
      await screen.findByText("Marigold Gajra Hair Flower"),
    ).toBeInTheDocument();
    expect(screen.getByText("Pretty in Pink Hair Bow")).toBeInTheDocument();
    expect(screen.getByText("Pearl Detail Hair Clip")).toBeInTheDocument();

    // Category labels and prices render on the cards.
    expect(screen.getAllByText("Hair Flowers").length).toBeGreaterThan(0);
    expect(screen.getByText(/1,299/)).toBeInTheDocument();
    // The unpriced product shows the on-request copy.
    expect(screen.getByText("Price on request")).toBeInTheDocument();
  });

  it("filters the grid by search term and writes it to the URL", async () => {
    const user = userEvent.setup();
    const { router } = renderShop();

    await screen.findByText("Marigold Gajra Hair Flower");
    await user.type(screen.getByLabelText("Search products by name"), "pearl");

    await waitFor(() => {
      expect(screen.queryByText("Marigold Gajra Hair Flower")).toBeNull();
    });
    expect(screen.getByText("Pearl Detail Hair Clip")).toBeInTheDocument();

    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({ q: "pearl" });
    });
  });

  it("narrows the grid to a category and reflects it in the URL", async () => {
    const user = userEvent.setup();
    const { router } = renderShop();

    await screen.findByText("Marigold Gajra Hair Flower");
    await user.click(screen.getByRole("button", { name: "Hair Bows" }));

    await waitFor(() => {
      expect(screen.queryByText("Marigold Gajra Hair Flower")).toBeNull();
    });
    expect(screen.getByText("Pretty in Pink Hair Bow")).toBeInTheDocument();

    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({
        category: "hairBows",
      });
    });
  });

  it("shows an empty state when nothing matches and can reset", async () => {
    const user = userEvent.setup();
    renderShop();

    await screen.findByText("Marigold Gajra Hair Flower");
    await user.type(
      screen.getByLabelText("Search products by name"),
      "zzz-nothing",
    );

    expect(
      await screen.findByText("No pieces match your search"),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Show all products" }));
    expect(
      await screen.findByText("Marigold Gajra Hair Flower"),
    ).toBeInTheDocument();
  });

  it("marks sold-out products on their card", async () => {
    renderShop();
    const card = (await screen.findByText("Pearl Detail Hair Clip")).closest(
      "a",
    );
    expect(card).not.toBeNull();
    expect(
      within(card as HTMLElement).getByText("Sold out"),
    ).toBeInTheDocument();
  });
});
