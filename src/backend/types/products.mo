import Common "common";

module {
  public type ProductId = Common.ProductId;
  public type Timestamp = Common.Timestamp;
  public type PriceInPaise = Common.PriceInPaise;

  /// Fixed set of store categories. Enumerable by the frontend.
  public type Category = {
    #hairFlowers;
    #hairBows;
    #braidedAccessories;
    #beaniesAndHats;
    #hairClips;
    #hairstyleLooks;
  };

  /// Public product view returned across the API boundary.
  /// `priceInPaise` absent means "Price on request".
  public type Product = {
    id : ProductId;
    name : Text;
    category : Category;
    description : Text;
    imageKey : Text;
    priceInPaise : ?PriceInPaise;
    available : Bool;
    sortOrder : Nat;
    createdAt : Timestamp;
  };

  /// Input for creating/updating product details.
  public type ProductDetails = {
    name : Text;
    category : Category;
    description : Text;
  };

  /// Stable state shared with the products mixin.
  public type ProductsState = {
    var nextId : Nat;
  };
};
