import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Types "../types/products";

module {
  public type Product = Types.Product;
  public type ProductId = Types.ProductId;
  public type Category = Types.Category;
  public type ProductDetails = Types.ProductDetails;
  public type PriceInPaise = Types.PriceInPaise;

  /// Return every product, ordered by sortOrder then name.
  public func listProducts(products : Map.Map<ProductId, Product>) : [Product] {
    let all = products.values().toArray();
    all.sort(
      func(a, b) {
        if (a.sortOrder < b.sortOrder) { #less } else if (a.sortOrder > b.sortOrder) {
          #greater;
        } else {
          a.name.compare(b.name);
        };
      }
    );
  };

  /// Return a single product by id, or null when absent.
  public func getProduct(products : Map.Map<ProductId, Product>, id : ProductId) : ?Product {
    products.get(id);
  };

  /// Set the price (in paise) for a product. Null clears the price.
  public func setProductPrice(products : Map.Map<ProductId, Product>, id : ProductId, priceInPaise : ?PriceInPaise) : () {
    switch (products.get(id)) {
      case (?product) {
        products.add(id, { product with priceInPaise });
      };
      case null {};
    };
  };

  /// Mark a product available or sold out.
  public func setProductAvailability(products : Map.Map<ProductId, Product>, id : ProductId, available : Bool) : () {
    switch (products.get(id)) {
      case (?product) {
        products.add(id, { product with available });
      };
      case null {};
    };
  };

  /// Update a product's name, category, and description.
  public func updateProductDetails(products : Map.Map<ProductId, Product>, id : ProductId, details : ProductDetails) : () {
    switch (products.get(id)) {
      case (?product) {
        products.add(
          id,
          {
            product with
            name = details.name;
            category = details.category;
            description = details.description;
          },
        );
      };
      case null {};
    };
  };

  /// Replace a product's object-storage image key.
  public func setProductImage(products : Map.Map<ProductId, Product>, id : ProductId, imageKey : Text) : () {
    switch (products.get(id)) {
      case (?product) {
        products.add(id, { product with imageKey });
      };
      case null {};
    };
  };

  /// Ensure the initial product rows exist. Idempotent.
  public func seedProducts(products : Map.Map<ProductId, Product>, state : Types.ProductsState) : () {
    if (products.size() > 0) { return };
    let now = Time.now();
    var order = 0;
    for ((imageKey, name, category) in seeds().values()) {
      let id = "p" # state.nextId.toText();
      state.nextId += 1;
      products.add(
        id,
        {
          id;
          name;
          category;
          description = "";
          imageKey;
          priceInPaise = null;
          available = true;
          sortOrder = order;
          createdAt = now;
        },
      );
      order += 1;
    };
  };

  /// The 25 initial products derived from the cropped collage images.
  func seeds() : [(Text, Text, Category)] {
    [
      ("collage1-garba-vibes.jpg", "Garba Vibes Hair Flower", #hairFlowers),
      ("collage1-braided-accessories.jpg", "Braided Accessories Set", #braidedAccessories),
      ("collage1-pretty-in-pink.jpg", "Pretty in Pink Hair Bow", #hairBows),
      ("collage1-hair-flower.jpg", "Classic Hair Flower", #hairFlowers),
      ("collage1-garba-outfit-idea.jpg", "Garba Outfit Look", #hairstyleLooks),
      ("collage1-elegant-details.jpg", "Elegant Details Hair Clip", #hairClips),
      ("collage1-hair-bows.jpg", "Festive Hair Bows", #hairBows),
      ("collage1-traditional-look.jpg", "Traditional Look", #hairstyleLooks),
      ("collage1-cute-hair-clips.jpg", "Cute Hair Clips", #hairClips),
      ("collage2-garba-dance.jpg", "Garba Dance Look", #hairstyleLooks),
      ("collage2-braided-accessories.jpg", "Braided Accessories", #braidedAccessories),
      ("collage2-pearl-details.jpg", "Pearl Detail Hair Clip", #hairClips),
      ("collage2-hair-flower.jpg", "Pearl Hair Flower", #hairFlowers),
      ("collage2-braided-tassels.jpg", "Braided Tassels", #braidedAccessories),
      ("collage2-elegant-traditional.jpg", "Elegant Traditional Look", #hairstyleLooks),
      ("collage2-cute-hair-bows.jpg", "Cute Hair Bows", #hairBows),
      ("collage2-handmade-hair-accessories.jpg", "Handmade Hair Accessories", #hairClips),
      ("collage2-ready-for-navratri.jpg", "Ready for Navratri", #hairstyleLooks),
      ("collage3-garba-dance.jpg", "Garba Dance Braid", #hairstyleLooks),
      ("collage3-fishtail-braid.jpg", "Fishtail Braid", #braidedAccessories),
      ("collage3-messy-braid.jpg", "Messy Braid", #braidedAccessories),
      ("collage3-braid-their.jpg", "Braid with Flowers", #braidedAccessories),
      ("collage3-crown-braid.jpg", "Crown Braid", #braidedAccessories),
      ("collage3-messy-extensions.jpg", "Messy Extensions", #hairstyleLooks),
      ("collage3-garba-hook.jpg", "Garba Hook Accessory", #hairClips),
    ];
  };
};
