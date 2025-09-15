import { getProductDetails } from '../../../../../src/index';

describe('Use-case: getProductDetails (unit, placeholder)', () => {
  it('errors when missing ids', async () => {
    const res = await getProductDetails('', '' as unknown as string);
    expect(res.ok).toBe(false);
  });
});

