export interface SetServicesPayload {  
    SessionHash: string;
    FlightsSelected: {
        item: Array<{
            OptionCode: string;
            SegmentLists: {
                item: Array<{
                    SegmentCode: string;
                    FlightGroupCode: string;
                }>;
            };
        }>;
    };
    HotelsSelected: {
        item: Array<{
            ItineraryCode: string;
            HotelSelected: string;
            RoomsSelected: {
                item: Array<{
                    RoomNum: string;
                    RoomCode: string;
                }>;
            };
        }>;
    };
}

export default async function SetProductServices(payload: SetServicesPayload) {
    const res = await fetch("http://localhost:8080/api/dynamic/product/set-services", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" }
    });
    
    if (!res.ok) {
        throw new Error("Failed to fetch product ID");
    }
    const data = await res.json();
    if (!data) {
        throw new Error("Invalid response from server");
    }
    return data;
}