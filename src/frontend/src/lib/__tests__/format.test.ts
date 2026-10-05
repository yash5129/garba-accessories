import { PRICE_ON_REQUEST, formatPrice, hasPrice } from "@/lib/format";
import { describe, expect, it } from "vitest";

describe("formatPrice", () => {
  it("shows 'Price on request' when no price is set", () => {
    expect(formatPrice(undefined)).toBe(PRICE_ON_REQUEST);
    expect(formatPrice(null)).toBe(PRICE_ON_REQUEST);
  });

  it("renders whole rupees in the en-IN convention", () => {
    // 129900 paise = ₹1,299
    expect(formatPrice(129900)).toContain("1,299");
    expect(formatPrice(129900)).toContain("₹");
  });

  it("accepts a bigint from the generated bindings", () => {
    expect(formatPrice(129900n)).toContain("1,299");
  });

  it("keeps paise for non-whole rupee amounts", () => {
    expect(formatPrice(129950)).toContain("1,299.50");
  });
});

describe("hasPrice", () => {
  it("is false for absent prices and true for a set price", () => {
    expect(hasPrice(undefined)).toBe(false);
    expect(hasPrice(null)).toBe(false);
    expect(hasPrice(0)).toBe(true);
    expect(hasPrice(129900n)).toBe(true);
  });
});
