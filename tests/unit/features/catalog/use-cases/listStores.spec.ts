import { listStores } from '../../../../../src/index';

describe('Use-case: listStores (unit, placeholder)', () => {
  it('returns ok with items array', async () => {
    const res = await listStores();
    expect(res.ok).toBe(true);
    if (res.ok) expect(Array.isArray(res.value.items)).toBe(true);
  });
});

