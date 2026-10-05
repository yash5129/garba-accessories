module {
  /// Stable identifier for a product row.
  public type ProductId = Text;

  /// Unix timestamp in nanoseconds (as returned by Time.now()).
  public type Timestamp = Int;

  /// Price in integer paise (1 rupee = 100 paise). Never a float.
  public type PriceInPaise = Nat;
};
