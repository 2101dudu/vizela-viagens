import { Hotel } from '../types';

export default async function FetchMoreHotels(token: string, cursor: number, limit: number = 5) {
  const url = new URL("http://192.168.1.120:8080/api/dynamic/product/available-services/hotels/page");
  url.searchParams.set("token", token);
  url.searchParams.set("cursor", cursor.toString());
  url.searchParams.set("limit", limit.toString());

  const res = await fetch(url.toString(), {
    method: "GET",
  });

  if (!res.ok) throw new Error("Failed to fetch more hotels");

  const data = await res.json();
  return {
    hotels: data.hotels as Hotel[],
    hasMore: data.hasMore,
  };
}
