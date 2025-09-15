# Client API Contracts (v1)

This document defines the public API contracts for the CanadianSupermarketApi client. Shapes are supermarket-agnostic and store-scoped where applicable.

## searchProducts

- Description: Search for products by keyword or known product id with user-specified pagination.
- Input:
  - query: string
  - storeId: string (required)
  - page: number (required)
  - pageSize: number (required)
- Output:
  - items: Array<ProductSummary>
  - page: number; pageSize: number; total: number | null
  - ordering: stable for identical inputs (no explicit sort controls in v1)

ProductSummary
- id: string
- name: string
- brand: string | null
- imageUrl: string | null
- packageSize: string | null
- price: { current: number; regular?: number | null; currency: 'CAD' }

## listStores

- Description: List all Real Canadian Superstore locations.
- Input: none
- Output:
  - items: Array<StoreSummary>

StoreSummary
- id: string
- name: string
- address: { line1: string; line2?: string; town?: string; region?: string; postalCode?: string; country?: string }
- geo: { lat: number; lon: number } | null
- pickupType: string
- openNow: boolean | null

## getProductDetails

- Description: Retrieve detailed product information for a given product id at a specific store.
- Input:
  - productId: string
  - storeId: string
- Output: ProductDetail

ProductDetail
- id: string
- name: string
- brand: string | null
- description: string | null
- imageUrl: string | null
- packageSize: string | null
- uom: string | null
- pricing: { current: number; regular?: number | null; currency: 'CAD'; unitPrice?: { value: number; unit: string; perQuantity: number } | null }
- nutrition: Nutrition | null
- breadcrumbs: Array<{ code: string; name: string }>
- variants?: Array<{ id: string; name?: string }> | null

Nutrition
- serving: string | null
- calories: string | null
- macros: { fat: string | null; carbs: string | null; protein: string | null; sub: Record<string, string | null> }
- micros: Record<string, string | null>
- sodium: string | null
- cholesterol: string | null
- disclaimer: string | null
- ingredients: string | null

## Errors

- All methods return either a successful shape or a documented error with:
  - type: 'invalid-params' | 'not-found' | 'rate-limited' | 'upstream-change' | 'unauthorized' | 'unknown'
  - code?: string
  - retryable?: boolean
  - message: string

## Notes

- Prices are expressed in CAD; all pricing fields provided upstream should be returned.
- Product availability is store-scoped; not all products are available at all stores.
- Credentials/keys are provided by the integrator and not embedded.
- A `createClient({ superstore?, repository? })` factory is provided to supply
  configuration/dependencies; the named functions above call this factory with
  default environment-driven settings.
- Missing credentials (e.g., unset `SUPERSTORE_API_KEY`) surface as `{ ok: false, error: { type: 'unauthorized', ... } }`; no offline fallbacks are provided.

