export type ProductDTO = {
  code: string;
  name: string;
  brand?: string;
  description?: string;
  image?: string | null;
  packageSize?: string | null;
  uom?: string | null;
  pricing?: { current: number; regular?: number | null; unitPrice?: { value: number; unit: string; perQuantity: number } | null };
  nutrition?: unknown | null;
  breadcrumbs?: Array<{ code: string; name: string }>;
  variants?: Array<{ code: string; name?: string }> | null;
};

