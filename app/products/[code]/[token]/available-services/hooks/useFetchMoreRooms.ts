import { RoomWithGroup } from '../types';

export default async function FetchMoreRooms(token: string, cursor: number, limit: number = 5) {
  const url = new URL("http://192.168.1.120:8080/api/dynamic/product/available-services/hotels/rooms/page");
  url.searchParams.set("token", token);
  url.searchParams.set("cursor", cursor.toString());
  url.searchParams.set("limit", limit.toString());

  const res = await fetch(url.toString(), {
    method: "GET",
  });

  if (!res.ok) throw new Error("Failed to fetch more rooms");

  const data = await res.json();
  return {
    rooms: data.rooms as RoomWithGroup[],
    hasMore: data.hasMore,
  };
}
