import AccessControl "mo:caffeineai-authorization/access-control";
import Map "mo:core/Map";

module {
  type OldActor = {};

  type Product = {
    id : Text;
    name : Text;
    category : {
      #hairFlowers;
      #hairBows;
      #braidedAccessories;
      #beaniesAndHats;
      #hairClips;
      #hairstyleLooks;
    };
    description : Text;
    imageKey : Text;
    priceInPaise : ?Nat;
    available : Bool;
    sortOrder : Nat;
    createdAt : Int;
  };

  type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    products : Map.Map<Text, Product>;
    productsState : { var nextId : Nat };
  };

  type Category = {
    #hairFlowers;
    #hairBows;
    #braidedAccessories;
    #beaniesAndHats;
    #hairClips;
    #hairstyleLooks;
  };

  type Seed = (Text, Text, Category);

  func seeds() : [Seed] {
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

  public func migration(_ : OldActor) : NewActor {
    let products = Map.empty<Text, Product>();
    var nextId = 0;
    var order = 0;
    for ((imageKey, name, category) in seeds().values()) {
      let id = "p" # nextId.toText();
      nextId += 1;
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
          createdAt = 0;
        },
      );
      order += 1;
    };
    {
      accessControlState = AccessControl.initState();
      products;
      productsState = { var nextId };
    };
  };
};
