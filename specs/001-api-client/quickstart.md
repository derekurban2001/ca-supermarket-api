# Quickstart: Validate CanadianSupermarketApi Client (Superstore v1)

This guide outlines minimal end-to-end validation steps for the library once implemented.

## Prerequisites
- Node.js 18+
- A valid API key for the upstream endpoints (user-provided)
- A known store id for Real Canadian Superstore (e.g., from store search)

## Steps
- Configure the client with your API key.
- List stores:
  - Input: none
  - Expect: list of stores with id, name, address, geo, pickupType, openNow
- Search products:
  - Input: query (e.g., "milk" or a known product id), storeId, page, pageSize
  - Expect: paginated list with id, name, brand, imageUrl, price (CAD)
- Fetch product details:
  - Input: productId and storeId
  - Expect: full details including pricing (current, regular when present), unit comparison price (when available), image, nutrition
- Negative tests:
  - Missing/invalid API key → clear error indicating authorization issue
  - Unknown productId for a valid store → not-found (store-scoped)
  - Invalid pagination (missing/invalid page or pageSize) → validation error with guidance

## Notes
- Prices are in CAD; confirm whether taxes are included/excluded.
- Availability and pricing are store-scoped and may change.
