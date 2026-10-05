import AccessControl "mo:caffeineai-authorization/access-control";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import ProductsLib "../lib/products";
import Types "../types/products";

mixin (
  products : Map.Map<Types.ProductId, Types.Product>,
  state : Types.ProductsState,
  accessControlState : AccessControl.AccessControlState,
) {
  func requireAdmin(caller : Principal) {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can manage products");
    };
  };

  /// All products for the storefront.
  public query func listProducts() : async [Types.Product] {
    ProductsLib.listProducts(products);
  };

  /// Single product detail by id.
  public query func getProduct(id : Types.ProductId) : async ?Types.Product {
    ProductsLib.getProduct(products, id);
  };

  /// Admin-only: set or clear a product's price in paise.
  public shared ({ caller }) func setProductPrice(id : Types.ProductId, priceInPaise : ?Types.PriceInPaise) : async () {
    requireAdmin(caller);
    ProductsLib.setProductPrice(products, id, priceInPaise);
  };

  /// Admin-only: mark a product available or sold out.
  public shared ({ caller }) func setProductAvailability(id : Types.ProductId, available : Bool) : async () {
    requireAdmin(caller);
    ProductsLib.setProductAvailability(products, id, available);
  };

  /// Admin-only: update name, category, and description.
  public shared ({ caller }) func updateProductDetails(id : Types.ProductId, details : Types.ProductDetails) : async () {
    requireAdmin(caller);
    ProductsLib.updateProductDetails(products, id, details);
  };

  /// Admin-only: replace a product's object-storage image key.
  public shared ({ caller }) func setProductImage(id : Types.ProductId, imageKey : Text) : async () {
    requireAdmin(caller);
    ProductsLib.setProductImage(products, id, imageKey);
  };

  /// Admin-only: ensure the initial product rows exist. Idempotent.
  public shared ({ caller }) func seedProducts() : async () {
    requireAdmin(caller);
    ProductsLib.seedProducts(products, state);
  };
};
