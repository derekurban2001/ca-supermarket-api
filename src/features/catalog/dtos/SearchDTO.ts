// Search request input used by the datasource and repository
// - term and storeId are required (contract requirement: store-scoped search)
// - page/pageSize control client-side paging; translated to pagination.from (>= 1) for upstream
export type SearchRequestDTO = {
  term: string;
  storeId: string;
  page: number;
  pageSize: number;
};

export type ProductTileDTO = {
  productId: string;
  title: string;
  brand?: string;
  image?: string | null;
  packageSize?: string | null;
  pricing?: { current: number; regular?: number | null };
};
