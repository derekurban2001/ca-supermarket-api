import 'dotenv/config';
import { randomUUID } from 'node:crypto';

const API_KEY = process.env.SUPERSTORE_API_KEY;
if (!API_KEY) {
  console.error('Missing SUPERSTORE_API_KEY in env');
  process.exit(1);
}

const BASE = 'https://api.pcexpress.ca/pcx-bff';

const browserHeaders = () => ({
  accept: '*/*',
  'accept-language': 'en',
  'business-user-agent': 'PCXWEB',
  origin: 'https://www.realcanadiansuperstore.ca',
  origin_session_header: 'B',
  referer: 'https://www.realcanadiansuperstore.ca/',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'cross-site',
  'sec-gpc': '1',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
  'is-helios-account': 'false',
  'is-iceberg-enabled': 'true',
  'sec-ch-ua': '"Chromium";v="140", "Not=A?Brand";v="24", "Brave";v="140"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"Windows"',
  'x-application-type': 'Web',
  'x-channel': 'web',
  'x-loblaw-tenant-id': 'ONLINE_GROCERIES',
  'x-preview': 'false'
});

const today = () => {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}${mm}${yyyy}`;
};

const baseBody = (term, storeId, page = 1, pageSize = 10) => {
  const cartId = randomUUID();
  const sessionId = randomUUID();
  const domainUserId = randomUUID();
  const from = 1 + Math.max(0, (page - 1) * Math.max(1, pageSize));
  return {
    cart: { cartId },
    fulfillmentInfo: {
      storeId,
      pickupType: 'STORE',
      offerType: 'OG',
      date: today(),
      timeSlot: null
    },
    listingInfo: {
      filters: {
        'search-bar': [term],
        storeId: [storeId],
        cartId: [cartId]
      },
      sort: {},
      pagination: { from },
      includeFiltersInResponse: true
    },
    banner: 'superstore',
    userData: { domainUserId, sessionId },
    device: { screenSize: 1099 },
    searchRelatedInfo: {
      term,
      options: [{ name: 'rmp.unifiedSearchVariant', value: 'Y' }]
    }
  };
};

async function listStores() {
  const res = await fetch(`${BASE}/api/v1/pickup-locations?bannerIds=superstore`, {
    method: 'GET',
    headers: {
      'content-type': 'application/json',
      ...browserHeaders(),
      'x-apikey': API_KEY
    }
  });
  const data = await res.json().catch(() => []);
  if (Array.isArray(data) && data.length) return data;
  if (Array.isArray(data?.items) && data.items.length) return data.items;
  return [];
}

async function search(headers, body) {
  const res = await fetch(`${BASE}/api/v2/products/search`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers, 'x-apikey': API_KEY },
    body: JSON.stringify(body)
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = text; }
  return { status: res.status, ok: res.ok, body: json };
}

function clone(obj) { return JSON.parse(JSON.stringify(obj)); }

async function main() {
  const stores = await listStores();
  if (!stores.length) { console.error('No stores'); process.exit(1); }
  const storeId = String(stores[0].storeId ?? stores[0].id);
  const term = 'toilet paper';
  const baseH = { ...browserHeaders(), 'accept-language': 'en' };
  const baseB = baseBody(term, storeId, 1, 10);

  const results = [];

  async function runCase(name, mutateHeaders, mutateBody) {
    const h = clone(baseH);
    const b = clone(baseB);
    if (mutateHeaders) mutateHeaders(h);
    if (mutateBody) mutateBody(b);
    const r = await search(h, b);
    results.push({ name, status: r.status, ok: r.ok, error: r.ok ? null : r.body });
  }

  // Baseline
  await runCase('baseline', null, null);

  // Header removals
  const headerKeys = [
    'business-user-agent', 'origin', 'origin_session_header', 'referer',
    'sec-fetch-dest', 'sec-fetch-mode', 'sec-fetch-site', 'sec-gpc', 'user-agent',
    'is-helios-account', 'is-iceberg-enabled', 'sec-ch-ua', 'sec-ch-ua-mobile', 'sec-ch-ua-platform',
    'x-application-type', 'x-channel', 'x-loblaw-tenant-id', 'x-preview', 'accept-language'
  ];
  for (const k of headerKeys) {
    await runCase(`header: remove ${k}`, (h) => { delete h[k]; }, null);
  }

  // Header value variants
  await runCase('header: accept-language en-CA', (h) => { h['accept-language'] = 'en-CA'; }, null);
  await runCase('header: x-application-type Mobile', (h) => { h['x-application-type'] = 'Mobile'; }, null);
  await runCase('header: x-loblaw-tenant-id GROCERY', (h) => { h['x-loblaw-tenant-id'] = 'GROCERY'; }, null);
  await runCase('header: accept-language fr', (h) => { h['accept-language'] = 'fr'; }, null);

  // Payload removals
  const payloadCases = [
    ['payload: remove userData', (b) => { delete b.userData; }],
    ['payload: remove device', (b) => { delete b.device; }],
    ['payload: remove searchRelatedInfo.options', (b) => { delete b.searchRelatedInfo.options; }],
    ['payload: remove searchRelatedInfo', (b) => { delete b.searchRelatedInfo; }],
    ['payload: remove listingInfo.filters.cartId', (b) => { delete b.listingInfo.filters.cartId; }],
    ['payload: remove listingInfo.filters.storeId', (b) => { delete b.listingInfo.filters.storeId; }],
    ['payload: remove listingInfo.filters.search-bar', (b) => { delete b.listingInfo.filters['search-bar']; }],
    ['payload: remove listingInfo.sort', (b) => { delete b.listingInfo.sort; }],
    ['payload: remove listingInfo.includeFiltersInResponse', (b) => { delete b.listingInfo.includeFiltersInResponse; }],
    ['payload: pagination.from=0', (b) => { b.listingInfo.pagination.from = 0; }],
    ['payload: offerType=PICKUP', (b) => { b.fulfillmentInfo.offerType = 'PICKUP'; }],
    ['payload: remove fulfillmentInfo.date', (b) => { delete b.fulfillmentInfo.date; }],
    ['payload: remove fulfillmentInfo.storeId', (b) => { delete b.fulfillmentInfo.storeId; }],
    ['payload: remove fulfillmentInfo.pickupType', (b) => { delete b.fulfillmentInfo.pickupType; }],
    ['payload: remove fulfillmentInfo', (b) => { delete b.fulfillmentInfo; }],
    ['payload: remove listingInfo', (b) => { delete b.listingInfo; }],
    ['payload: remove banner', (b) => { delete b.banner; }],
    ['payload: remove cart.cartId', (b) => { delete b.cart.cartId; }],
    ['payload: remove listingInfo.pagination', (b) => { delete b.listingInfo.pagination; }]
  ];
  for (const [name, mut] of payloadCases) {
    await runCase(name, null, mut);
  }
  // Payload value variants
  await runCase('payload: offerType=HD', null, (b) => { b.fulfillmentInfo.offerType = 'HD'; });
  await runCase('payload: banner=pc-express', null, (b) => { b.banner = 'pc-express'; });

  // Print report
  console.log('\nReport: Product Search Requirements');
  for (const r of results) {
    const line = `${r.ok ? 'OK ' : 'ERR'} ${r.status.toString().padEnd(3)} - ${r.name}`;
    console.log(line);
  }
  const failed = results.filter(r => !r.ok);
  if (failed.length) {
    console.log('\nFailures (example error bodies):');
    for (const r of failed.slice(0,5)) {
      console.log(`- ${r.name}:`, r.error);
    }
  }
}

main().catch(e => { console.error(e); process.exit(1); });
