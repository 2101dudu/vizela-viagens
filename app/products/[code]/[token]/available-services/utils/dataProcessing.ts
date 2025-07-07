import { FlightOption, Hotel, RoomWithHotel, Range, LookupMaps } from '../types';

// Create lookup maps for O(1) access
export const createLookupMaps = (
  flightOptions: FlightOption[], 
  hotelLocations: any[]
): LookupMaps => {
  const flightOptionsMap = new Map(
    flightOptions.map(option => [option.OptionCode, option])
  );
  
  const hotelLocationMaps = new Map();
  const roomsMap = new Map();
  
  // Pre-compute all room lookups for all locations
  hotelLocations.forEach(location => {
    const hotels = location.HotelOption?.item || [];
    hotelLocationMaps.set(location.Code, hotels);
    
    hotels.forEach((hotel: Hotel) => {
      hotel.RoomsOccupancy.item.forEach(roomGroup => {
        roomGroup.Rooms.item.forEach(room => {
          const key = `${hotel.Code}-${room.Code}-${room.RoomNum}`;
          roomsMap.set(key, { 
            ...room, 
            hotelCode: hotel.Code, 
            roomGroup: roomGroup.RoomGroup 
          });
        });
      });
    });
  });
  
  return { flightOptionsMap, hotelLocationMaps, roomsMap };
};

// Calculate ranges for filters
export const calculateRanges = (
  flightOptions: FlightOption[], 
  hotelLocations: any[]
): { layoverRange: Range; starRange: Range } => {
  let layoverRange = { min: 0, max: 0 };
  let starRange = { min: 0, max: 0 };
  
  if (flightOptions.length > 0) {
    const allLayovers = flightOptions.flatMap(option =>
      option.FlightSegments.item.flatMap(segment =>
        segment.Flights.item.map(flight => parseInt(flight.NumStopOvers) || 0)
      )
    );
    layoverRange = {
      min: Math.min(...allLayovers),
      max: Math.max(...allLayovers)
    };
  }
  
  if (hotelLocations.length > 0) {
    const allStars = hotelLocations.flatMap(location => 
      (location.HotelOption?.item || []).map((hotel: Hotel) => parseInt(hotel.Rating) || 0)
    );
    if (allStars.length > 0) {
      starRange = {
        min: Math.min(...allStars),
        max: Math.max(...allStars)
      };
    }
  }
  
  return { layoverRange, starRange };
};

// Calculate star range for a specific location
export const calculateLocationStarRange = (hotelLocation: any): Range => {
  const hotels = hotelLocation?.HotelOption?.item || [];
  if (hotels.length === 0) {
    return { min: 0, max: 0 };
  }
  
  const stars = hotels.map((hotel: Hotel) => parseInt(hotel.Rating) || 0);
  return {
    min: Math.min(...stars),
    max: Math.max(...stars)
  };
};

// Filter functions
export const filterFlightOptions = (
  flightOptions: FlightOption[], 
  selectedLayovers: number[]
): FlightOption[] => {
  if (selectedLayovers.length === 0) return flightOptions;
  
  const selectedLayoverSet = new Set(selectedLayovers);
  
  return flightOptions.filter(option => {
    return option.FlightSegments.item.some(segment =>
      segment.Flights.item.some(flight =>
        selectedLayoverSet.has(parseInt(flight.NumStopOvers) || 0)
      )
    );
  });
};

export const filterHotels = (
  hotels: Hotel[], 
  selectedStars: number[]
): Hotel[] => {
  if (selectedStars.length === 0) return hotels;
  
  const selectedStarSet = new Set(selectedStars);
  
  return hotels.filter(hotel => {
    return selectedStarSet.has(parseInt(hotel.Rating) || 0);
  });
};
