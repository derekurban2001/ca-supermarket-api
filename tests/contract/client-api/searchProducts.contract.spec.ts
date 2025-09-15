import { listStores, searchProducts } from '../../../src/index';

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
});
