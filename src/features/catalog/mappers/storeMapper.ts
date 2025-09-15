import type { StoreDTO } from '../dtos/StoreDTO';
import type { StoreSummary } from '@core/entities/Store';

export const toStoreSummary = (dto: StoreDTO): StoreSummary => ({
  id: dto.id,
  name: dto.name,
  address: dto.address,
  geo: dto.geo ?? null,
  pickupType: dto.pickupType ?? 'STORE',
  openNow: dto.openNow ?? null
});

