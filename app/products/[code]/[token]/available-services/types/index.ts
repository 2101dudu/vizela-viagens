// Type definitions for the booking system

export interface Flight {
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

export interface FlightGroup {
  FlightGroupCode: string;
  NumStopOvers: string;
  Flights: {
    item: Flight[];
  };
}

export interface FlightSegment {
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

export interface FlightOption {
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

export interface Room {
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

export interface RoomGroup {
  RoomGroup: string;
  NumAdults: string;
  NumChilds: string;
  Rooms: {
    item: Room[];
  };
}

export interface Hotel {
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

export interface InsuranceUpgrade {
  ID: string;
  Code: string;
  Description: string;
  Sellvalue: string;
}

export interface DynInsurance {
  Included: {
    ID: string;
    Code: string;
    Description: string;
  };
  Upgrades: {
    item: InsuranceUpgrade[];
  };
}

export interface ProductData {
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

export interface BookingState {
  currentTab: 'flights' | string | 'review';
  currentHotelIndex: number;
  selectedFlight: {
    optionCode: string;
    flightSelections: {
      [segmentCode: string]: string;
    };
  } | null;
  selectedHotels: {
    [itineraryCode: string]: {
      itineraryCode: string;
      hotelCode: string;
      roomCode: string;
      roomNum: string;
    };
  };
  selectedInsurance: string;
}

// Extended interfaces for components
export interface RoomWithGroup extends Room {
  roomGroup: string;
}

export interface RoomWithHotel extends Room {
  hotelCode: string;
  roomGroup: string;
}

// Filter interfaces
export interface FlightFilters {
  selectedLayovers: number[];
}

export interface HotelFilters {
  selectedStars: number[];
}

// Range interfaces
export interface Range {
  min: number;
  max: number;
}

export interface Ranges {
  layoverRange: Range;
  starRange: Range;
}

// Lookup map interfaces
export interface LookupMaps {
  flightOptionsMap: Map<string, FlightOption>;
  hotelLocationMaps: Map<string, Hotel[]>;
  roomsMap: Map<string, RoomWithHotel>;
}
