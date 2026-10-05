import { PocketIc, createIdentity } from "@dfinity/pic";
import type { Actor, CanisterFixture } from "@dfinity/pic";
import { afterAll, beforeAll, expect, it } from "vitest";

import { idlFactory } from "../../src/frontend/src/declarations/backend.did.js";
import type { _SERVICE } from "../../src/frontend/src/declarations/backend.did";

const PIC_URL = process.env.POCKET_IC_URL ?? "";
const BACKEND_WASM = process.env.BACKEND_WASM ?? "";
// Set only on a converted project: the last pre-EM revision, whose schema this
// app's migration chain replays from. Installing the current wasm onto an empty
// canister there traps IC0503 before any test runs.
const BASELINE_WASM = process.env.BACKEND_WASM_BASELINE;

let pic: PocketIc | undefined;
let actor: Actor<_SERVICE>;
let canisterId: CanisterFixture<_SERVICE>["canisterId"];

/** The store owner, used to install the canister and call admin methods. */
const owner = createIdentity("logodiwati-owner");

beforeAll(async () => {
  pic = await PocketIc.create(PIC_URL);
  if (BASELINE_WASM === undefined) {
    ({ actor, canisterId } = await pic.setupCanister<_SERVICE>({
      idlFactory,
      wasm: BACKEND_WASM,
      sender: owner.getPrincipal(),
    }));
  } else {
    // `[baseline, current]`, the same install contract the hosted deploy uses for
    // a converted project. The upgrade replays the chain from the legacy schema.
    const installed = await pic.setupCanister<_SERVICE>({
      idlFactory,
      wasm: BASELINE_WASM,
      sender: owner.getPrincipal(),
    });
    await pic.upgradeCanister({
      canisterId: installed.canisterId,
      wasm: BACKEND_WASM,
      arg: new Uint8Array(),
    });
    ({ actor, canisterId } = installed);
  }
  // `setupCanister`'s `sender` only sets the install principal; the returned
  // actor still calls as anonymous. Authenticate it as the owner and claim the
  // first admin role, which is how the app's own sign-in flow grants it.
  actor.setIdentity(owner);
  await actor._initialize_access_control();
});

afterAll(async () => {
  // `?.` because `beforeAll` may not have got that far. A failed
  // `PocketIc.create` otherwise stacks "Cannot read properties of undefined"
  // on top of the real error and buries the one line that explains the run.
  await pic?.tearDown();
});

it("serves the catalog seeded by the migration on a fresh install", async () => {
  // The migration seeds the 25 starter products, so a freshly installed
  // canister is populated rather than empty. This is the read that would trap
  // against a stubbed backend.
  const products = await actor.listProducts();
  expect(products).toHaveLength(25);
  // Every seeded row starts unpriced and available.
  expect(products.every((product) => product.priceInPaise.length === 0)).toBe(
    true,
  );
  expect(products.every((product) => product.available)).toBe(true);
});

it("keeps seedProducts idempotent over the migrated catalog", async () => {
  await actor.seedProducts();
  const products = await actor.listProducts();
  expect(products).toHaveLength(25);
});

it("round-trips a price through the real canister", async () => {
  const [first] = await actor.listProducts();
  expect(first).toBeDefined();
  const id = first!.id;

  await actor.setProductPrice(id, [129900n]);
  const priced = await actor.getProduct(id);
  expect(priced).not.toBeNull();
  expect(priced[0]!.priceInPaise).toEqual([129900n]);

  // Clearing the price returns the row to "Price on request".
  await actor.setProductPrice(id, []);
  const cleared = await actor.getProduct(id);
  expect(cleared[0]!.priceInPaise).toEqual([]);
});

it("marks a product sold out and back available", async () => {
  const [first] = await actor.listProducts();
  const id = first!.id;

  await actor.setProductAvailability(id, false);
  expect((await actor.getProduct(id))[0]!.available).toBe(false);

  await actor.setProductAvailability(id, true);
  expect((await actor.getProduct(id))[0]!.available).toBe(true);
});

it("updates a product's name, category, and description", async () => {
  const [first] = await actor.listProducts();
  const id = first!.id;

  await actor.updateProductDetails(id, {
    name: "Marigold Gajra",
    category: { hairFlowers: null },
    description: "Fresh marigold gajra for Garba night.",
  });

  const updated = await actor.getProduct(id);
  expect(updated[0]).toMatchObject({
    name: "Marigold Gajra",
    category: { hairFlowers: null },
    description: "Fresh marigold gajra for Garba night.",
  });
});

it("replaces a product's image key", async () => {
  const [first] = await actor.listProducts();
  const id = first!.id;

  await actor.setProductImage(id, "collage3-crown-braid.jpg");
  expect((await actor.getProduct(id))[0]!.imageKey).toBe(
    "collage3-crown-braid.jpg",
  );
});

it("rejects an anonymous caller from admin-only methods", async () => {
  // A freshly created actor calls as the anonymous principal until an identity
  // is set. `pic` is set by `beforeAll` here.
  const guest = pic!.createActor<_SERVICE>(idlFactory, canisterId);
  await expect(guest.setProductPrice("p0", [100n])).rejects.toThrow();
  await expect(guest.seedProducts()).rejects.toThrow();
});
