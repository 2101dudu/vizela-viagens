import { API_BASE_URL } from "@/app/config";

interface RoomTypeOption {
    roomNum: string;
    code: string;
    childAges?: string;
}

interface RoomTypeOptionArray {
    item: RoomTypeOption[];
}

interface Local {
    code: string;
    nights: string;
}

interface LocalArray {
    item: Local[];
}

export interface SearchProducts {
  productCode: string;
  departureDate: string;
  departureLocal: string;
  extraNights?: string;
  roomTypes: RoomTypeOptionArray;
  baseLocals?: LocalArray;
}


export default async function FetchProductID(payload: SearchProducts) {
    const res = await fetch(`${API_BASE_URL}/dynamic/product/available-services`, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" }
    });
    
    if (!res.ok) {
        throw new Error("Failed to fetch product ID");
    }
    const data = await res.json();
    if (!data || !data.searchId) {
        throw new Error("Invalid response from server");
    }
    return data.searchId;
}