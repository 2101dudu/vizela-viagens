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
  Token: string;
  HasMore: boolean;
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
  flightsToken: string;
  hasMoreFlights: boolean;
  hotelsToken: string;
  hasMoreHotels: boolean;
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

// DynGetSimulationResponse related types
export interface DynResServices {
  Type?: string;
  SubType?: string;
  Description?: string;
  Quant?: string;
  DateFrom?: string;
  DateTo?: string;
  Status?: string;
}

export interface DynResServicesArray {
  item: DynResServices[];
}

export interface DynResCalcs {
  ServiceCode?: string;
  Service?: string;
  Description?: string;
  Quant?: string;
  ComissionPerc?: string;
  GrossUnitVal?: string;
  GrossUnitTotalVal?: string;
  GrossTotalVal?: string;
  ProdId?: string;
}

export interface DynResCalcsArray {
  item: DynResCalcs[];
}

export interface DynResRemarks {
  Type?: string;
  Interface?: string;
  Text?: string;
  RelatedUnit?: string;
}

export interface DynResRemarksArray {
  item: DynResRemarks[];
}

export interface DynHotelWarnings {
  Message?: string;
}

export interface DynHotelWarningsArray {
  item: DynHotelWarnings[];
}

export interface DynResumeCalcs {
  TotalCommisionable?: string;
  TotalNoCommisionable?: string;
  TotalCommision?: string;
  TotalVatCommision?: string;
  TotalInvoice?: string;
  TotalPrice?: string;
  TotalPriceApplyDiscount?: string;
  TotalPriceNotApplyDiscount?: string;
  Discount?: string;
  Total?: string;
}

export interface DynResumeCalcsArray {
  item: DynResumeCalcs[];
}

export interface DynExtraInfo {
  Id?: string;
  Name?: string;
  InputMaxLenght?: string;
  Type?: string;
  MapType?: string;
  Show?: string;
  Required?: string;
  OptList?: DynListArray;
}

export interface DynExtraInfoArray {
  item: DynExtraInfo[];
}

export interface DynListArray {
  item: any[];
}

export interface DynResPaxs {
  Room?: string;
  Type?: string;
  RoomNumber?: string;
  Age?: string;
  RequireBirthDate?: string;
  ExtraInfo?: DynExtraInfoArray;
}

export interface DynResPaxsArray {
  item: DynResPaxs[];
}

export interface DynCharge {
  Amount?: string;
  Currency?: string;
}

export interface DynChargeArray {
  item: DynCharge[];
}

export interface DynDeadline {
  // Define properties if needed
}

export interface DynDeadlineArray {
  item: DynDeadline[];
}

export interface DynCancelPenalties {
  Deadline?: DynDeadlineArray;
  Charge?: DynChargeArray;
}

export interface DynCancelPenaltiesArray {
  item: DynCancelPenalties[];
}

export interface DynPenaltiesInfo {
  CancellationCostsToday?: string;
  NonRefundable?: string;
}

export interface DynPenaltiesInfoArray {
  item: DynPenaltiesInfo[];
}

export interface DynPenaltiesDetail {
  Info?: DynPenaltiesInfoArray;
}

export interface DynPenaltiesDetailArray {
  item: DynPenaltiesDetail[];
}

export interface DynRoomsPenalties {
  Name?: string;
  Code?: string;
  PenaltiesDetails?: DynPenaltiesDetailArray;
  CancelPenalties?: DynCancelPenaltiesArray;
}

export interface DynRoomsPenaltiesArray {
  item: DynRoomsPenalties[];
}

export interface DynPolicies {
  Type?: string;
  OriginType?: string;
  Service?: string;
  DateFrom?: string;
  DateTo?: string;
  ValueType?: string;
  Value?: string;
}

export interface DynPoliciesArray {
  item: DynPolicies[];
}

export interface Error {
  Code?: string;
  Desc?: string;
}

export interface ErrorArray {
  item: Error[];
}

export interface ErrorStruct {
  HasErrors?: string;
  ErrorList?: ErrorArray;
}

export interface DynGetSimulationResponse {
  BillingType?: string;
  AvailableStatus?: string;
  TotalPrice?: string;
  Currency?: string;
  Conditions?: string;
  Services?: DynResServicesArray;
  Calcs?: DynResCalcsArray;
  Remarks?: DynResRemarksArray;
  Pax?: DynResPaxsArray;
  HotelWarnings?: DynHotelWarningsArray;
  RoomsPenalties?: DynRoomsPenaltiesArray;
  Policies?: DynPoliciesArray;
  ResumeCalcs?: DynResumeCalcsArray;
  Errors?: ErrorStruct;
}
