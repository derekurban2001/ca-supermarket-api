import { z } from 'zod';

export const StoreAddressSchema = z
  .object({
    line1: z.string().min(1),
    line2: z.string().optional(),
    town: z.string().optional(),
    region: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional()
  })
  .passthrough();

export const GeoSchema = z
  .object({ lat: z.number().finite(), lon: z.number().finite() })
  .passthrough();

export const StoreSummarySchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    address: StoreAddressSchema,
    geo: GeoSchema.nullable(),
    pickupType: z.string(),
    openNow: z.boolean().nullable()
  })
  .passthrough();

