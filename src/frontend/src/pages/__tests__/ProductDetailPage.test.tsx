import { ProductDetailPage } from "@/pages/ProductDetailPage";
import { asBackend, makeMockActor, renderWithQueryClient } from "@/test/actor";
import { SAMPLE_PRODUCTS, makeProduct } from "@/test/fixtures";
import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

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

function renderDetail(id: string) {
  const rootRoute = createRootRoute();
  const productRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/product/$id",
    component: ProductDetailPage,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([productRoute]),
    history: createMemoryHistory({ initialEntries: [`/product/${id}`] }),
  });
  return renderWithQueryClient(<RouterProvider router={router} />);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ProductDetailPage", () => {
  it("shows the photo, name, category, description, and price", async () => {
    renderDetail("p1");

    expect(
      await screen.findByRole("heading", {
        name: "Marigold Gajra Hair Flower",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Fresh marigold gajra for Garba night."),
    ).toBeInTheDocument();
    expect(screen.getByText(/1,299/)).toBeInTheDocument();
    // Category appears as a chip and as the polaroid caption.
    expect(screen.getAllByText("Hair Flowers").length).toBeGreaterThan(0);
    expect(
      screen.getByRole("img", { name: "Marigold Gajra Hair Flower" }),
    ).toHaveAttribute("src", "/assets/products/collage1-hair-flower.jpg");
  });

  it("shows 'Price on request' when no price is set", async () => {
    renderDetail("p2");
    expect(await screen.findByText("Price on request")).toBeInTheDocument();
    expect(screen.getByText("Set by the maker on request")).toBeInTheDocument();
  });

  it("offers a prefilled enquiry for an available product", async () => {
    renderDetail("p1");
    const enquire = await screen.findByRole("link", {
      name: /Enquire to order/i,
    });
    const href = enquire.getAttribute("href") ?? "";
    expect(href.startsWith("mailto:")).toBe(true);
    expect(decodeURIComponent(href)).toContain("Marigold Gajra Hair Flower");
    expect(decodeURIComponent(href)).toContain("Hair Flowers");
  });

  it("marks a sold-out product and hides the enquiry action", async () => {
    renderDetail("p3");
    expect(await screen.findByText("Sold out")).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /Enquire to order/i }),
    ).toBeNull();
    expect(
      screen.getByRole("link", { name: /See available pieces/i }),
    ).toBeInTheDocument();
  });

  it("shows a not-found state for an unknown id", async () => {
    renderDetail("does-not-exist");
    expect(await screen.findByText("Piece not found")).toBeInTheDocument();
  });
});
