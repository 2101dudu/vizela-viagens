import { DynOptional } from '../products/[code]/[token]/available-services/types';
import { API_BASE_URL } from "@/app/config";

export default async function FetchOptionals(
  sessionHash: string,
  prodCode: string
): Promise<DynOptional[]> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/dynamic/product/optionals?` +
      `sessionHash=${sessionHash}&prodCode=${prodCode}`,
      { method: "GET" }
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch optional services: ${res.statusText}`);
    }

    const data = await res.json();
    return data.Optionals?.item || [];
  } catch (error) {
    console.error('Error fetching optionals:', error);
    throw error;
  }
}
