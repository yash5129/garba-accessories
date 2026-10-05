import { AdminPage } from "@/pages/AdminPage";
import { asBackend, makeMockActor, renderWithQueryClient } from "@/test/actor";
import { SAMPLE_PRODUCTS } from "@/test/fixtures";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const actor = makeMockActor(SAMPLE_PRODUCTS);

/** Mutable auth state the mocked Internet Identity hook reads from. */
const auth = {
  isAuthenticated: false,
  isAdmin: true,
};

vi.mock("@caffeineai/core-infrastructure", () => ({
  useActor: () => ({ actor: asBackend(actor), isFetching: false }),
  useInternetIdentity: () => ({
    isAuthenticated: auth.isAuthenticated,
    identity: undefined,
    login: vi.fn(),
    clear: vi.fn(),
    isLoggingIn: false,
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  auth.isAuthenticated = false;
  auth.isAdmin = true;
  actor.isCallerAdmin.mockResolvedValue(true);
});

describe("AdminPage", () => {
  it("gates the admin area behind sign-in", () => {
    renderWithQueryClient(<AdminPage />);
    expect(screen.getByText("Owner sign-in")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Sign in with Internet Identity/i }),
    ).toBeInTheDocument();
    // The product list is not reachable while signed out.
    expect(screen.queryByText("Price setup")).toBeNull();
  });

  it("denies a signed-in non-owner", async () => {
    auth.isAuthenticated = true;
    auth.isAdmin = false;
    actor.isCallerAdmin.mockResolvedValue(false);
    renderWithQueryClient(<AdminPage />);
    expect(await screen.findByText("Owner access only")).toBeInTheDocument();
  });

  it("lists every product and flags the ones needing a price", async () => {
    auth.isAuthenticated = true;
    renderWithQueryClient(<AdminPage />);

    expect(
      await screen.findByText("Marigold Gajra Hair Flower"),
    ).toBeInTheDocument();
    expect(screen.getByText("Pretty in Pink Hair Bow")).toBeInTheDocument();
    expect(screen.getByText("Pearl Detail Hair Clip")).toBeInTheDocument();

    // One product has no price, so exactly one "Needs price" flag renders.
    expect(screen.getAllByText("Needs price")).toHaveLength(1);
    expect(screen.getByText("1 awaiting a price")).toBeInTheDocument();
  });

  it("saves a rupee price through the actor", async () => {
    auth.isAuthenticated = true;
    const user = userEvent.setup();
    renderWithQueryClient(<AdminPage />);

    const row = (await screen.findByText("Pretty in Pink Hair Bow")).closest(
      "li",
    );
    expect(row).not.toBeNull();
    const input = within(row as HTMLElement).getByLabelText(
      "Price in rupees for product p2",
    );
    await user.type(input, "899");
    await user.click(
      within(row as HTMLElement).getByRole("button", { name: /Save/i }),
    );

    await waitFor(() => {
      expect(actor.setProductPrice).toHaveBeenCalledWith("p2", 89900n);
    });
    expect(await screen.findByText(/Price saved/)).toBeInTheDocument();
  });

  it("clears a price when the field is emptied", async () => {
    auth.isAuthenticated = true;
    const user = userEvent.setup();
    renderWithQueryClient(<AdminPage />);

    const row = (await screen.findByText("Marigold Gajra Hair Flower")).closest(
      "li",
    );
    const input = within(row as HTMLElement).getByLabelText(
      "Price in rupees for product p1",
    );
    await user.clear(input);
    await user.click(
      within(row as HTMLElement).getByRole("button", { name: /Save/i }),
    );

    await waitFor(() => {
      expect(actor.setProductPrice).toHaveBeenCalledWith("p1", null);
    });
  });

  it("toggles a product between available and sold out", async () => {
    auth.isAuthenticated = true;
    const user = userEvent.setup();
    renderWithQueryClient(<AdminPage />);

    await screen.findByText("Marigold Gajra Hair Flower");
    await user.click(
      screen.getByRole("switch", {
        name: /Mark Marigold Gajra Hair Flower as sold out/i,
      }),
    );

    await waitFor(() => {
      expect(actor.setProductAvailability).toHaveBeenCalledWith("p1", false);
    });
  });

  it("edits a product's name, category, and description", async () => {
    auth.isAuthenticated = true;
    const user = userEvent.setup();
    renderWithQueryClient(<AdminPage />);

    const row = (await screen.findByText("Marigold Gajra Hair Flower")).closest(
      "li",
    );
    expect(row).not.toBeNull();
    await user.click(
      within(row as HTMLElement).getByRole("button", {
        name: /Edit details/i,
      }),
    );

    // The dialog opens prefilled with the current values.
    const nameInput = await screen.findByLabelText("Product name");
    expect(nameInput).toHaveValue("Marigold Gajra Hair Flower");

    await user.clear(nameInput);
    await user.type(nameInput, "Festive Marigold Gajra");
    await user.clear(screen.getByLabelText("Short description"));
    await user.type(
      screen.getByLabelText("Short description"),
      "Bright marigold for Garba night.",
    );
    await user.click(screen.getByRole("button", { name: /Save changes/i }));

    await waitFor(() => {
      expect(actor.updateProductDetails).toHaveBeenCalledWith("p1", {
        name: "Festive Marigold Gajra",
        category: "hairFlowers",
        description: "Bright marigold for Garba night.",
      });
    });
    expect(
      await screen.findByText("Product details updated."),
    ).toBeInTheDocument();
  });

  it("requires a product name before saving edits", async () => {
    auth.isAuthenticated = true;
    const user = userEvent.setup();
    renderWithQueryClient(<AdminPage />);

    const row = (await screen.findByText("Marigold Gajra Hair Flower")).closest(
      "li",
    );
    await user.click(
      within(row as HTMLElement).getByRole("button", {
        name: /Edit details/i,
      }),
    );

    const nameInput = await screen.findByLabelText("Product name");
    await user.clear(nameInput);
    await user.click(screen.getByRole("button", { name: /Save changes/i }));

    expect(
      await screen.findByText("A product name is required."),
    ).toBeInTheDocument();
    expect(actor.updateProductDetails).not.toHaveBeenCalled();
  });
});
