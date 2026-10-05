import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Cell {
    value: Value;
    name: string;
}
export type Error_ = {
    __kind__: "FrontendOriginsNotConfigured";
    FrontendOriginsNotConfigured: null;
} | {
    __kind__: "MixedSsoSources";
    MixedSsoSources: {
        otherKeys: Array<string>;
        ssoKeys: Array<string>;
    };
} | {
    __kind__: "Stale";
    Stale: {
        ageNs: bigint;
    };
} | {
    __kind__: "MalformedCandid";
    MalformedCandid: null;
} | {
    __kind__: "AmbiguousAttribute";
    AmbiguousAttribute: {
        field: string;
        sources: Array<string>;
    };
} | {
    __kind__: "NoAttributes";
    NoAttributes: null;
} | {
    __kind__: "UnknownNonce";
    UnknownNonce: null;
} | {
    __kind__: "UntrustedSsoSource";
    UntrustedSsoSource: {
        domain: string;
    };
} | {
    __kind__: "MissingField";
    MissingField: string;
} | {
    __kind__: "FrontendOriginMismatch";
    FrontendOriginMismatch: {
        got: string;
        expected: Array<string>;
    };
};
export type PriceInPaise = bigint;
export interface Product {
    id: ProductId;
    sortOrder: bigint;
    name: string;
    createdAt: Timestamp;
    priceInPaise?: PriceInPaise;
    description: string;
    available: boolean;
    imageKey: string;
    category: Category;
}
export interface ProductDetails {
    name: string;
    description: string;
    category: Category;
}
export type ProductId = string;
export interface Result {
    hasMore: boolean;
    rows: Array<Array<Cell>>;
}
export type Result__1 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: Error_;
};
export type Timestamp = bigint;
export type Value = {
    __kind__: "int";
    int: bigint;
} | {
    __kind__: "nat";
    nat: bigint;
} | {
    __kind__: "float";
    float: number;
} | {
    __kind__: "bool";
    bool: boolean;
} | {
    __kind__: "null";
    null: null;
} | {
    __kind__: "text";
    text: string;
};
export enum Category {
    braidedAccessories = "braidedAccessories",
    beaniesAndHats = "beaniesAndHats",
    hairBows = "hairBows",
    hairstyleLooks = "hairstyleLooks",
    hairClips = "hairClips",
    hairFlowers = "hairFlowers"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    execute(qJson: string): Promise<Result>;
    /**
     * / Static Markdown documentation of the public backend API.
     */
    getApiDoc(): Promise<string>;
    getCallerUserRole(): Promise<UserRole>;
    /**
     * / Single product detail by id.
     */
    getProduct(id: ProductId): Promise<Product | null>;
    isCallerAdmin(): Promise<boolean>;
    /**
     * / All products for the storefront.
     */
    listProducts(): Promise<Array<Product>>;
    schema(): Promise<string>;
    /**
     * / Admin-only: ensure the initial product rows exist. Idempotent.
     */
    seedProducts(): Promise<void>;
    /**
     * / Admin-only: mark a product available or sold out.
     */
    setProductAvailability(id: ProductId, available: boolean): Promise<void>;
    /**
     * / Admin-only: replace a product's object-storage image key.
     */
    setProductImage(id: ProductId, imageKey: string): Promise<void>;
    /**
     * / Admin-only: set or clear a product's price in paise.
     */
    setProductPrice(id: ProductId, priceInPaise: PriceInPaise | null): Promise<void>;
    /**
     * / Admin-only: update name, category, and description.
     */
    updateProductDetails(id: ProductId, details: ProductDetails): Promise<void>;
}
