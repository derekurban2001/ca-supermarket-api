import type { SearchRequestDTO } from '../dtos/SearchDTO';
import type { ProductDTO } from '../dtos/ProductDTO';
import type { StoreDTO } from '../dtos/StoreDTO';
import { ProductDTOSchema } from '../dtos/schemas/ProductDTOSchema';
import { StoreDTOSchema } from '../dtos/schemas/StoreDTOSchema';
import { randomUUID } from 'node:crypto';

/**
 * Error thrown when the upstream API rejects authentication.
 */
export class SuperstoreAuthError extends Error {
  /**
   * @param code Category of authentication failure.
   * @param message Description used for the thrown error.
   */
  constructor(public readonly code: 'missing-key' | 'invalid-key', message: string) {
    super(message);
    this.name = 'SuperstoreAuthError';
  }

  /**
   * Build an error representing missing credentials.
   * @returns Instance tagged with missing-key.
   */
  static missing(): SuperstoreAuthError {
    return new SuperstoreAuthError(
      'missing-key',
      'Superstore API key is required. Set SUPERSTORE_API_KEY in the environment or provide superstore.apiKey when creating the client.'
    );
  }

  /**
   * Build an error representing rejected credentials.
   * @param status HTTP status returned by the upstream API.
   * @returns Instance tagged with invalid-key.
   */
  static invalid(status: number): SuperstoreAuthError {
    return new SuperstoreAuthError(
      'invalid-key',
      `Superstore API responded with status ${status}. Verify SUPERSTORE_API_KEY is present and valid.`
    );
  }
}const HDR_APPLICATION_TYPE = 'Web';
const HDR_TENANT_ID = 'ONLINE_GROCERIES';
const HDR_ACCEPT_LANGUAGE = 'en';

type SuperstoreSearchPayload = {
  cart: { cartId: string };
  fulfillmentInfo: {
    storeId: string;
    pickupType?: 'STORE';
    offerType: 'OG';
    date?: string;
    timeSlot?: null;
  };
  listingInfo?: { pagination?: { from: number } };
  banner: 'superstore';
  searchRelatedInfo: { term: string };
};

export type SuperstoreConfig = {
  apiKey?: string;
  baseUrl?: string;
  banner?: 'superstore';
  timeoutMs?: number;
};

type HttpOptions = {
  method?: 'GET' | 'POST';
  headers?: Record<string, string>;
  body?: unknown;
  timeoutMs?: number;
};

interface HttpError extends Error {
  status?: number;
  body?: unknown;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const toOptionalString = (value: unknown): string | null => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return null;
};

const toOptionalNumber = (value: unknown): number | null => {
  const asString = toOptionalString(value);
  if (asString === null) return null;
  const parsed = Number(asString);
  return Number.isFinite(parsed) ? parsed : null;
};

const toBooleanOrNull = (value: unknown): boolean | null => (typeof value === 'boolean' ? value : null);

const toRecordArray = (value: unknown): Record<string, unknown>[] => {
  if (Array.isArray(value)) {
    return value.filter(isRecord);
  }
  if (isRecord(value) && Array.isArray(value.items)) {
    return value.items.filter(isRecord);
  }
  return [];
};

const coerceVariants = (value: unknown): Array<{ code: string; name?: string }> | null => {
  if (!Array.isArray(value) || value.length === 0) return null;
  const variants = value
    .map(item => {
      if (!isRecord(item)) return null;
      const code = toOptionalString(item.code);
      if (!code) return null;
      const name = toOptionalString(item.name) ?? undefined;
      const result: { code: string; name?: string } = name !== undefined ? { code, name } : { code };
      return result;
    })
    .filter((entry): entry is { code: string; name?: string } => entry !== null);
  return variants.length ? variants : null;
};

const coerceBreadcrumbs = (value: unknown): Array<{ code: string; name: string }> => {
  if (!Array.isArray(value)) return [];
  return value
    .map(item => {
      if (!isRecord(item)) return null;
      const code = toOptionalString(item.code);
      const name = toOptionalString(item.name);
      if (!code || !name) return null;
      return { code, name };
    })
    .filter((entry): entry is { code: string; name: string } => entry !== null);
};

const toGeo = (value: unknown): { lat: number; lon: number } | null => {
  if (!isRecord(value)) return null;
  const lat = toOptionalNumber(value.latitude ?? value.lat);
  const lon = toOptionalNumber(value.longitude ?? value.lon);
  if (lat === null || lon === null) return null;
  return { lat, lon };
};

/**
 * Datasource responsible for calling the live Superstore endpoints.
 */
export class SuperstoreApiDatasource {
  private baseUrl: string;
  private banner: 'superstore';
  private timeoutMs: number;

  /**
   * @param config Optional datasource configuration overrides.
   */
  constructor(private readonly config: SuperstoreConfig = {}) {
    this.baseUrl = config.baseUrl ?? 'https://api.pcexpress.ca/pcx-bff';
    this.banner = config.banner ?? 'superstore';
    this.timeoutMs = config.timeoutMs ?? 10000;
  }

  /**
   * Read the API key from configuration or environment and enforce presence.
   * @throws {SuperstoreAuthError} When the API key is missing or blank.
   * @returns Non-empty API key string.
   */
  private requireKey(): string {
    const key = this.config.apiKey ?? process.env.SUPERSTORE_API_KEY;
    if (!key || key.trim().length === 0) {
      throw SuperstoreAuthError.missing();
    }
    return key;
  }

  /**
   * Perform an HTTP request with Superstore defaults and JSON handling.
   * @param path Relative or absolute request path.
   * @param opts Method, headers, body and timeout overrides.
   * @returns Parsed JSON body and HTTP status code.
   */
  private async request<T>(path: string, opts: HttpOptions = {}): Promise<{ data: T; status: number }> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), opts.timeoutMs ?? this.timeoutMs);
    const url = path.startsWith('http') ? path : `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      'content-type': 'application/json',
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
    clearTimeout(timeout);
    const status = res.status;
    if (status === 204) return { data: undefined as unknown as T, status };
    const text = await res.text();
    let json: unknown;
    try {
      json = text ? JSON.parse(text) : {};
    } catch {
      json = {};
    }
    if (!res.ok) {
      const err: HttpError = new Error(`HTTP ${status}`);
      err.status = status;
      err.body = json;
      throw err;
    }
    return { data: json as T, status };
  }

  /**
   * Extract HTTP status from an error value thrown by fetch.
   * @param error Arbitrary thrown error value.
   * @returns Numeric HTTP status when available.
   */
  private extractStatus(error: unknown): number | undefined {
    if (isRecord(error) && typeof error.status === 'number') {
      return error.status;
    }
    if ((error as HttpError | undefined)?.status && typeof (error as HttpError).status === 'number') {
      return (error as HttpError).status;
    }
    return undefined;
  }

  /**
   * Convert upstream 401/403 errors into typed authentication errors.
   * @param error Arbitrary error thrown by a request.
   * @throws {SuperstoreAuthError} When the upstream indicates unauthorized/forbidden.
   */
  private throwIfUnauthorized(error: unknown): void {
    const status = this.extractStatus(error);
    if (status !== undefined && (status === 401 || status === 403)) {
      throw SuperstoreAuthError.invalid(status);
    }
  }

  /**
   * Retrieve all Superstore pickup locations.
   * @returns Promise resolving with normalized store DTOs.
   */
  async listStores(): Promise<StoreDTO[]> {
    const apiKey = this.requireKey();
    try {
      const { data } = await this.request<unknown>(`/api/v1/pickup-locations?bannerIds=${this.banner}`, {
        method: 'GET',
        headers: { 'x-apikey': apiKey }
      });
      return toRecordArray(data).map(store => StoreDTOSchema.parse(this.toStore(store)));
    } catch (error) {
      this.throwIfUnauthorized(error);
      throw error;
    }
  }

  /**
   * Execute a product search scoped to a specific store.
   * @param req Search inputs including term, pagination, and store scope.
   * @returns Promise resolving with normalized product DTOs.
   */
  async searchProducts(req: SearchRequestDTO): Promise<ProductDTO[]> {
    const apiKey = this.requireKey();
    const cartId = randomUUID();
    const from = 1 + Math.max(0, (req.page - 1) * Math.max(1, req.pageSize));
    const body: SuperstoreSearchPayload = {
      cart: { cartId },
      fulfillmentInfo: {
        storeId: req.storeId,
        offerType: 'OG'
      },
      listingInfo: { pagination: { from } },
      banner: this.banner,
      searchRelatedInfo: { term: req.term }
    };
    try {
      const { data } = await this.request<unknown>(`/api/v2/products/search`, {
        method: 'POST',
        headers: { 'x-apikey': apiKey },
        body
      });
      const tiles = this.extractProductTiles(data);
      return tiles.map(tile => ProductDTOSchema.parse(this.toProductSummary(tile)));
    } catch (error) {
      const status = this.extractStatus(error);
      if (status === 429) return [];
      this.throwIfUnauthorized(error);
      throw error;
    }
  }

  /**
   * Load detailed product information for a given store/product pair.
   * @param productId Chain-wide product identifier.
   * @param storeId Store scope for the lookup.
   * @returns Promise resolving with a normalized product DTO or null when not carried.
   */
  async getProductDetails(productId: string, storeId: string): Promise<ProductDTO | null> {
    const apiKey = this.requireKey();
    const qs = new URLSearchParams({
      lang: 'en',
      date: this.ddmmyyyy(new Date()),
      pickupType: 'STORE',
      storeId,
      banner: this.banner
    });
    try {
      const { data, status } = await this.request<unknown>(
        `/api/v1/products/${encodeURIComponent(productId)}?${qs.toString()}`,
        {
          method: 'GET',
          headers: { 'x-apikey': apiKey, 'accept-language': 'en' }
        }
      );
      if (status === 204 || !data) return null;
      return ProductDTOSchema.parse(this.toProductDetail(data, productId));
    } catch (error) {
      const status = this.extractStatus(error);
      if (status === 404) return null;
      this.throwIfUnauthorized(error);
      throw error;
    }
  }

  private toStore(record: Record<string, unknown>): StoreDTO {
    const addressRecord = isRecord(record.address) ? record.address : {};
    const geoRecord = isRecord(record.geoPoint) ? record.geoPoint : null;
    return {
      id: toOptionalString(record.storeId ?? record.id) ?? '',
      name: toOptionalString(record.name) ?? '',
      address: {
        line1: toOptionalString(addressRecord.line1 ?? record.address1 ?? record.address) ?? '',
        line2: toOptionalString(addressRecord.line2 ?? record.address2) ?? undefined,
        town: toOptionalString(addressRecord.city ?? record.city) ?? undefined,
        region: toOptionalString(addressRecord.province ?? record.province ?? record.region) ?? undefined,
        postalCode: toOptionalString(addressRecord.postalCode ?? record.postalCode) ?? undefined,
        country: toOptionalString(addressRecord.country) ?? 'CA'
      },
      geo: toGeo(geoRecord),
      pickupType: toOptionalString(record.pickupType) ?? 'STORE',
      openNow: toBooleanOrNull(record.openNow)
    };
  }

  private toProductSummary(record: Record<string, unknown>): ProductDTO {
    const pricingRecord = isRecord(record.pricing) ? record.pricing : {};
    const priceNode = isRecord(pricingRecord.price) ? pricingRecord.price : {};
    const wasNode = isRecord(pricingRecord.wasPrice) ? pricingRecord.wasPrice : {};
    const imageRecord = isRecord(record.productImage) ? record.productImage : {};
    const current =
      toOptionalNumber(priceNode.value ?? pricingRecord.current ?? record.currentPrice) ?? 0;
    const regular =
      toOptionalNumber(wasNode.value ?? pricingRecord.regular ?? record.regularPrice) ?? null;
    const image =
      toOptionalString(imageRecord.url) ?? toOptionalString(record.image) ?? toOptionalString(record.primaryImage);
    return {
      code: toOptionalString(record.productId ?? record.code) ?? '',
      name: toOptionalString(record.title ?? record.name) ?? '',
      brand: toOptionalString(record.brand) ?? undefined,
      description: toOptionalString(record.description) ?? undefined,
      image: image ?? null,
      packageSize: toOptionalString(record.packageSize) ?? null,
      pricing: {
        current,
        regular,
        unitPrice: undefined
      }
    };
  }

  private extractProductTiles(payload: unknown): Record<string, unknown>[] {
    const found: Record<string, unknown>[] = [];
    const visit = (value: unknown): void => {
      if (Array.isArray(value)) {
        value.forEach(visit);
        return;
      }
      if (!isRecord(value)) return;
      if (Array.isArray(value.productTiles)) {
        found.push(...toRecordArray(value.productTiles));
      }
      for (const child of Object.values(value)) {
        visit(child);
      }
    };
    visit(payload);
    return found;
  }

  private toProductDetail(value: unknown, fallbackId: string): ProductDTO {
    const record = isRecord(value) ? value : {};
    return {
      code: toOptionalString(record.code) ?? fallbackId,
      name: toOptionalString(record.name ?? record.title) ?? '',
      brand: toOptionalString(record.brand) ?? undefined,
      description: toOptionalString(record.description) ?? undefined,
      image: this.pickPrimaryImage(record),
      packageSize: toOptionalString(record.packageSize) ?? null,
      uom: toOptionalString(record.uom) ?? null,
      pricing: this.normalizePricing(record),
      nutrition: record.nutritionFacts ?? null,
      breadcrumbs: coerceBreadcrumbs(record.breadcrumbs),
      variants: coerceVariants(record.variants)
    };
  }

  private pickPrimaryImage(record: Record<string, unknown>): string | null {
    const assets = toRecordArray(record.imageAssets ?? record.images);
    if (assets.length > 0) {
      const withUrl = assets.find(item => toOptionalString(item.url));
      if (withUrl) {
        return toOptionalString(withUrl.url);
      }
      const first = assets[0];
      return toOptionalString(first.url);
    }
    return toOptionalString(record.image);
  }

  private normalizePricing(record: Record<string, unknown>): ProductDTO['pricing'] {
    const offers = Array.isArray(record.offers) ? record.offers.filter(isRecord) : [];
    const offer = (offers[0] ?? null) as Record<string, unknown> | null;
    const offerPrice = offer && isRecord(offer.price) ? offer.price : undefined;
    const offerWas = offer && isRecord(offer.wasPrice) ? offer.wasPrice : undefined;
    const dtoPricing = isRecord(record.pricing) ? record.pricing : {};
    const current = toOptionalNumber(offerPrice?.value ?? dtoPricing.current) ?? 0;
    const regular = toOptionalNumber(offerWas?.value ?? dtoPricing.regular) ?? null;
    const comparisonPrices = Array.isArray(record.comparisonPrices)
      ? record.comparisonPrices.filter(isRecord)
      : [];
    const unit = (comparisonPrices[0] ?? null) as Record<string, unknown> | null;
    const unitValue = unit ? toOptionalNumber((unit as Record<string, unknown>).value ?? (unit as Record<string, unknown>).price) : null;
    const unitPrice = unit && unitValue !== null
      ? {
          value: unitValue,
          unit: toOptionalString((unit as Record<string, unknown>).unit ?? (unit as Record<string, unknown>).uom) ?? '',
          perQuantity: toOptionalNumber((unit as Record<string, unknown>).perQuantity) ?? 1
        }
      : null;
    return { current, regular, unitPrice };
  }

  private ddmmyyyy(date: Date): string {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}${mm}${yyyy}`;
  }
}










