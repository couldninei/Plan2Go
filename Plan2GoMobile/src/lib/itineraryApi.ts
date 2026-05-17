import { API_BASE } from './baseUrl';

export interface GenerateItineraryPayload {
  destination: string;
  budget: number;
  days: number;
  interests: string[];
}

export interface Itinerary {
  destination: string;
  budget: number;
  currency: string;
  total_estimated_cost: number;
  hotel?: any;
  days: any[];
  [key: string]: any;
}

export async function generateItinerary(
  payload: GenerateItineraryPayload
): Promise<Itinerary> {
  const res = await fetch(`${API_BASE}/generate-itinerary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({} as any));
    const message =
      (errorData as any).errors?.join(', ') ||
      (errorData as any).error ||
      `Request failed (${res.status})`;
    throw new Error(message);
  }

  return res.json();
}

export async function pingBackend(): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/test`);
  if (!res.ok) throw new Error('Backend not responding');
  return res.json();
}
