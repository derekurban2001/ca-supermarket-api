import { toStoreSummary } from '@features/catalog/mappers/storeMapper';
import type { StoreDTO } from '@features/catalog/dtos/StoreDTO';

describe('storeMapper', () => {
  it('maps dto to store summary with defaults', () => {
    const dto: StoreDTO = {
      id: '1234',
      name: 'Main St Superstore',
      address: {
        line1: '123 Main St',
        town: 'Calgary',
        region: 'AB',
        postalCode: 'T1X1X1',
        country: 'CA'
      },
      geo: { lat: 51.1, lon: -114.1 },
      pickupType: 'STORE',
      openNow: true
    };

    const mapped = toStoreSummary(dto);

    expect(mapped).toEqual({
      id: '1234',
      name: 'Main St Superstore',
      address: dto.address,
      geo: { lat: 51.1, lon: -114.1 },
      pickupType: 'STORE',
      openNow: true
    });
  });

  it('normalizes optional fields to null defaults', () => {
    const mapped = toStoreSummary({
      id: '1234',
      name: 'Store',
      address: { line1: '123 Main St' }
    });

    expect(mapped).toEqual({
      id: '1234',
      name: 'Store',
      address: { line1: '123 Main St' },
      geo: null,
      pickupType: 'STORE',
      openNow: null
    });
  });
});
