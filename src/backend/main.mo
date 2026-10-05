import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import Expose "mo:caffeineai-oql/Expose";
import Map "mo:core/Map";
import MapEntity "mo:caffeineai-oql/MapEntity";
import Entity "mo:caffeineai-oql/Entity";
import TextValue "mo:caffeineai-oql/TextValue";
import NatValue "mo:caffeineai-oql/NatValue";
import IntValue "mo:caffeineai-oql/IntValue";
import BoolValue "mo:caffeineai-oql/BoolValue";
import ApiDocMixin "mixins/api-doc";
import ProductsApi "mixins/products-api";
import Types "types/products";

actor {
  let accessControlState : AccessControl.AccessControlState;
  let products : Map.Map<Types.ProductId, Types.Product>;
  let productsState : Types.ProductsState;

  include MixinAuthorization(accessControlState, null);
  include ProductsApi(products, productsState, accessControlState);
  include ApiDocMixin();

  func categoryTag(category : Types.Category) : Text =
    switch category {
      case (#hairFlowers) "hairFlowers";
      case (#hairBows) "hairBows";
      case (#braidedAccessories) "braidedAccessories";
      case (#beaniesAndHats) "beaniesAndHats";
      case (#hairClips) "hairClips";
      case (#hairstyleLooks) "hairstyleLooks";
    };

  func priceValue(price : ?Types.PriceInPaise) : Int =
    switch price {
      case null -1;
      case (?p) p.toInt();
    };

  include Expose({
    entities = [
      products.toEntityManual("product", "Product", "id")
        .sample({
          id = "";
          name = "";
          category = #hairFlowers;
          description = "";
          imageKey = "";
          priceInPaise = null;
          available = true;
          sortOrder = 0;
          createdAt = 0;
        })
        .payload("id", func p = p.id)
        .payload("name", func p = p.name)
        .payload("category", func p = categoryTag(p.category))
        .payload("description", func p = p.description)
        .payload("imageKey", func p = p.imageKey)
        .payload("priceInPaise", func p = priceValue(p.priceInPaise))
        .payload("available", func p = p.available)
        .payload("sortOrder", func p = p.sortOrder)
        .payload("createdAt", func p = p.createdAt)
        .public_()
        .build(),
    ];
  });
};
