import { z } from 'zod';

export const StoreAddressDtoSchema = z
  .object({
    line1: z.string().min(1),
    line2: z.string().optional(),
    town: z.string().optional(),
    region: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional()
  })
  .passthrough();

export const GeoDtoSchema = z
  .object({ lat: z.number().finite(), lon: z.number().finite() })
  .passthrough();

export const StoreDTOSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    address: StoreAddressDtoSchema,
    geo: GeoDtoSchema.nullable().optional(),
    pickupType: z.string().optional(),
    openNow: z.boolean().nullable().optional()
  })
  .passthrough();

