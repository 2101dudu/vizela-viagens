import { FlightOption } from '../types';
import { API_BASE_URL } from "@/app/config";

export default async function FetchMoreFlights(token: string, cursor: number, limit: number = 5) {
  const url = new URL(`${API_BASE_URL}/dynamic/product/available-services/flights/page`);
  url.searchParams.set("token", token);
  url.searchParams.set("cursor", cursor.toString());
  url.searchParams.set("limit", limit.toString());

  const res = await fetch(url.toString(), {
    method: "GET",
  });

  if (!res.ok) throw new Error("Failed to fetch more flights");

  const data = await res.json();
  return {
    flights: data.flights as FlightOption[],
    hasMore: data.hasMore,
  };
}
