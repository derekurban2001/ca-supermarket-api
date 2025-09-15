export type StoreDTO = {
  id: string;
  name: string;
  address: { line1: string; line2?: string; town?: string; region?: string; postalCode?: string; country?: string };
  geo?: { lat: number; lon: number } | null;
  pickupType?: string;
  openNow?: boolean | null;
};

