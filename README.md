# CanadianSupermarketApi (Superstore v1)

A TypeScript client exposing:
- `listStores()` — list all Real Canadian Superstore locations
- `searchProducts(query, storeId, page, pageSize)` — search products scoped to a store with user-specified pagination
- `getProductDetails(productId, storeId)` — fetch product details for a store

Results use a typed `Result<T>` union: `{ ok: true, value } | { ok: false, error }`.

## Install & Scripts

```
npm install
npm test
npm run lint
npm run format
```

## Environment

Set `SUPERSTORE_API_KEY` before running the library or its tests. The contract and integration suites call the live Real Canadian Superstore API—no fake datasources or offline fallbacks exist. Missing or invalid credentials cause the client factory to throw and the tests to fail immediately.

## Usage

```ts
import { createClient } from './src/index';

const client = createClient({ superstore: { apiKey: process.env.SUPERSTORE_API_KEY } });

const stores = await client.listStores();
const search = await client.searchProducts('milk', '1234', 1, 10);
const details = await client.getProductDetails('21053436_EA', '1234');
```

`createRepository` remains exported if you prefer to work directly with the repository port.

## Notes
- Prices are in CAD and exclude tax. All pricing fields provided upstream should be returned.
- No retry/backoff in v1. Errors carry types and messages. Handle 401/403/429 appropriately in your app.
- Credentials must be supplied by callers once the datasource is wired.
- Contract and integration tests hit the live API; set `SUPERSTORE_API_KEY` and be mindful of upstream rate limits when running the suite.

## Superstore Search Requirements (confirmed)

Headers (required)
- `x-apikey`: your API key (provided via env/config)
- `x-application-type: Web` (literal)
- `x-loblaw-tenant-id: ONLINE_GROCERIES` (literal)
- `accept-language: en` (literal; `fr` also works; `en-CA` fails)

Headers (optional)
- `origin`, `referer`, all `sec-*`, `user-agent`, `x-channel`, `x-preview`

Payload (required)
- `banner: "superstore"` (literal)
- `cart.cartId`: random UUID per request
- `fulfillmentInfo.storeId`: provided store id
- `fulfillmentInfo.offerType: "OG"` (literal)
- `searchRelatedInfo.term`: search term string

Payload (optional)
- `fulfillmentInfo.date` (DDMMYYYY), `pickupType`, `timeSlot`
- `listingInfo` (filters/sort/includeFiltersInResponse/pagination). If sent, `pagination.from >= 1`
- `userData`, `device`, `searchRelatedInfo.options`

Constraints
- `pagination.from` must be >= 1 (server enforces combined bounds)
- `offerType` must be `OG`
- `accept-language` must be a simple language code (`en`/`fr`)
