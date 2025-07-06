"use client";

import { useParams, useRouter } from "next/navigation";
import React, { useState, useMemo, useCallback } from "react";
import { FixedSizeList as List } from 'react-window';
import useFetchProductServices from "@/app/hooks/_fetch_product_services";

// Type definitions for the complex flight data structure
interface Flight {
  FlightCode: string;
  From: string;
  FromDesc: string;
  To: string;
  ToDesc: string;
  DepDate: string;
  DepTime: string;
  ArrDate: string;
  ArrTime: string;
  AirCompCode: string;
  AirCompLogoUrl: string;
  Number: string;
  Class: string;
  Bag: string;
  Status: string;
  Selected: string;
}

interface FlightGroup {
  FlightGroupCode: string;
  NumStopOvers: string;
  Flights: {
    item: Flight[];
  };
}

interface FlightSegment {
  ServiceDesc: string;
  SegmentCode: string;
  FromIATA: string;
  FromIATADesc: string;
  ToIATA: string;
  ToIATADesc: string;
  Date: string;
  Flights: {
    item: FlightGroup[];
  };
}

interface FlightOption {
  OptionCode: string;
  RateTaxVal: string;
  SuplementsTotalVal: string;
  CheapestDifPax: string;
  Tax: string;
  Lasttkdt: string;
  FlightSegments: {
    item: FlightSegment[];
  };
}

interface Room {
  Code: string;
  Name: string;
  RoomNum: string;
  UpgradeSupVal: string;
  BoardIncluded: string;
  BoardDescription: string;
  SellValue: string;
  NonRefundable: string;
  Provider: string;
  AvailStatus: string;
}

interface RoomGroup {
  RoomGroup: string;
  NumAdults: string;
  NumChilds: string;
  Rooms: {
    item: Room[];
  };
}

interface Hotel {
  Code: string;
  Name: string;
  Rating: string;
  Image: string;
  Address: string;
  GpsLatitude: string;
  GpsLongitude: string;
  PriceFrom: string;
  CheckIn: string;
  CheckOut: string;
  RoomsOccupancy: {
    item: RoomGroup[];
  };
}

interface InsuranceUpgrade {
  ID: string;
  Code: string;
  Description: string;
  Sellvalue: string;
}

interface DynInsurance {
  Included: {
    ID: string;
    Code: string;
    Description: string;
  };
  Upgrades: {
    item: InsuranceUpgrade[];
  };
}

interface ProductData {
  data: {
    SessionHash: string;
    Code: string;
    CodeDefined: string;
    Name: string;
    DynInsurance: DynInsurance;
    FlightSelected: string;
    FlightMainGroup: {
      item: Array<{
        Description: string;
        FlightOptionsSuperBB: {
          item: FlightOption[];
        };
      }>;
    };
    Itinerary: {
      item: Array<{
        Code: string;
        Name: string;
        HotelOption: {
          item: Hotel[];
        };
      }>;
    };
    OtherMandatoryServices: {
      item: Array<{
        Type: string;
        Description: string;
      }>;
    };
  };
}

interface BookingState {
  currentTab: 'flights' | 'hotels' | 'review';
  selectedFlight: {
    optionCode: string;
    flightSelections: {[segmentCode: string]: string};
  } | null;
  selectedHotel: {
    hotelCode: string;
    roomCode: string;
    roomNum: string;
  } | null;
  selectedInsurance: string;
}

// Memoized components for performance
const FlightOptionCard = React.memo(({ 
  option, 
  selectedFlights, 
  handleFlightSelection, 
  getSelectedFlightForSegment,
  formatTime,
  formatDate 
}: {
  option: FlightOption;
  selectedFlights: {[optionCode: string]: {[segmentCode: string]: string}};
  handleFlightSelection: (optionCode: string, segmentCode: string, flightGroupCode: string) => void;
  getSelectedFlightForSegment: (optionCode: string, segmentCode: string) => string;
  formatTime: (time: string) => string;
  formatDate: (date: string) => string;
}) => {
  const hasSelectedFlights = Object.values(selectedFlights[option.OptionCode] || {}).some(selection => selection !== "");
  
  return (
    <div 
      className={`border-2 rounded-lg p-6 transition-all ${
        hasSelectedFlights
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-200'
      }`}
    >
      {/* Option Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <h3 className="text-lg font-semibold text-gray-800">
            Pacote de Voo {parseInt(option.OptionCode) + 1}
          </h3>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-green-600">
            €{(parseFloat(option.RateTaxVal) + parseFloat(option.SuplementsTotalVal) + parseFloat(option.Tax)).toFixed(2)}
          </div>
          <div className="text-sm text-gray-500">
            +€{option.CheapestDifPax} vs mais barato
          </div>
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="text-sm text-gray-600 mb-4 pb-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <span>Taxa Base: €{option.RateTaxVal}</span>
          <span>Suplementos: €{option.SuplementsTotalVal}</span>
          <span>Taxas: €{option.Tax}</span>
          <span className="text-xs text-gray-500">Reservar até: {formatDate(option.Lasttkdt)}</span>
        </div>
      </div>

      {/* Flight Segments */}
      <div className="space-y-4">
        {option.FlightSegments.item.map((segment) => (
          <FlightSegmentCard 
            key={segment.SegmentCode}
            segment={segment}
            optionCode={option.OptionCode}
            selectedFlight={getSelectedFlightForSegment(option.OptionCode, segment.SegmentCode)}
            onFlightSelection={handleFlightSelection}
            formatTime={formatTime}
            formatDate={formatDate}
          />
        ))}
      </div>
    </div>
  );
});

const FlightSegmentCard = React.memo(({ 
  segment, 
  optionCode, 
  selectedFlight, 
  onFlightSelection,
  formatTime,
  formatDate 
}: {
  segment: FlightSegment;
  optionCode: string;
  selectedFlight: string;
  onFlightSelection: (optionCode: string, segmentCode: string, flightGroupCode: string) => void;
  formatTime: (time: string) => string;
  formatDate: (date: string) => string;
}) => (
  <div className="bg-white rounded-lg border border-gray-100 p-4">
    <h4 className="text-md font-semibold text-blue-600 mb-3 flex items-center">
      {segment.ServiceDesc === "Voo de Ida" ? (
        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.429a1 1 0 001.17-1.409l-7-14z" />
        </svg>
      ) : (
        <svg className="w-4 h-4 mr-2 transform rotate-180" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.429a1 1 0 001.17-1.409l-7-14z" />
        </svg>
      )}
      {segment.ServiceDesc}
    </h4>

    {/* Route Overview */}
    <div className="bg-gray-50 rounded-lg p-3 mb-3">
      <div className="flex items-center justify-between text-sm relative">
        <div>
          <span className="font-medium">{segment.FromIATADesc}</span>
          <span className="text-gray-500 ml-1">({segment.FromIATA})</span>
        </div>
        <div className="text-gray-400 absolute left-1/2 transform -translate-x-1/2">
          <svg className="w-4 h-4 mx-auto" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </div>
        <div>
          <span className="font-medium">{segment.ToIATADesc}</span>
          <span className="text-gray-500 ml-1">({segment.ToIATA})</span>
        </div>
      </div>
      <div className="text-center text-sm text-gray-600 mt-1">
        {formatDate(segment.Date)}
      </div>
    </div>

    {/* Flight Options for this Segment */}
    {segment.Flights.item.length > 1 && (
      <div className="text-sm text-orange-600 font-medium mb-2 flex items-center">
        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        Múltiplas opções disponíveis - deve escolher uma opção
      </div>
    )}
    
    <div className="space-y-2">
      {segment.Flights.item.map((flightGroup) => {
        const isSelected = selectedFlight === flightGroup.FlightGroupCode;
        
        return (
          <FlightGroupCard 
            key={flightGroup.FlightGroupCode}
            flightGroup={flightGroup}
            isSelected={isSelected}
            onSelect={() => onFlightSelection(optionCode, segment.SegmentCode, flightGroup.FlightGroupCode)}
            formatTime={formatTime}
          />
        );
      })}
    </div>
  </div>
));

const FlightGroupCard = React.memo(({ 
  flightGroup, 
  isSelected, 
  onSelect, 
  formatTime 
}: {
  flightGroup: FlightGroup;
  isSelected: boolean;
  onSelect: () => void;
  formatTime: (time: string) => string;
}) => (
  <div 
    className={`border rounded-md p-3 cursor-pointer transition-colors ${
      isSelected
        ? 'border-blue-500 bg-blue-50'
        : 'border-gray-200 hover:border-gray-300'
    }`}
    onClick={onSelect}
  >
    <div className="flex items-center mb-2">
      <div className={`w-3 h-3 rounded-full border mr-2 ${
        isSelected
          ? 'border-blue-500 bg-blue-500'
          : 'border-gray-300'
      }`}>
        {isSelected && (
          <div className="w-1.5 h-1.5 bg-white rounded-full m-0.5"></div>
        )}
      </div>
      {flightGroup.NumStopOvers !== "0" && (
        <span className="text-xs text-orange-600 font-medium">
          {flightGroup.NumStopOvers} escala(s)
        </span>
      )}
      {flightGroup.NumStopOvers === "0" && (
        <span className="text-xs text-green-600 font-medium">
          Voo direto
        </span>
      )}
    </div>

    {/* Individual Flights */}
    <div className="space-y-2">
      {flightGroup.Flights.item.map((flight, flightIndex) => (
        <div key={flightIndex} className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <img
              src={flight.AirCompLogoUrl}
              alt={flight.AirCompCode}
              className="w-6 h-6 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <span className="font-medium">
              {flight.AirCompCode} {flight.Number}
            </span>
            <span className="text-gray-500">
              Classe {flight.Class}
            </span>
          </div>
          
          <div className="flex items-center space-x-4 text-right">
            <div>
              <div className="font-medium">{formatTime(flight.DepTime)}</div>
              <div className="text-gray-500">{flight.From}</div>
            </div>
            <div className="text-gray-400">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.429a1 1 0 001.17-1.409l-7-14z" />
              </svg>
            </div>
            <div>
              <div className="font-medium">{formatTime(flight.ArrTime)}</div>
              <div className="text-gray-500">{flight.To}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
));

const HotelCard = React.memo(({ 
  hotel, 
  selectedHotel, 
  onRoomSelection, 
  renderStarRating, 
  formatDate 
}: {
  hotel: Hotel;
  selectedHotel: { hotelCode: string; roomCode: string; roomNum: string } | null;
  onRoomSelection: (hotelCode: string, roomCode: string, roomNum: string) => void;
  renderStarRating: (rating: string) => React.ReactNode;
  formatDate: (date: string) => string;
}) => {
  // Flatten all rooms from all room groups for this hotel
  const allRooms = hotel.RoomsOccupancy.item.flatMap(roomGroup => 
    roomGroup.Rooms.item.map(room => ({ ...room, roomGroup: roomGroup.RoomGroup }))
  );

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="md:flex">
        {/* Hotel Image - Fixed size */}
        <div className="md:w-1/3 md:flex-shrink-0">
          <div className="relative h-64 md:h-80">
            <img
              src={hotel.Image}
              alt={hotel.Name}
              loading="lazy"
              className="object-cover w-full h-full"
              onError={(e) => {
                e.currentTarget.src = '/fallback.png';
              }}
            />
          </div>
        </div>
        
        {/* Hotel Details */}
        <div className="md:w-4/5 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{hotel.Name}</h3>
              {renderStarRating(hotel.Rating)}
              <div className="flex items-center mt-2 text-sm text-gray-600">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span>{hotel.Address}</span>
                <a
                  href={`https://www.google.com/maps?q=${hotel.GpsLatitude},${hotel.GpsLongitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  Ver no mapa
                </a>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">A partir de</div>
              <div className="text-2xl font-bold text-green-600">€{hotel.PriceFrom}</div>
            </div>
          </div>
          
          <div className="text-sm text-gray-600 mb-4">
            <div className="flex items-center space-x-4">
              <span>Check-in: {formatDate(hotel.CheckIn)}</span>
              <span>Check-out: {formatDate(hotel.CheckOut)}</span>
            </div>
          </div>

          {/* Room Selection - Scrollable Container */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-800">Escolha o seu quarto:</h4>
              <span className="text-sm text-gray-500">
                {allRooms.length} quarto{allRooms.length !== 1 ? 's' : ''} disponível{allRooms.length !== 1 ? 'is' : ''}
              </span>
            </div>
            
            {/* Scrollable room container - max 6 rooms visible */}
            <div className="border border-gray-200 rounded-lg">
              {allRooms.length > 10 ? (
                // Use virtualization for large room lists
                <VirtualizedRoomList 
                  allRooms={allRooms}
                  hotelCode={hotel.Code}
                  selectedHotel={selectedHotel}
                  onRoomSelection={onRoomSelection}
                />
              ) : (
                // Use regular scrolling for smaller lists
                <div className="max-h-80 overflow-y-auto">
                  <div className="space-y-2 p-2">
                    {allRooms.map((room) => (
                      <RoomCard 
                        key={`${room.Code}-${room.RoomNum}`}
                        room={room}
                        hotelCode={hotel.Code}
                        isSelected={
                          selectedHotel?.hotelCode === hotel.Code &&
                          selectedHotel?.roomCode === room.Code &&
                          selectedHotel?.roomNum === room.RoomNum
                        }
                        onSelect={() => onRoomSelection(hotel.Code, room.Code, room.RoomNum)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

const RoomCard = React.memo(({ 
  room, 
  hotelCode, 
  isSelected, 
  onSelect 
}: {
  room: Room & { roomGroup: string };
  hotelCode: string;
  isSelected: boolean;
  onSelect: () => void;
}) => (
  <div
    className={`border rounded-lg p-3 cursor-pointer transition-colors ${
      isSelected
        ? 'border-blue-500 bg-blue-50'
        : 'border-gray-200 hover:border-gray-300'
    }`}
    onClick={onSelect}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <div className={`w-3 h-3 rounded-full border mr-3 ${
          isSelected
            ? 'border-blue-500 bg-blue-500'
            : 'border-gray-300'
        }`}>
          {isSelected && (
            <div className="w-1.5 h-1.5 bg-white rounded-full m-0.5"></div>
          )}
        </div>
        <div>
          <div className="font-medium">{room.Name}</div>
          <div className="text-sm text-gray-600">
            {room.BoardDescription}
            {room.NonRefundable === "1" && (
              <span className="ml-2 text-xs text-red-600 font-medium">
                Não Reembolsável
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-lg font-bold text-green-600">€{room.SellValue}</div>
        {parseFloat(room.UpgradeSupVal) > 0 && (
          <div className="text-xs text-orange-600">
            +€{parseFloat(room.UpgradeSupVal).toFixed(2)} upgrade
          </div>
        )}
      </div>
    </div>
  </div>
));

// Virtualized components for large lists
const VirtualizedHotelList = React.memo(({ 
  hotels, 
  selectedHotel, 
  onRoomSelection, 
  renderStarRating, 
  formatDate 
}: {
  hotels: Hotel[];
  selectedHotel: { hotelCode: string; roomCode: string; roomNum: string } | null;
  onRoomSelection: (hotelCode: string, roomCode: string, roomNum: string) => void;
  renderStarRating: (rating: string) => React.ReactNode;
  formatDate: (date: string) => string;
}) => {
  return (
    <div className="space-y-6">
      {hotels.map((hotel) => (
        <HotelCard 
          key={hotel.Code}
          hotel={hotel}
          selectedHotel={selectedHotel}
          onRoomSelection={onRoomSelection}
          renderStarRating={renderStarRating}
          formatDate={formatDate}
        />
      ))}
    </div>
  );
});


const VirtualizedRoomList = React.memo(({ 
  allRooms, 
  hotelCode,
  selectedHotel, 
  onRoomSelection 
}: {
  allRooms: (Room & { roomGroup: string })[];
  hotelCode: string;
  selectedHotel: { hotelCode: string; roomCode: string; roomNum: string } | null;
  onRoomSelection: (hotelCode: string, roomCode: string, roomNum: string) => void;
}) => {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const room = allRooms[index];
    const isSelected = 
      selectedHotel?.hotelCode === hotelCode &&
      selectedHotel?.roomCode === room.Code &&
      selectedHotel?.roomNum === room.RoomNum;

    return (
      <div style={{ ...style, paddingBottom: '8px' }}>
        <RoomCard 
          room={room}
          hotelCode={hotelCode}
          isSelected={isSelected}
          onSelect={() => onRoomSelection(hotelCode, room.Code, room.RoomNum)}
        />
      </div>
    );
  };

  return (
    <List
      height={320} // Fixed height for room list virtualization
      width="100%" // Full width
      itemCount={allRooms.length}
      itemSize={85} // Height per room card
    >
      {Row}
    </List>
  );
});

export default function AvailableServicesPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code;
  const token = params.token as string;

  const { data, loading, error, isDone } = useFetchProductServices(token);

  const productData = data as ProductData;
  
  const [bookingState, setBookingState] = useState<BookingState>({
    currentTab: 'flights',
    selectedFlight: null,
    selectedHotel: null,
    selectedInsurance: 'included'
  });
  
  const [selectedFlights, setSelectedFlights] = useState<{[optionCode: string]: {[segmentCode: string]: string}}>({});
  
  // Filter states with debouncing for better performance
  const [flightFilters, setFlightFilters] = useState<{
    selectedLayovers: number[];
  }>({
    selectedLayovers: []
  });
  
  const [hotelFilters, setHotelFilters] = useState<{
    selectedStars: number[];
  }>({
    selectedStars: []
  });

  // Memoize base data arrays to prevent unnecessary recalculations
  const baseData = useMemo(() => {
    const flightOptions = productData?.data?.FlightMainGroup?.item?.[0]?.FlightOptionsSuperBB?.item || [];
    const hotels = productData?.data?.Itinerary?.item?.[0]?.HotelOption?.item || [];
    
    return { flightOptions, hotels };
  }, [productData]);

  // Create lookup maps for O(1) access instead of O(n) searches
  const lookupMaps = useMemo(() => {
    const flightOptionsMap = new Map(baseData.flightOptions.map(option => [option.OptionCode, option]));
    const hotelsMap = new Map(baseData.hotels.map(hotel => [hotel.Code, hotel]));
    
    // Pre-compute all room lookups
    const roomsMap = new Map();
    baseData.hotels.forEach(hotel => {
      hotel.RoomsOccupancy.item.forEach(roomGroup => {
        roomGroup.Rooms.item.forEach(room => {
          const key = `${hotel.Code}-${room.Code}-${room.RoomNum}`;
          roomsMap.set(key, { ...room, hotelCode: hotel.Code, roomGroup: roomGroup.RoomGroup });
        });
      });
    });
    
    return { flightOptionsMap, hotelsMap, roomsMap };
  }, [baseData]);

  // Memoize range calculations
  const ranges = useMemo(() => {
    let layoverRange = { min: 0, max: 0 };
    let starRange = { min: 0, max: 0 };
    
    if (baseData.flightOptions.length > 0) {
      const allLayovers = baseData.flightOptions.flatMap(option =>
        option.FlightSegments.item.flatMap(segment =>
          segment.Flights.item.map(flight => parseInt(flight.NumStopOvers) || 0)
        )
      );
      layoverRange = {
        min: Math.min(...allLayovers),
        max: Math.max(...allLayovers)
      };
    }
    
    if (baseData.hotels.length > 0) {
      const allStars = baseData.hotels.map(hotel => parseInt(hotel.Rating) || 0);
      starRange = {
        min: Math.min(...allStars),
        max: Math.max(...allStars)
      };
    }
    
    return { layoverRange, starRange };
  }, [baseData]);

  // Memoize filtered results with Set-based lookups for O(1) performance
  const filteredData = useMemo(() => {
    const selectedLayoverSet = new Set(flightFilters.selectedLayovers);
    const selectedStarSet = new Set(hotelFilters.selectedStars);
    
    const filteredFlightOptions = baseData.flightOptions.filter(option => {
      if (selectedLayoverSet.size === 0) return true;
      
      return option.FlightSegments.item.some(segment =>
        segment.Flights.item.some(flight =>
          selectedLayoverSet.has(parseInt(flight.NumStopOvers) || 0)
        )
      );
    });

    const filteredHotels = baseData.hotels.filter(hotel => {
      if (selectedStarSet.size === 0) return true;
      return selectedStarSet.has(parseInt(hotel.Rating) || 0);
    });
    
    return { filteredFlightOptions, filteredHotels };
  }, [baseData, flightFilters.selectedLayovers, hotelFilters.selectedStars]);

  const calculateTotalPrice = useMemo(() => {
    let total = 0;
    
    // Flight price
    if (bookingState.selectedFlight) {
      const selectedOption = lookupMaps.flightOptionsMap.get(bookingState.selectedFlight.optionCode);
      if (selectedOption) {
        total += parseFloat(selectedOption.RateTaxVal) || 0;
        total += parseFloat(selectedOption.SuplementsTotalVal) || 0;
        total += parseFloat(selectedOption.Tax) || 0;
      }
    }
    
    // Hotel price
    if (bookingState.selectedHotel) {
      const roomKey = `${bookingState.selectedHotel.hotelCode}-${bookingState.selectedHotel.roomCode}-${bookingState.selectedHotel.roomNum}`;
      console.log("Hotel is selected:", roomKey, lookupMaps.roomsMap.get(roomKey));
      const selectedRoom = lookupMaps.roomsMap.get(roomKey);
      if (selectedRoom) {
        total += parseFloat(selectedRoom.SellValue) || 0;
      }
    }
    
    // Insurance price
    if (bookingState.selectedInsurance !== "included") {
      const upgrade = productData?.data?.DynInsurance?.Upgrades?.item?.find(
        item => item.ID === bookingState.selectedInsurance
      );
      if (upgrade) {
        total += parseFloat(upgrade.Sellvalue) || 0;
      }
    }
    
    return total;
  }, [bookingState.selectedFlight, bookingState.selectedHotel, bookingState.selectedInsurance, lookupMaps, productData?.data?.DynInsurance?.Upgrades]);


  // Debounced filter handlers to prevent excessive re-renders
  const updateFlightFilters = useCallback((newFilters: typeof flightFilters) => {
    setFlightFilters(newFilters);
  }, []);

  const updateHotelFilters = useCallback((newFilters: typeof hotelFilters) => {
    setHotelFilters(newFilters);
  }, []);

  const handleHotelRoomSelection = useCallback((hotelCode: string, roomCode: string, roomNum: string) => {
    setBookingState(prev => ({
      ...prev,
      selectedHotel: {
        hotelCode,
        roomCode,
        roomNum
      }
    }));
  }, []);

  const getSelectedFlightForSegment = useCallback((optionCode: string, segmentCode: string) => {
    return selectedFlights[optionCode]?.[segmentCode] || "";
  }, [selectedFlights]);

  const canAccessTab = useCallback((tab: 'flights' | 'hotels' | 'review') => {
    switch (tab) {
      case 'flights':
        return true;
      case 'hotels':
        return bookingState.selectedFlight !== null;
      case 'review':
        return bookingState.selectedFlight !== null && bookingState.selectedHotel !== null;
      default:
        return false;
    }
  }, [bookingState.selectedFlight, bookingState.selectedHotel]);

  const switchTab = useCallback((tab: 'flights' | 'hotels' | 'review') => {
    if (canAccessTab(tab)) {
      setBookingState(prev => ({
        ...prev,
        currentTab: tab
      }));
    }
  }, [canAccessTab]);

  const formatTime = useCallback((time: string) => {
    if (time.length === 4) {
      return `${time.substring(0, 2)}:${time.substring(2, 4)}`;
    }
    return time;
  }, []);

  const formatDate = useCallback((date: string) => {
    if (date.length === 10) {
      const [year, month, day] = date.split('-');
      return `${day}/${month}/${year}`;
    }
    return date;
  }, []);


  const renderStarRating = useCallback((rating: string) => {
    const numStars = parseInt(rating) || 0;
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-4 h-4 ${i < numStars ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating})</span>
      </div>
    );
  }, []);

  const handleFlightSelection = useCallback((optionCode: string, segmentCode: string, flightGroupCode: string) => {
    // Check if we're selecting from the same entry as currently selected flights
    const currentlySelectedEntry = Object.keys(selectedFlights).find(entryCode => 
      Object.values(selectedFlights[entryCode] || {}).some(selection => selection !== "")
    );
    
    let newSelections: {[optionCode: string]: {[segmentCode: string]: string}};
    
    if (currentlySelectedEntry && currentlySelectedEntry !== optionCode) {
      // Selecting from a different entry - clear all and start fresh
      newSelections = {};
      baseData.flightOptions.forEach(option => {
        newSelections[option.OptionCode] = {};
        option.FlightSegments.item.forEach(segment => {
          newSelections[option.OptionCode][segment.SegmentCode] = "";
        });
      });
    } else {
      // Selecting from the same entry or no entry selected yet - preserve existing selections
      newSelections = { ...selectedFlights };
      // Ensure all entries are initialized
      baseData.flightOptions.forEach(option => {
        if (!newSelections[option.OptionCode]) {
          newSelections[option.OptionCode] = {};
          option.FlightSegments.item.forEach(segment => {
            newSelections[option.OptionCode][segment.SegmentCode] = "";
          });
        }
      });
    }

    // Find the selected option using Map lookup
    const selectedOption = lookupMaps.flightOptionsMap.get(optionCode);
    if (!selectedOption) return;

    // Set the selected flight for this segment
    newSelections[optionCode][segmentCode] = flightGroupCode;

    // Auto-select the other flight if this entry has exactly 2 segments (outgoing + incoming)
    // and the other segment has only one flight option
    if (selectedOption.FlightSegments.item.length === 2) {
      const otherSegment = selectedOption.FlightSegments.item.find(seg => seg.SegmentCode !== segmentCode);
      if (otherSegment && otherSegment.Flights.item.length === 1) {
        // Auto-select the other flight if it has only one option
        newSelections[optionCode][otherSegment.SegmentCode] = otherSegment.Flights.item[0].FlightGroupCode;
      }
    }

    setSelectedFlights(newSelections);
    
    // Update booking state - check if we have 2 flights selected for this option
    const entrySelections = newSelections[optionCode];
    const selectedCount = Object.values(entrySelections).filter(selection => selection !== "").length;
    
    if (selectedCount === 2) {
      setBookingState(prev => ({
        ...prev,
        selectedFlight: {
          optionCode,
          flightSelections: entrySelections
        }
      }));
    } else {
      setBookingState(prev => ({
        ...prev,
        selectedFlight: null
      }));
    }
  }, [selectedFlights, baseData.flightOptions, lookupMaps.flightOptionsMap]);

  // Initialize selected flights - only first option has flights selected by default
  React.useEffect(() => {
    if (baseData.flightOptions.length > 0 && Object.keys(selectedFlights).length === 0) {
      const initialSelections: {[optionCode: string]: {[segmentCode: string]: string}} = {};
      
      baseData.flightOptions.forEach((option, optionIndex) => {
        initialSelections[option.OptionCode] = {};
        option.FlightSegments.item.forEach(segment => {
          if (segment.Flights.item.length > 0) {
            // Only select flights for the first option, and only if segments have 1 or 2 flights
            if (optionIndex === 0) {
              if (segment.Flights.item.length === 1) {
                // Auto-select if only one option
                initialSelections[option.OptionCode][segment.SegmentCode] = segment.Flights.item[0].FlightGroupCode;
              } else {
                // For multiple options, don't auto-select
                initialSelections[option.OptionCode][segment.SegmentCode] = "";
              }
            } else {
              // For other options, don't pre-select anything
              initialSelections[option.OptionCode][segment.SegmentCode] = "";
            }
          }
        });
      });
      
      setSelectedFlights(initialSelections);
      
      // Check if first option has all flights selected (meaning all segments have only 1 flight option)
      const firstOptionSelections = initialSelections["0"] || {};
      const hasAllFlightsSelected = Object.values(firstOptionSelections).every(selection => selection !== "");
      
      if (hasAllFlightsSelected && baseData.flightOptions[0]) {
        const firstOption = baseData.flightOptions[0];
        const numSegments = firstOption.FlightSegments.item.length;
        if (numSegments === 2) { // Outgoing and incoming
          setBookingState(prev => ({
            ...prev,
            selectedFlight: {
              optionCode: "0",
              flightSelections: firstOptionSelections
            }
          }));
        }
      }
    }
  }, [baseData.flightOptions, selectedFlights]);

  if (loading && !isDone) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg">A carregar serviços disponíveis...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600">
          <h2 className="text-xl font-semibold mb-2">Erro</h2>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => router.push(`/products/${code}`)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Voltar à Página Anterior
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p>Nenhuns dados encontrados.</p>
        </div>
      </div>
    );
  }

  // Check for empty flight options or hotels
  if (baseData.flightOptions.length === 0 || baseData.hotels.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600 max-w-md">
          <div className="mb-4">
            <svg className="w-16 h-16 mx-auto text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Serviços Indisponíveis</h2>
          
          {baseData.flightOptions.length === 0 && baseData.hotels.length === 0 ? (
            <div className="mb-4">
              <p className="mb-2 text-gray-700">
                <strong>Não existem voos nem alojamentos disponíveis</strong> para as suas datas e especificações.
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Isto pode acontecer devido a limitações de disponibilidade, restrições sazonais, ou as datas selecionadas podem estar esgotadas.
              </p>
            </div>
          ) : baseData.flightOptions.length === 0 ? (
            <div className="mb-4">
              <p className="mb-2 text-gray-700">
                <strong>Não existem voos disponíveis</strong> para as suas datas e destino selecionados.
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Os voos podem estar esgotados para estas datas ou pode não haver rotas disponíveis para o destino escolhido.
              </p>
            </div>
          ) : (
            <div className="mb-4">
              <p className="mb-2 text-gray-700">
                <strong>Não existem alojamentos disponíveis</strong> para as suas datas e destino selecionados.
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Os hotéis podem estar esgotados para estas datas ou pode não haver acomodações disponíveis na região escolhida.
              </p>
            </div>
          )}
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-blue-800 mb-2">💡 Sugestões para resolver:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Tente datas diferentes (mais flexíveis)</li>
              <li>• Considere destinos alternativos próximos</li>
              <li>• Verifique se as suas preferências não são muito restritivas</li>
              <li>• Contacte-nos diretamente para mais opções</li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => router.push(`/products/${code}`)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              ← Voltar ao Produto
            </button>
            <div className="text-xs text-gray-500">
              Pode alterar as suas preferências e tentar novamente
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="flex max-w-7xl mx-auto px-4 py-8">
        {/* Main Content */}
        <div className="flex-1 pr-8">

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'flights', label: 'Voos', icon: '✈️' },
                { id: 'hotels', label: 'Alojamento', icon: '🏨' },
                { id: 'review', label: 'Revisão', icon: '📋' }
              ].map((tab) => {
                const isActive = bookingState.currentTab === tab.id;
                const canAccess = canAccessTab(tab.id as any);
                const isCompleted = 
                  (tab.id === 'flights' && bookingState.selectedFlight) ||
                  (tab.id === 'hotels' && bookingState.selectedHotel) ||
                  (tab.id === 'review' && bookingState.selectedFlight && bookingState.selectedHotel);
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => switchTab(tab.id as any)}
                    disabled={!canAccess}
                    className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                      isActive
                        ? 'border-blue-500 text-blue-600'
                        : canAccess
                        ? 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        : 'border-transparent text-gray-300 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span>{tab.icon}</span>
                      <span>{tab.label}</span>
                      {isCompleted && (
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-lg">
          {/* Remove the sticky navigation buttons from here as they'll be in the sidebar */}
          {/* Flight Selection Tab */}
          {bookingState.currentTab === 'flights' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Escolha a Sua Opção de Voo</h2>
              
              {/* Flight Filters */}
              {ranges.layoverRange.max > ranges.layoverRange.min && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="font-medium text-gray-700">Filtrar por escalas:</span>
                      <div className="flex items-center space-x-2">
                        {Array.from({ length: ranges.layoverRange.max - ranges.layoverRange.min + 1 }, (_, i) => {
                          const layoverCount = ranges.layoverRange.min + i;
                          const isSelected = flightFilters.selectedLayovers.includes(layoverCount);
                          
                          return (
                            <button
                              key={layoverCount}
                              onClick={() => {
                                updateFlightFilters({
                                  ...flightFilters,
                                  selectedLayovers: isSelected
                                    ? flightFilters.selectedLayovers.filter(l => l !== layoverCount)
                                    : [...flightFilters.selectedLayovers, layoverCount]
                                });
                              }}
                              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                isSelected
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                              }`}
                            >
                              {layoverCount === 0 ? 'Direto' : `${layoverCount} escala${layoverCount > 1 ? 's' : ''}`}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <button
                      onClick={() => updateFlightFilters({ ...flightFilters, selectedLayovers: [] })}
                      disabled={flightFilters.selectedLayovers.length === 0}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        flightFilters.selectedLayovers.length === 0
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-red-100 text-red-700 hover:bg-red-200'
                      }`}
                    >
                      Limpar filtros
                    </button>
                  </div>
                </div>
              )}
              
              <div className="space-y-6 mb-6">
                {filteredData.filteredFlightOptions.map((option) => (
                  <FlightOptionCard 
                    key={option.OptionCode}
                    option={option}
                    selectedFlights={selectedFlights}
                    handleFlightSelection={handleFlightSelection}
                    getSelectedFlightForSegment={getSelectedFlightForSegment}
                    formatTime={formatTime}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Hotel Selection Tab */}
          {bookingState.currentTab === 'hotels' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Escolha o Seu Alojamento</h2>
              
              {/* Hotel Filters */}
              {ranges.starRange.max > ranges.starRange.min && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="font-medium text-gray-700">Filtrar por estrelas:</span>
                      <div className="flex items-center space-x-2">
                        {Array.from({ length: ranges.starRange.max - ranges.starRange.min + 1 }, (_, i) => {
                          const starCount = ranges.starRange.min + i;
                          const isSelected = hotelFilters.selectedStars.includes(starCount);
                          
                          return (
                            <button
                              key={starCount}
                              onClick={() => {
                                updateHotelFilters({
                                  ...hotelFilters,
                                  selectedStars: isSelected
                                    ? hotelFilters.selectedStars.filter(s => s !== starCount)
                                    : [...hotelFilters.selectedStars, starCount]
                                });
                              }}
                              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors flex items-center space-x-1 ${
                                isSelected
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                              }`}
                            >
                              <span>{starCount}</span>
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <button
                      onClick={() => updateHotelFilters({ ...hotelFilters, selectedStars: [] })}
                      disabled={hotelFilters.selectedStars.length === 0}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        hotelFilters.selectedStars.length === 0
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-red-100 text-red-700 hover:bg-red-200'
                      }`}
                    >
                      Limpar filtros
                    </button>
                  </div>
                </div>
              )}
              
              <div className="space-y-6 mb-6">
                <VirtualizedHotelList 
                  hotels={filteredData.filteredHotels}
                  selectedHotel={bookingState.selectedHotel}
                  onRoomSelection={handleHotelRoomSelection}
                  renderStarRating={renderStarRating}
                  formatDate={formatDate}
                />
              </div>
            </div>
          )}

          {/* Review Tab */}
          {bookingState.currentTab === 'review' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Revisão da Sua Reserva</h2>
              
              <div className="space-y-6">
                {/* Flight Summary */}
                {bookingState.selectedFlight && (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.429a1 1 0 001.17-1.409l-7-14z" />
                      </svg>
                      Voo Selecionado
                    </h3>
                    
                    {(() => {
                      const originalFlightOptions = productData?.data?.FlightMainGroup?.item?.[0]?.FlightOptionsSuperBB?.item || [];
                      const selectedFlightOption = originalFlightOptions.find(option => option.OptionCode === bookingState.selectedFlight!.optionCode);
                      return selectedFlightOption && (
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-medium">Pacote de Voo {parseInt(selectedFlightOption.OptionCode) + 1}</span>
                            <span className="text-lg font-bold text-green-600">
                              €{(parseFloat(selectedFlightOption.RateTaxVal) + parseFloat(selectedFlightOption.SuplementsTotalVal) + parseFloat(selectedFlightOption.Tax)).toFixed(2)}
                            </span>
                          </div>
                          
                          <div className="space-y-2 text-sm text-gray-600">
                            {selectedFlightOption.FlightSegments.item.map((segment) => (
                              <div key={segment.SegmentCode} className="flex items-center justify-between">
                                <span>{segment.ServiceDesc}: {segment.FromIATADesc} → {segment.ToIATADesc}</span>
                                <span>{formatDate(segment.Date)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Hotel Summary */}
                {bookingState.selectedHotel && (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 000 1.414l7 7a1 1 0 001.414 0l7-7a1 1 0 000-1.414l-7-7zM13 11H7v-1h6v1z" />
                      </svg>
                      Alojamento Selecionado
                    </h3>
                    
                    {(() => {
                      const originalHotels = productData?.data?.Itinerary?.item?.find(item => item.Name === "Alojamento")?.HotelOption?.item || [];
                      const selectedHotel = originalHotels.find(hotel => hotel.Code === bookingState.selectedHotel!.hotelCode);
                      const selectedRoom = selectedHotel?.RoomsOccupancy.item[0]?.Rooms.item.find(room => 
                        room.Code === bookingState.selectedHotel!.roomCode && 
                        room.RoomNum === bookingState.selectedHotel!.roomNum
                      );
                      
                      return selectedHotel && selectedRoom && (
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <div className="font-medium">{selectedHotel.Name}</div>
                              <div className="text-sm text-gray-600">{selectedRoom.Name}</div>
                            </div>
                            <span className="text-lg font-bold text-green-600">€{selectedRoom.SellValue}</span>
                          </div>
                          
                          <div className="space-y-1 text-sm text-gray-600">
                            <div>Classificação: {renderStarRating(selectedHotel.Rating)}</div>
                            <div>Regime: {selectedRoom.BoardDescription}</div>
                            <div>Check-in: {formatDate(selectedHotel.CheckIn)} | Check-out: {formatDate(selectedHotel.CheckOut)}</div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Insurance Selection */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" />
                    </svg>
                    Seguro de Viagem
                  </h3>
                  
                  <div className="space-y-3">
                    {/* Included Insurance */}
                    <div className="border rounded-lg p-3">
                      <div className="flex items-center mb-2">
                        <input
                          type="radio"
                          id="insurance-included"
                          name="insurance"
                          value="included"
                          checked={bookingState.selectedInsurance === "included"}
                          onChange={(e) => setBookingState(prev => ({ ...prev, selectedInsurance: e.target.value }))}
                          className="mr-3 h-4 w-4 text-blue-600"
                        />
                        <label htmlFor="insurance-included" className="font-medium cursor-pointer">
                          Incluído
                        </label>
                        <span className="ml-auto text-green-600 font-medium">Grátis</span>
                      </div>
                      <p className="text-sm text-gray-600 pl-7">
                        {productData.data.DynInsurance.Included.Description}
                      </p>
                    </div>

                    {/* Insurance Upgrades */}
                    {productData.data.DynInsurance.Upgrades.item.map((upgrade) => (
                      <div key={upgrade.ID} className="border rounded-lg p-3">
                        <div className="flex items-center mb-2">
                          <input
                            type="radio"
                            id={`insurance-${upgrade.ID}`}
                            name="insurance"
                            value={upgrade.ID}
                            checked={bookingState.selectedInsurance === upgrade.ID}
                            onChange={(e) => setBookingState(prev => ({ ...prev, selectedInsurance: e.target.value }))}
                            className="mr-3 h-4 w-4 text-blue-600"
                          />
                          <label htmlFor={`insurance-${upgrade.ID}`} className="font-medium cursor-pointer">
                            Upgrade
                          </label>
                          <span className="ml-auto text-blue-600 font-medium">+€{upgrade.Sellvalue}</span>
                        </div>
                        <p className="text-sm text-gray-600 pl-7">
                          {upgrade.Description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Summary */}
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-800 mb-4">Resumo de Preços</h3>
                  <div className="space-y-2 text-sm">
                    {bookingState.selectedFlight && (() => {
                      const originalFlightOptions = productData?.data?.FlightMainGroup?.item?.[0]?.FlightOptionsSuperBB?.item || [];
                      const selectedOption = originalFlightOptions.find(option => option.OptionCode === bookingState.selectedFlight!.optionCode);
                      return selectedOption && (
                        <div className="flex justify-between">
                          <span>Voo:</span>
                          <span>€{(parseFloat(selectedOption.RateTaxVal) + parseFloat(selectedOption.SuplementsTotalVal) + parseFloat(selectedOption.Tax)).toFixed(2)}</span>
                        </div>
                      );
                    })()}
                    
                    {bookingState.selectedHotel && (() => {
                      const originalHotels = productData?.data?.Itinerary?.item?.find(item => item.Name === "Alojamento")?.HotelOption?.item || [];
                      const selectedHotel = originalHotels.find(hotel => hotel.Code === bookingState.selectedHotel!.hotelCode);
                      const selectedRoom = selectedHotel?.RoomsOccupancy.item[0]?.Rooms.item.find(room => 
                        room.Code === bookingState.selectedHotel!.roomCode && 
                        room.RoomNum === bookingState.selectedHotel!.roomNum
                      );
                      return selectedRoom && (
                        <div className="flex justify-between">
                          <span>Alojamento:</span>
                          <span>€{selectedRoom.SellValue}</span>
                        </div>
                      );
                    })()}
                    
                    {bookingState.selectedInsurance !== "included" && (() => {
                      const upgrade = productData.data.DynInsurance.Upgrades.item.find(
                        item => item.ID === bookingState.selectedInsurance
                      );
                      return upgrade && (
                        <div className="flex justify-between">
                          <span>Seguro:</span>
                          <span>€{upgrade.Sellvalue}</span>
                        </div>
                      );
                    })()}
                    
                    <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span className="text-blue-600">€{calculateTotalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Mandatory Services */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Serviços Incluídos</h3>
                  <div className="space-y-2">
                    {productData.data.OtherMandatoryServices.item.map((service, index) => (
                      <div key={index} className="flex items-center text-sm">
                        <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">{service.Type}: </span>
                        <span className="text-gray-600 ml-1">{service.Description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        </div>

        {/* Sticky Sidebar */}
        <div className="w-80 ml-8">
          <div className="sticky top-28 space-y-4">
            {/* Header Information */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="mb-4">
                <h1 className="text-xl font-bold text-gray-800">{productData.data.Name}</h1>
                <p className="text-gray-600 text-sm">Código: {productData.data.CodeDefined}</p>
                {isDone && (
                  <div className="flex items-center text-green-600 mt-2">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium text-sm">Serviços carregados</span>
                  </div>
                )}
              </div>
              
              {/* Price Breakdown */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h2 className="text-lg font-semibold text-blue-800 mb-3">Resumo de Preços</h2>
                <div className="space-y-2 text-sm">
                  {bookingState.selectedFlight && (() => {
                    const originalFlightOptions = productData?.data?.FlightMainGroup?.item?.[0]?.FlightOptionsSuperBB?.item || [];
                    const selectedOption = originalFlightOptions.find(option => option.OptionCode === bookingState.selectedFlight!.optionCode);
                    return selectedOption && (
                      <div className="flex justify-between">
                        <span>Voo:</span>
                        <span>€{(parseFloat(selectedOption.RateTaxVal) + parseFloat(selectedOption.SuplementsTotalVal) + parseFloat(selectedOption.Tax)).toFixed(2)}</span>
                      </div>
                    );
                  })()}
                  
                  {bookingState.selectedHotel && (() => {
                    const originalHotels = productData?.data?.Itinerary?.item?.find(item => item.Name === "Alojamento")?.HotelOption?.item || [];
                    const selectedHotel = originalHotels.find(hotel => hotel.Code === bookingState.selectedHotel!.hotelCode);
                    const selectedRoom = selectedHotel?.RoomsOccupancy.item[0]?.Rooms.item.find(room => 
                      room.Code === bookingState.selectedHotel!.roomCode && 
                      room.RoomNum === bookingState.selectedHotel!.roomNum
                    );
                    return selectedRoom && (
                      <div className="flex justify-between">
                        <span>Alojamento:</span>
                        <span>€{selectedRoom.SellValue}</span>
                      </div>
                    );
                  })()}
                  
                  {bookingState.selectedInsurance !== "included" && (() => {
                    const upgrade = productData.data.DynInsurance.Upgrades.item.find(
                      item => item.ID === bookingState.selectedInsurance
                    );
                    return upgrade && (
                      <div className="flex justify-between">
                        <span>Seguro:</span>
                        <span>€{upgrade.Sellvalue}</span>
                      </div>
                    );
                  })()}
                  
                  <div className="border-t pt-2 mt-3 flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span className="text-blue-600">€{calculateTotalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="space-y-3">
                {/* Flight Tab Navigation */}
                {bookingState.currentTab === 'flights' && (
                  <>
                    <button
                      disabled={true}
                      className="cursor-not-allowed w-full bg-gray-300 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                    >
                      ← Voltar
                    </button>
                    <button
                      onClick={() => switchTab('hotels')}
                      disabled={!bookingState.selectedFlight}
                      className={`w-full font-medium py-3 px-4 rounded-lg transition-colors ${
                        bookingState.selectedFlight
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      Seguinte →
                    </button>
                  </>
                )}
                
                {/* Hotel Tab Navigation */}
                {bookingState.currentTab === 'hotels' && (
                  <>
                    <button
                      onClick={() => switchTab('flights')}
                      className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                    >
                      ← Voltar
                    </button>
                    <button
                      onClick={() => switchTab('review')}
                      disabled={!bookingState.selectedHotel}
                      className={`w-full font-medium py-3 px-4 rounded-lg transition-colors ${
                        bookingState.selectedHotel
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      Seguinte →
                    </button>
                  </>
                )}

                {/* Review Tab Navigation */}
                {bookingState.currentTab === 'review' && (
                  <>
                    <button
                      onClick={() => switchTab('hotels')}
                      className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                    >
                      ← Voltar
                    </button>
                    <button
                      onClick={() => {
                        // Here you would typically handle the booking confirmation
                        alert('Reserva confirmada! Redireccionar para o processo de pagamento.');
                      }}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                    >
                      Confirmar
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
