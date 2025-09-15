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

Set `SUPERSTORE_API_KEY` before running the library or its tests. The contract and integration suites call the live Real Canadian Superstore API—no fake datasources or offline fallbacks exist. missing.r invalid credentials return an unauthorized error via the Result type; tests require the key and will fail fast if it is missing.

Optional overrides:
- `SUPERSTORE_BASE_URL`
- `SUPERSTORE_BANNER` (defaults to `superstore`)
- `SUPERSTORE_TIMEOUT_MS` (ms, defaults to `10000`)

You can also load a typed config via `loadEnvConfig()` from `src/config/env.ts`.

## Usage

```ts
import { createClient, listStores, searchProducts, getProductDetails } from './src/index';
import { loadEnvConfig } from './src/config/env';

// Option A: Functional API (uses env when not overridden)
const stores = await listStores();
const search = await searchProducts('milk', '1234', 1, 10);
const details = await getProductDetails('21053436_EA', '1234');

// Option B: Explicit client with programmatic config
const { superstore } = loadEnvConfig();
const client = createClient({ superstore: { ...superstore, apiKey: process.env.SUPERSTORE_API_KEY } });
await client.listStores();
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



