import { useState, useMemo, useCallback } from 'react';
import { 
  BookingState, 
  FlightFilters, 
  HotelFilters, 
  FlightOption,
  LookupMaps,
  ProductData
} from '../types';
import { 
  createLookupMaps, 
  calculateRanges, 
  filterFlightOptions, 
  filterHotels 
} from '../utils/dataProcessing';
import { calculateFlightPrice, calculateRoomPrice, calculateInsurancePrice } from '../utils/formatters';

export const useBookingState = () => {
  const [bookingState, setBookingState] = useState<BookingState>({
    currentTab: 'flights',
    currentHotelIndex: 0,
    selectedFlight: null,
    selectedHotels: {},
    selectedInsurance: 'included'
  });

  const [selectedFlights, setSelectedFlights] = useState<{[optionCode: string]: {[segmentCode: string]: string}}>({});

  return {
    bookingState,
    setBookingState,
    selectedFlights,
    setSelectedFlights
  };
};

export const useFilters = () => {
  const [flightFilters, setFlightFilters] = useState<FlightFilters>({
    selectedLayovers: []
  });
  
  // Change to location-specific hotel filters
  const [hotelFilters, setHotelFilters] = useState<{[locationCode: string]: HotelFilters}>({});

  const updateFlightFilters = useCallback((newFilters: FlightFilters) => {
    setFlightFilters(newFilters);
  }, []);

  const updateHotelFilters = useCallback((locationCode: string, newFilters: HotelFilters) => {
    setHotelFilters(prev => ({
      ...prev,
      [locationCode]: newFilters
    }));
  }, []);

  // Helper to get filters for a specific location
  const getHotelFiltersForLocation = useCallback((locationCode: string): HotelFilters => {
    return hotelFilters[locationCode] || { selectedStars: [] };
  }, [hotelFilters]);

  return {
    flightFilters,
    hotelFilters,
    updateFlightFilters,
    updateHotelFilters,
    getHotelFiltersForLocation
  };
};

export const useDataProcessing = (productData: ProductData | null) => {
  // Memoize base data arrays
  const baseData = useMemo(() => {
    const flightOptions = productData?.data?.FlightMainGroup?.item?.[0]?.FlightOptionsSuperBB?.item || [];
    const hotelLocations = productData?.data?.Itinerary?.item || [];
    
    return { flightOptions, hotelLocations };
  }, [productData]);

  // Create lookup maps
  const lookupMaps = useMemo(() => {
    return createLookupMaps(baseData.flightOptions, baseData.hotelLocations);
  }, [baseData]);

  // Calculate ranges
  const ranges = useMemo(() => {
    return calculateRanges(baseData.flightOptions, baseData.hotelLocations);
  }, [baseData]);

  return {
    baseData,
    lookupMaps,
    ranges
  };
};

export const useFilteredData = (
  baseData: { flightOptions: FlightOption[], hotelLocations: any[] },
  flightFilters: FlightFilters,
  currentLocationFilters: HotelFilters,
  currentHotelIndex: number
) => {
  return useMemo(() => {
    const filteredFlightOptions = filterFlightOptions(
      baseData.flightOptions, 
      flightFilters.selectedLayovers
    );

    const currentLocation = baseData.hotelLocations[currentHotelIndex];
    const currentLocationHotels = currentLocation?.HotelOption?.item || [];
    
    const filteredHotels = filterHotels(
      currentLocationHotels, 
      currentLocationFilters.selectedStars
    );
    
    return { filteredFlightOptions, filteredHotels, currentLocation };
  }, [
    baseData, 
    flightFilters.selectedLayovers, 
    currentLocationFilters.selectedStars,
    currentHotelIndex
  ]);
};

export const usePriceCalculation = (
  bookingState: BookingState,
  lookupMaps: LookupMaps,
  productData: ProductData | null
) => {
  return useMemo(() => {
    let total = 0;
    
    // Flight price
    if (bookingState.selectedFlight) {
      const selectedOption = lookupMaps.flightOptionsMap.get(bookingState.selectedFlight.optionCode);
      if (selectedOption) {
        total += calculateFlightPrice(selectedOption);
      }
    }
    
    // Hotel prices
    Object.values(bookingState.selectedHotels).forEach(hotelSelection => {
      // Calculate price for all selected rooms in this hotel
      Object.values(hotelSelection.roomSelections || {}).forEach(roomSelection => {
        const roomKey = `${hotelSelection.hotelCode}-${roomSelection.roomCode}-${roomSelection.roomNum}`;
        const selectedRoom = lookupMaps.roomsMap.get(roomKey);
        if (selectedRoom) {
          total += calculateRoomPrice(selectedRoom);
        }
      });
    });
    
    // Insurance price
    if (bookingState.selectedInsurance !== "included") {
      const upgrade = productData?.data?.DynInsurance?.Upgrades?.item?.find(
        item => item.ID === bookingState.selectedInsurance
      );
      if (upgrade) {
        total += calculateInsurancePrice(upgrade);
      }
    }
    
    return total;
  }, [bookingState, lookupMaps, productData]);
};
