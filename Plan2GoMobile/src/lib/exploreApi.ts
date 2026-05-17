import { API_BASE } from './baseUrl';

export interface ExploreFilters {
  type?: string;
  city?: string;
  search?: string;
}

export interface ExploreItem {
  id: string;
  type: string;
  name: string;
  city: string;
  country: string;
  description: string;
  rating: number;
  price: number;
  priceUnit?: string;
  meta?: Record<string, any>;
  [key: string]: any;
}

export interface ExploreResponse {
  currency: string;
  count: number;
  items: ExploreItem[];
}

export interface FiltersResponse {
  cities: string[];
}

export async function getExploreItems(
  filters: ExploreFilters = {}
): Promise<ExploreResponse> {

  const params: string[] = [];
  if (filters.type && filters.type !== 'all') {
    params.push(`type=${encodeURIComponent(filters.type)}`);
  }
  if (filters.city && filters.city !== 'all') {
    params.push(`city=${encodeURIComponent(filters.city)}`);
  }
  if (filters.search) {
    params.push(`search=${encodeURIComponent(filters.search)}`);
  }
  const qs = params.length ? `?${params.join('&')}` : '';

  const res = await fetch(`${API_BASE}/explore${qs}`);
  if (!res.ok) throw new Error('Failed to load explore items');
  return res.json();
}

export async function getExploreFilters(): Promise<FiltersResponse> {
  const res = await fetch(`${API_BASE}/explore/filters`);
  if (!res.ok) throw new Error('Failed to load filter options');
  return res.json();
}
