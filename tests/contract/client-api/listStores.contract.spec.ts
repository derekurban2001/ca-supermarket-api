import { listStores } from '../../../src/index';

describe('Contract: listStores', () => {
  it('returns items array of stores', async () => {
    const res = await listStores();
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(Array.isArray(res.value.items)).toBe(true);
    }
  });
});

