mixin () {
  /// Static Markdown documentation of the public backend API.
  public query func getApiDoc() : async Text {
    let doc = "# Accessories Store — Backend API\n\n" #
      "This canister backs a festive Navratri/Garba accessories storefront. It stores a\n" #
      "product catalog, exposes it to the storefront, and lets an administrator set the\n" #
      "price and availability of each individual item.\n\n" #
      "## Authentication and identity\n\n" #
      "- The storefront read methods (`listProducts`, `getProduct`) are open to any\n" #
      "  caller, including anonymous visitors.\n" #
      "- Every mutation method is **admin-only**. The caller must be signed in and hold\n" #
      "  the `admin` role in the canister's access-control state; otherwise the call\n" #
      "  traps with `Unauthorized: Only admins can manage products`.\n" #
      "- The app's frontend pins an Internet Identity derivation origin, published at\n" #
      "  `/.well-known/ii-derivation-origin` when available. An agent already holding\n" #
      "  the user's Internet Identity authorization derives the correct per-app\n" #
      "  principal against that origin (for example `icp identity link web <name>\n" #
      "  --app <host>`). Such a delegation acts with the user's full authority in this\n" #
      "  app until it expires.\n" #
      "- Registration is a prerequisite for role-guarded calls. A caller registers by\n" #
      "  signing in through the app's own frontend; the first caller to initialize\n" #
      "  access control receives the `admin` role, and later callers receive the\n" #
      "  default non-admin role. A principal that never signed in through the app is\n" #
      "  unregistered even if it belongs to the app's owner, and a signed-in caller\n" #
      "  derived against a different origin is a different principal than the one the\n" #
      "  frontend registered. An unregistered or anonymous caller invoking an\n" #
      "  admin-only method receives the trap `Unauthorized: Only admins can manage\n" #
      "  products`.\n\n" #
      "## Units and encodings\n\n" #
      "- `priceInPaise` is an integer number of **paise** (1 rupee = 100 paise). It is\n" #
      "  never a float. Formatting to `₹` is the frontend's job.\n" #
      "- `createdAt` is a Unix timestamp in **nanoseconds** (`Time.now()`).\n" #
      "- `ProductId` is a `Text` identifier (for example `\"p0\"`).\n" #
      "- `Category` is a variant with the tags `#hairFlowers`, `#hairBows`,\n" #
      "  `#braidedAccessories`, `#beaniesAndHats`, `#hairClips`, `#hairstyleLooks`.\n" #
      "- `imageKey` is an object-storage key, not a URL.\n\n" #
      "## Methods\n\n" #
      "### `listProducts() : async [Product]` (query)\n\n" #
      "Returns every product, ordered by `sortOrder` ascending, then by `name`. Open to\n" #
      "all callers.\n\n" #
      "### `getProduct(id : ProductId) : async ?Product` (query)\n\n" #
      "Returns a single product by id, or `null` when no such product exists. Open to\n" #
      "all callers.\n\n" #
      "### `setProductPrice(id : ProductId, priceInPaise : ?PriceInPaise) : async ()` (admin)\n\n" #
      "Sets the price for one product. Passing `null` clears the price, which the\n" #
      "storefront renders as \"Price on request\". A missing product id is a no-op.\n" #
      "Admin-only.\n\n" #
      "### `setProductAvailability(id : ProductId, available : Bool) : async ()` (admin)\n\n" #
      "Marks a product available (`true`) or sold out (`false`). A missing product id\n" #
      "is a no-op. Admin-only.\n\n" #
      "### `updateProductDetails(id : ProductId, details : ProductDetails) : async ()` (admin)\n\n" #
      "Replaces a product's `name`, `category`, and `description`. A missing product id\n" #
      "is a no-op. Admin-only.\n\n" #
      "### `setProductImage(id : ProductId, imageKey : Text) : async ()` (admin)\n\n" #
      "Replaces a product's object-storage image key. A missing product id is a no-op.\n" #
      "Admin-only.\n\n" #
      "### `seedProducts() : async ()` (admin)\n\n" #
      "Ensures the initial catalog rows exist. **Idempotent**: it only creates rows when\n" #
      "the catalog is empty, so calling it again after any product exists does nothing.\n" #
      "Admin-only.\n\n" #
      "### `getApiDoc() : async Text` (query)\n\n" #
      "Returns this document.\n\n" #
      "## Lifecycle and polling\n\n" #
      "- `listProducts` and `getProduct` are `query` calls: they read committed state\n" #
      "  and never mutate it.\n" #
      "- Mutations are update calls. After a successful mutation, re-read with\n" #
      "  `listProducts` / `getProduct` to observe the new state; there is no push\n" #
      "  notification or subscription.\n" #
      "- `seedProducts` is safe to call repeatedly; it is a no-op once the catalog is\n" #
      "  non-empty.\n\n" #
      "## Mutation retry safety\n\n" #
      "- `setProductPrice`, `setProductAvailability`, `updateProductDetails`, and\n" #
      "  `setProductImage` are **idempotent**: applying the same value twice yields the\n" #
      "  same state, so a retried call is safe.\n" #
      "- `seedProducts` is idempotent and only creates rows when the catalog is empty.\n" #
      "- No mutation deletes data; there is no destructive endpoint.\n\n" #
      "## Errors and gotchas\n\n" #
      "- Admin-only methods trap with `Unauthorized: Only admins can manage products`\n" #
      "  for non-admin or anonymous callers.\n" #
      "- Mutations against an unknown product id silently do nothing (no error).\n" #
      "- `priceInPaise` absent means \"Price on request\"; it is not the same as a price\n" #
      "  of zero.\n" #
      "- The OQL `schema()` / `execute()` endpoints expose the `product` table as\n" #
      "  world-readable (`public_`), matching the open storefront reads.\n";
    doc;
  };
};
