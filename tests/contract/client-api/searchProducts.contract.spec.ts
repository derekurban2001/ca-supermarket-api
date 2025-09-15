import { createClient, listStores, searchProducts } from '../../../src/index';
import type { SupermarketRepository } from '@core/ports/SupermarketRepository';

describe('Contract: searchProducts', () => {
  it('requires storeId and user-specified pagination', async () => {
    const res = await searchProducts('milk', '' as unknown as string, 1, 10);

    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.type).toBe('invalid-params');
      expect(res.error.message).toContain('storeId');
    }
  });

  it('returns stable shape with items, page, pageSize, total (live)', async () => {
    const stores = await listStores();
    expect(stores.ok).toBe(true);
    if (!stores.ok || stores.value.items.length === 0) return;

    const storeId = stores.value.items[0].id;
    const res = await searchProducts('Toilet paper', storeId, 1, 10);

    expect(res.ok).toBe(true);
    if (!res.ok) return;

    expect(Array.isArray(res.value.items)).toBe(true);
    expect(res.value.page).toBe(1);
    expect(res.value.pageSize).toBe(10);
    expect(res.value).toHaveProperty('total');

    const first = res.value.items[0];
    if (first) {
      expect(first).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
          price: expect.objectContaining({
            current: expect.any(Number),
            currency: 'CAD'
          })
        })
      );
    }
  });

  it('returns stable ordering for identical inputs (mock repository)', async () => {
    const repo: SupermarketRepository = {
      async searchProducts() {
        return {
          ok: true as const,
          value: {
            items: [
              { id: 'B', name: 'B', brand: null, imageUrl: null, packageSize: null, price: { current: 2, currency: 'CAD' as const } },
              { id: 'A', name: 'A', brand: null, imageUrl: null, packageSize: null, price: { current: 1, currency: 'CAD' as const } }
            ],
            page: 1,
            pageSize: 10,
            total: 2
          }
        };
      },
      async listStores() {
        return { ok: true as const, value: { items: [] } };
      },
      async getProductDetails() {
        return {
          ok: true as const,
          value: {
            id: 'X',
            name: 'X',
            brand: null,
            description: null,
            imageUrl: null,
            packageSize: null,
            uom: null,
            pricing: { current: 0, regular: null, currency: 'CAD' as const },
            nutrition: null,
            breadcrumbs: [],
            variants: null
          }
        };
      }
    };

    const client = createClient({ repository: repo });
    const first = await client.searchProducts('milk', '1234', 1, 10);
    const second = await client.searchProducts('milk', '1234', 1, 10);

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
    if (first.ok && second.ok) {
      expect(first.value.items).toEqual(second.value.items);
    }
  });
});
