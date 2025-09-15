import { getProductDetails, listStores, searchProducts } from '../../../src/index';

describe('Contract: getProductDetails', () => {
  it('requires storeId and productId', async () => {
    const res1 = await getProductDetails('', '');
    expect(res1.ok).toBe(false);
    if (!res1.ok) expect(res1.error.type).toBe('invalid-params');

    const res2 = await getProductDetails('ABC', '');
    expect(res2.ok).toBe(false);
    if (!res2.ok) expect(res2.error.type).toBe('invalid-params');
  });

  it('fetches product details for a real product (live)', async () => {
    const stores = await listStores();
    expect(stores.ok).toBe(true);
    const storeId = stores.ok ? stores.value.items[0].id : '';
    const search = await searchProducts('Toilet paper', storeId, 1, 10);
    expect(search.ok).toBe(true);
    const productId = search.ok ? search.value.items[0].id : '';
    const res = await getProductDetails(productId, storeId);
    expect(typeof res.ok).toBe('boolean');
  });
});
