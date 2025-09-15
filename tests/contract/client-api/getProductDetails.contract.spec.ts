import { getProductDetails, listStores, searchProducts } from '../../../src/index';

describe('Contract: getProductDetails', () => {
  it('requires storeId and productId', async () => {
    const res = await getProductDetails('', '');

    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error.type).toBe('invalid-params');
  });

  it('fetches product details for a known product (live)', async () => {
    const stores = await listStores();
    expect(stores.ok).toBe(true);
    if (!stores.ok || stores.value.items.length === 0) return;

    const storeId = stores.value.items[0].id;
    const search = await searchProducts('Toilet paper', storeId, 1, 5);
    expect(search.ok).toBe(true);
    if (!search.ok || search.value.items.length === 0) return;

    const productId = search.value.items[0].id;
    const res = await getProductDetails(productId, storeId);

    expect(res.ok).toBe(true);
    if (!res.ok) return;

    expect(res.value).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        pricing: expect.objectContaining({ currency: 'CAD' })
      })
    );
  });

  it('returns not-found when product is unavailable at the store (live)', async () => {
    const stores = await listStores();
    expect(stores.ok).toBe(true);
    if (!stores.ok || stores.value.items.length === 0) return;

    const storeId = stores.value.items[0].id;
    const res = await getProductDetails('NOTAREALPRODUCT123456', storeId);

    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error.type).toBe('not-found');
  });
});
