export type ProductSummary = {
  id: string;
  name: string;
  brand: string | null;
  imageUrl: string | null;
  packageSize: string | null;
  price: { current: number; regular?: number | null; currency: 'CAD' };
};

export type Pricing = {
  current: number;
  regular: number | null;
  currency: 'CAD';
  unitPrice?: { value: number; unit: string; perQuantity: number } | null;
  promo?: { text?: string; expiresAt?: string } | null;
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
  nutrition: unknown | null;
  breadcrumbs: Array<{ code: string; name: string }>;
  variants?: Array<{ id: string; name?: string }> | null;
};

