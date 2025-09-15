import type { SearchRequestDTO } from '../dtos/SearchDTO';
import type { ProductDTO } from '../dtos/ProductDTO';
import type { StoreDTO } from '../dtos/StoreDTO';
import { randomUUID } from 'node:crypto';

/**
 * Superstore Product Search: confirmed requirements (from live probing)
 *
 * Required headers (values enforced as literals):
 * - x-apikey: caller-provided key (loaded from env/config)
 * - x-application-type: 'Web'
 * - x-loblaw-tenant-id: 'ONLINE_GROCERIES'
 * - accept-language: 'en' (note: 'fr' also works, 'en-CA' fails)
 *
 * Optional headers (omitted by default): origin, referer, sec-*, user-agent, x-channel, x-preview
 *
 * Required payload fields:
 * - banner: 'superstore'
 * - cart.cartId: random UUID per request
 * - fulfillmentInfo.storeId: provided by caller
 * - fulfillmentInfo.offerType: 'OG' (PICKUP/HD rejected)
 * - searchRelatedInfo.term: provided by caller
 *
 * Optional payload fields (omitted or ignored): userData, device, listingInfo (filters/sort/includeFiltersInResponse/pagination)
 * Constraints: if pagination is sent, pagination.from must be >= 1; date optional.
 */

// Header literal constants per confirmed requirements
const HDR_APPLICATION_TYPE = 'Web';
const HDR_TENANT_ID = 'ONLINE_GROCERIES';
const HDR_ACCEPT_LANGUAGE = 'en';

// Minimal payload shape used for search requests
type SuperstoreSearchPayload = {
  cart: { cartId: string };
  fulfillmentInfo: {
    storeId: string;
    pickupType?: 'STORE';
    offerType: 'OG';
    date?: string;
    timeSlot?: null;
  };
  // listingInfo is optional; when included, only pagination.from is required to control paging
  listingInfo?: { pagination?: { from: number } };
  banner: 'superstore';
  searchRelatedInfo: { term: string };
};

export type SuperstoreConfig = {
  apiKey?: string;
  baseUrl?: string; // Defaults to https://api.pcexpress.ca/pcx-bff
  banner?: 'superstore';
  timeoutMs?: number; // request timeout
};

type HttpOptions = { method?: 'GET' | 'POST'; headers?: Record<string, string>; body?: unknown; timeoutMs?: number };

export class SuperstoreApiDatasource {
  private baseUrl: string;
  private banner: 'superstore';
  private timeoutMs: number;

  constructor(private readonly config: SuperstoreConfig = {}) {
    this.baseUrl = config.baseUrl ?? 'https://api.pcexpress.ca/pcx-bff';
    this.banner = config.banner ?? 'superstore';
    this.timeoutMs = config.timeoutMs ?? 10000;
  }

  private requireKey(): string | undefined {
    return this.config.apiKey;
  }

  private async request<T>(path: string, opts: HttpOptions = {}): Promise<{ data: T; status: number }> {
    const controller = new AbortController();
    const to = setTimeout(() => controller.abort(), opts.timeoutMs ?? this.timeoutMs);
    const url = path.startsWith('http') ? path : `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      'content-type': 'application/json',
      // Required headers per confirmed requirements
      'x-application-type': HDR_APPLICATION_TYPE,
      'x-loblaw-tenant-id': HDR_TENANT_ID,
      'accept-language': HDR_ACCEPT_LANGUAGE,
      ...(opts.headers ?? {})
    };
    const res = await fetch(url, {
      method: opts.method ?? 'GET',
      headers,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
      signal: controller.signal
    } as RequestInit);
    clearTimeout(to);
    const status = res.status;
    if (status === 204) return { data: undefined as unknown as T, status };
    const text = await res.text();
    let json: any;
    try {
      json = text ? JSON.parse(text) : {};
    } catch {
      json = {};
    }
    if (!res.ok) {
      const err: any = new Error(`HTTP ${status}`);
      (err.status = status), (err.body = json);
      throw err;
    }
    return { data: json as T, status };
  }

  async listStores(): Promise<StoreDTO[]> {
    const apiKey = this.requireKey();
    if (!apiKey) {
      // No key provided; return empty list per v1 placeholder behavior
      return [];
    }
    try {
      const { data } = await this.request<any>(`/api/v1/pickup-locations?bannerIds=${this.banner}`, {
        method: 'GET',
        headers: { 'X-Apikey': apiKey }
      });
      const arr: any[] = Array.isArray(data) ? data : data?.items ?? [];
      return arr.map((s: any) => ({
        id: String(s.storeId ?? s.id ?? ''),
        name: String(s.name ?? ''),
        address: {
          line1: s.address?.line1 ?? s.address1 ?? s.address ?? '',
          line2: s.address?.line2 ?? undefined,
          town: s.address?.city ?? s.city ?? undefined,
          region: s.address?.province ?? s.province ?? s.region ?? undefined,
          postalCode: s.address?.postalCode ?? s.postalCode ?? undefined,
          country: s.address?.country ?? 'CA'
        },
        geo: s.geoPoint ? { lat: Number(s.geoPoint?.latitude), lon: Number(s.geoPoint?.longitude) } : null,
        pickupType: s.pickupType ?? 'STORE',
        openNow: typeof s.openNow === 'boolean' ? s.openNow : null
      } as StoreDTO));
    } catch (e: any) {
      if (e?.status === 401 || e?.status === 403) return [];
      throw e;
    }
  }

  /**
   * Perform a product search with minimal required payload/headers.
   * - Enforces offerType 'OG', banner 'superstore', accept-language 'en', x-application-type 'Web', x-loblaw-tenant-id 'ONLINE_GROCERIES'.
   * - Uses random UUID for cartId on each request.
   * - pagination.from is computed as 1-based when page/pageSize provided.
   */
  async searchProducts(req: SearchRequestDTO): Promise<ProductDTO[]> {
    const apiKey = this.requireKey();
    if (!apiKey) {
      return [];
    }
    const today = this.ddmmyyyy(new Date());
    const cartId = randomUUID();
    const from = 1 + Math.max(0, (req.page - 1) * Math.max(1, req.pageSize));

    const body: SuperstoreSearchPayload = {
      cart: { cartId },
      fulfillmentInfo: {
        storeId: req.storeId,
        offerType: 'OG',
        // optional/honored by server; uncomment to include
        // pickupType: 'STORE',
        // date: today,
        // timeSlot: null
      },
      listingInfo: { pagination: { from } },
      banner: this.banner,
      searchRelatedInfo: { term: req.term }
    };
    try {
      const { data } = await this.request<any>(`/api/v2/products/search`, {
        method: 'POST',
        headers: { 'x-apikey': apiKey },
        body
      });
      const tiles = this.extractProductTiles(data);
      return tiles.map((t: any) => ({
        code: String(t.productId ?? t.code ?? ''),
        name: String(t.title ?? t.name ?? ''),
        brand: t.brand ?? null,
        description: t.description ?? null,
        image: t.productImage?.url ?? t.image ?? null,
        packageSize: t.packageSize ?? null,
        pricing: {
          current: Number(t.pricing?.price?.value ?? t.pricing?.current ?? 0),
          regular: t.pricing?.wasPrice?.value ?? t.pricing?.regular ?? null
        }
      } as ProductDTO));
    } catch (e: any) {
      if (e?.status === 401 || e?.status === 403) return [];
      if (e?.status === 429) return [];
      throw e;
    }
  }

  async getProductDetails(productId: string, storeId: string): Promise<ProductDTO | null> {
    const apiKey = this.requireKey();
    if (!apiKey) return null;
    const date = this.ddmmyyyy(new Date());
    const qs = new URLSearchParams({
      lang: 'en',
      date,
      pickupType: 'STORE',
      storeId,
      banner: this.banner
    });
    try {
      const { data, status } = await this.request<any>(`/api/v1/products/${encodeURIComponent(productId)}?${qs.toString()}`, {
        method: 'GET',
        headers: { 'x-apikey': apiKey, 'accept-language': 'en' }
      });
      if (status === 204 || !data) return null;
      const dto: ProductDTO = {
        code: String(data.code ?? productId),
        name: String(data.name ?? data.title ?? ''),
        brand: data.brand ?? null,
        description: data.description ?? null,
        image: this.pickPrimaryImage(data),
        packageSize: data.packageSize ?? null,
        uom: data.uom ?? null,
        pricing: this.normalizePricing(data),
        nutrition: data.nutritionFacts ?? null,
        breadcrumbs: Array.isArray(data.breadcrumbs) ? data.breadcrumbs : [],
        variants: Array.isArray(data.variants)
          ? data.variants.map((v: any) => ({ code: String(v.code), name: v.name }))
          : null
      };
      return dto;
    } catch (e: any) {
      if (e?.status === 404) return null;
      if (e?.status === 401 || e?.status === 403) return null;
      throw e;
    }
  }

  private browserHeaders(): Record<string, string> {
    return {
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
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
      'is-helios-account': 'false',
      'is-iceberg-enabled': 'true',
      'sec-ch-ua': '"Chromium";v="140", "Not=A?Brand";v="24", "Brave";v="140"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'x-application-type': 'Web',
      'x-channel': 'web',
      'x-loblaw-tenant-id': 'ONLINE_GROCERIES',
      'x-preview': 'false'
    };
  }

  private extractProductTiles(payload: any): any[] {
    // Try common path
    const comps = payload?.layout?.mainContentCollection?.components;
    if (Array.isArray(comps)) {
      for (const c of comps) {
        const tiles = c?.data?.productTiles;
        if (Array.isArray(tiles)) return tiles;
      }
    }
    // Fallback: deep search for productTiles array
    const found: any[] = [];
    const visit = (obj: any) => {
      if (!obj || typeof obj !== 'object') return;
      for (const k of Object.keys(obj)) {
        const v = obj[k];
        if (k === 'productTiles' && Array.isArray(v)) {
          found.push(...v);
          return;
        }
        if (typeof v === 'object') visit(v);
      }
    };
    visit(payload);
    return found;
  }

  private ddmmyyyy(d: Date): string {
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}${mm}${yyyy}`;
    }

  private pickPrimaryImage(data: any): string | null {
    const assets = data.imageAssets ?? data.images ?? [];
    if (Array.isArray(assets) && assets.length) {
      // Choose the first non-null URL; could enhance to pick largest
      const a = assets.find((x: any) => x?.url) ?? assets[0];
      return a?.url ?? null;
    }
    return data.image ?? null;
  }

  private normalizePricing(data: any): ProductDTO['pricing'] {
    const offer = Array.isArray(data.offers) ? data.offers[0] : undefined;
    const current = offer?.price?.value ?? data.pricing?.current ?? 0;
    const regular = offer?.wasPrice?.value ?? data.pricing?.regular ?? null;
    const unit = data.comparisonPrices?.[0] ?? data.unitPrice ?? null;
    const unitPrice = unit
      ? { value: Number(unit.value ?? unit.price ?? 0), unit: unit.unit ?? unit.uom ?? '', perQuantity: Number(unit.perQuantity ?? 1) }
      : null;
    return { current: Number(current), regular: regular ?? null, unitPrice };
  }
}
