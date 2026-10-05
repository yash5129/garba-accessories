import App from "@/App";
import { asBackend, makeMockActor } from "@/test/actor";
import { SAMPLE_PRODUCTS } from "@/test/fixtures";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * App-level smoke test: the real router from `App.tsx` is mounted at the
 * default route. This is the only test that exercises the composed shell
 * (header + routed page + footer) rather than a page in isolation, so it is
 * what guards the "loads without a blank screen" acceptance criterion.
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

function renderApp() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("App shell", () => {
  it("renders the home route with header and footer instead of a blank screen", async () => {
    renderApp();

    // Routed home content.
    expect(
      await screen.findByRole("heading", {
        name: /Get Garba Ready for this Navratri/i,
      }),
    ).toBeInTheDocument();

    // Shared shell: header wordmark and footer store identity.
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    expect(screen.getAllByText("Logodiwati").length).toBeGreaterThan(0);
  });

  it("exposes primary navigation and search in the header", async () => {
    renderApp();

    await screen.findByRole("heading", {
      name: /Get Garba Ready for this Navratri/i,
    });

    const nav = screen.getByRole("navigation", { name: "Primary" });
    expect(nav).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Shop" })).toBeInTheDocument();
    expect(
      screen.getByRole("searchbox", { name: "Search products" }),
    ).toBeInTheDocument();
  });
});
