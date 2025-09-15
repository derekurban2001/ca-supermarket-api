import { searchProducts } from '../../../../../src/index';

describe('Use-case: searchProducts (unit, placeholder)', () => {
  it('errors when missing storeId', async () => {
    const res = await searchProducts('milk', '' as unknown as string, 1, 10);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error.type).toBe('invalid-params');
  });
});

