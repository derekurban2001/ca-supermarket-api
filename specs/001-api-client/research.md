# Research: Superstore Access and Client Behavior

This document captures decisions and unknowns informing the plan and contracts for the CanadianSupermarketApi client. Upstream access is unofficial and subject to change.

## Upstream Endpoints (observed)

- Product search: `POST https://api.pcexpress.ca/pcx-bff/api/v2/products/search`
  - Requires `X-Apikey` header (user-provided)
  - Payload typically includes `fulfillmentInfo.storeId` and search term; pagination is available
- Product details: `GET https://api.pcexpress.ca/pcx-bff/api/v1/products/{code}` with query params including `storeId`, `pickupType=STORE`, `banner=superstore`, `lang`, `date`
- Stores: `GET https://api.pcexpress.ca/pcx-bff/api/v1/pickup-locations?bannerIds=superstore`

## Decisions

- Credentials: Do NOT embed or hardcode keys. Client will require a caller-provided API key and fail clearly if missing.
- Results shape: Use stable, supermarket-agnostic contracts; distinguish chain vs store context; do not leak raw upstream DTOs across the boundary.
- Errors: Use a clear, typed error taxonomy (e.g., invalid-params, not-found, rate-limited, upstream-change). No built-in retry/backoff in v1.
- Pricing: Expose current price; include regular (was) price and unit comparison price when provided by upstream. All prices expressed in CAD.
- Images: Provide a single primary image URL when available; no specific resolution requirement in v1.
- Variants: If upstream exposes variant references, include them as references without enrichment in v1.
- Store discovery: List all Superstore locations and return essential fields (`storeId`, `name`, `address`, `geo`, `pickupType`, `openNow`). No proximity filtering in v1.
- Caching & freshness (library concern): Allow consumers to configure caching; recommended defaults may be provided in implementation. Freshness expectations in spec remain business-level.
- Logging & observability (library concern): Provide structured logging without exposing sensitive headers.

## Open Questions

- API key rotation and header name variability (is `X-Apikey` stable?): [NEEDS CLARIFICATION]
- Minimum viable search payload that reliably returns results (term + store?): [NEEDS CLARIFICATION]
- Taxes and pricing: confirm include/exclude tax in prices presented to callers: [NEEDS CLARIFICATION]
- Product id scope: assumed chain-wide; confirm behavior across stores: [NEEDS CLARIFICATION]

## Reference Shapes (observed)

- Search responses include product tiles with identifiers, title, image, and pricing fields.
- Product detail responses include pricing offers, nutrition facts, image assets, and descriptive fields.
- Store responses include location, ids, address, pickup type, and status fields.
