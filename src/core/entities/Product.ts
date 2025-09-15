import type { Nutrition } from './Nutrition';
import type { Pricing } from './Pricing';

export type ProductSummary = {
  id: string;
  name: string;
  brand: string | null;
  imageUrl: string | null;
  packageSize: string | null;
  price: { current: number; regular?: number | null; currency: 'CAD' };
};

export type ProductDetail = {
  id: string;
  name: string;
  brand: string | null;
  description: string | null;
  imageUrl: string | null;
  packageSize: string | null;
  uom: string | null;
  pricing: Pricing;
  nutrition: Nutrition | null;
  breadcrumbs: Array<{ code: string; name: string }>;
  variants?: Array<{ id: string; name?: string }> | null;
};
