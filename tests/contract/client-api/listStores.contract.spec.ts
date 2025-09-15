import { listStores } from '../../../src/index';

describe('Contract: listStores', () => {
  it('returns items array of stores with required fields (live)', async () => {
    const res = await listStores();

    expect(res.ok).toBe(true);
    if (!res.ok) return;

    expect(Array.isArray(res.value.items)).toBe(true);
    const first = res.value.items[0];
    if (first) {
      expect(first).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
          address: expect.objectContaining({ line1: expect.any(String) })
        })
      );
    }
  });
});
