"use client";

import { useParams, useRouter } from "next/navigation";
import React, { useState } from "react";
import Image from "next/image";
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

export default function AvailableServicesPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code;
  const token = params.token as string;
  
  const [bookingState, setBookingState] = useState<BookingState>({
    currentTab: 'flights',
    selectedFlight: null,
    selectedHotel: null,
    selectedInsurance: 'included'
  });
  
  const [selectedFlights, setSelectedFlights] = useState<{[optionCode: string]: {[segmentCode: string]: string}}>({});

  const { data, loading, error, isDone } = useFetchProductServices(token);

  const productData = data as ProductData;
  const flightOptions = productData?.data?.FlightMainGroup?.item?.[0]?.FlightOptionsSuperBB?.item || [];
  const hotels = productData?.data?.Itinerary?.item?.find(item => item.Name === "Alojamento")?.HotelOption?.item || [];

  // Initialize selected flights for each option with first available flight
  React.useEffect(() => {
    if (flightOptions.length > 0 && Object.keys(selectedFlights).length === 0) {
      const initialSelections: {[optionCode: string]: {[segmentCode: string]: string}} = {};
      
      flightOptions.forEach(option => {
        initialSelections[option.OptionCode] = {};
        option.FlightSegments.item.forEach(segment => {
          if (segment.Flights.item.length > 0) {
            initialSelections[option.OptionCode][segment.SegmentCode] = "0";
          }
        });
      });
      
      setSelectedFlights(initialSelections);
      
      // Set default selected flight
      if (!bookingState.selectedFlight) {
        setBookingState(prev => ({
          ...prev,
          selectedFlight: {
            optionCode: "0",
            flightSelections: initialSelections["0"] || {}
          }
        }));
      }
    }
  }, [flightOptions, selectedFlights, bookingState.selectedFlight]);

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
            onClick={() => router.push(`/product/${code}`)}
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

  const handleFlightOptionChange = (optionCode: string) => {
    setBookingState(prev => ({
      ...prev,
      selectedFlight: {
        optionCode,
        flightSelections: selectedFlights[optionCode] || {}
      }
    }));
  };

  const handleFlightSelection = (optionCode: string, segmentCode: string, flightGroupCode: string) => {
    setSelectedFlights(prev => ({
      ...prev,
      [optionCode]: {
        ...prev[optionCode],
        [segmentCode]: flightGroupCode
      }
    }));
    
    if (bookingState.selectedFlight?.optionCode === optionCode) {
      setBookingState(prev => ({
        ...prev,
        selectedFlight: {
          ...prev.selectedFlight!,
          flightSelections: {
            ...prev.selectedFlight!.flightSelections,
            [segmentCode]: flightGroupCode
          }
        }
      }));
    }
  };

  const handleHotelRoomSelection = (hotelCode: string, roomCode: string, roomNum: string) => {
    setBookingState(prev => ({
      ...prev,
      selectedHotel: {
        hotelCode,
        roomCode,
        roomNum
      }
    }));
  };

  const getSelectedFlightForSegment = (optionCode: string, segmentCode: string) => {
    return selectedFlights[optionCode]?.[segmentCode] || "0";
  };

  const canAccessTab = (tab: 'flights' | 'hotels' | 'review') => {
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
  };

  const switchTab = (tab: 'flights' | 'hotels' | 'review') => {
    if (canAccessTab(tab)) {
      setBookingState(prev => ({
        ...prev,
        currentTab: tab
      }));
    }
  };

  const formatTime = (time: string) => {
    if (time.length === 4) {
      return `${time.substring(0, 2)}:${time.substring(2, 4)}`;
    }
    return time;
  };

  const formatDate = (date: string) => {
    if (date.length === 10) {
      const [year, month, day] = date.split('-');
      return `${day}/${month}/${year}`;
    }
    return date;
  };

  const calculateTotalPrice = () => {
    let total = 0;
    
    // Flight price
    if (bookingState.selectedFlight) {
      const selectedOption = flightOptions.find(option => option.OptionCode === bookingState.selectedFlight!.optionCode);
      if (selectedOption) {
        total += parseFloat(selectedOption.RateTaxVal) || 0;
        total += parseFloat(selectedOption.SuplementsTotalVal) || 0;
        total += parseFloat(selectedOption.Tax) || 0;
      }
    }
    
    // Hotel price
    if (bookingState.selectedHotel) {
      const selectedHotel = hotels.find(hotel => hotel.Code === bookingState.selectedHotel!.hotelCode);
      if (selectedHotel) {
        const roomGroup = selectedHotel.RoomsOccupancy.item[0];
        if (roomGroup) {
          const selectedRoom = roomGroup.Rooms.item.find(room => 
            room.Code === bookingState.selectedHotel!.roomCode && 
            room.RoomNum === bookingState.selectedHotel!.roomNum
          );
          if (selectedRoom) {
            total += parseFloat(selectedRoom.SellValue) || 0;
          }
        }
      }
    }
    
    // Insurance price
    if (bookingState.selectedInsurance !== "included") {
      const upgrade = productData.data.DynInsurance.Upgrades.item.find(
        item => item.ID === bookingState.selectedInsurance
      );
      if (upgrade) {
        total += parseFloat(upgrade.Sellvalue) || 0;
      }
    }
    
    return total;
  };

  const renderStarRating = (rating: string) => {
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
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{productData.data.Name}</h1>
              <p className="text-gray-600">Código: {productData.data.CodeDefined}</p>
            </div>
            {isDone && (
              <div className="flex items-center text-green-600">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Serviços carregados</span>
              </div>
            )}
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-blue-800 mb-2">Preço Total</h2>
            <div className="text-3xl font-bold text-blue-600">
              €{calculateTotalPrice().toFixed(2)}
            </div>
          </div>
        </div>

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
          {/* Flight Selection Tab */}
          {bookingState.currentTab === 'flights' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Escolha a Sua Opção de Voo</h2>
              
              <div className="space-y-6 mb-6">
                {flightOptions.map((option) => (
                  <div 
                    key={option.OptionCode} 
                    className={`border-2 rounded-lg p-6 transition-all cursor-pointer ${
                      bookingState.selectedFlight?.optionCode === option.OptionCode 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleFlightOptionChange(option.OptionCode)}
                  >
                    {/* Option Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                          bookingState.selectedFlight?.optionCode === option.OptionCode 
                            ? 'border-blue-500 bg-blue-500' 
                            : 'border-gray-300'
                        }`}>
                          {bookingState.selectedFlight?.optionCode === option.OptionCode && (
                            <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                          )}
                        </div>
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
                        <div key={segment.SegmentCode} className="bg-white rounded-lg border border-gray-100 p-4">
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
                            <div className="flex items-center justify-between text-sm">
                              <div>
                                <span className="font-medium">{segment.FromIATADesc}</span>
                                <span className="text-gray-500 ml-1">({segment.FromIATA})</span>
                              </div>
                              <div className="text-center text-gray-400">
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
                            <div className="text-sm text-orange-600 font-medium mb-2">
                              Múltiplas opções de voo disponíveis - escolha uma:
                            </div>
                          )}
                          
                          <div className="space-y-2">
                            {segment.Flights.item.map((flightGroup) => (
                              <div 
                                key={flightGroup.FlightGroupCode}
                                className={`border rounded-md p-3 cursor-pointer transition-colors ${
                                  getSelectedFlightForSegment(option.OptionCode, segment.SegmentCode) === flightGroup.FlightGroupCode
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleFlightSelection(option.OptionCode, segment.SegmentCode, flightGroup.FlightGroupCode);
                                }}
                              >
                                <div className="flex items-center mb-2">
                                  <div className={`w-3 h-3 rounded-full border mr-2 ${
                                    getSelectedFlightForSegment(option.OptionCode, segment.SegmentCode) === flightGroup.FlightGroupCode
                                      ? 'border-blue-500 bg-blue-500'
                                      : 'border-gray-300'
                                  }`}>
                                    {getSelectedFlightForSegment(option.OptionCode, segment.SegmentCode) === flightGroup.FlightGroupCode && (
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
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Next Button */}
              {bookingState.selectedFlight && (
                <div className="flex justify-end">
                  <button
                    onClick={() => switchTab('hotels')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                  >
                    Seguinte: Escolher Alojamento
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Hotel Selection Tab */}
          {bookingState.currentTab === 'hotels' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Escolha o Seu Alojamento</h2>
              
              <div className="space-y-6 mb-6">
                {hotels.map((hotel) => (
                  <div key={hotel.Code} className="border rounded-lg overflow-hidden">
                    <div className="md:flex">
                      {/* Hotel Image */}
                      <div className="md:w-1/3">
                        <div className="relative h-48 md:h-full">
                          <Image
                            src={hotel.Image}
                            alt={hotel.Name}
                            fill
                            className="object-cover"
                            onError={(e) => {
                              e.currentTarget.src = '/fallback.png';
                            }}
                          />
                        </div>
                      </div>
                      
                      {/* Hotel Details */}
                      <div className="md:w-2/3 p-6">
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

                        {/* Room Selection */}
                        <div className="space-y-3">
                          <h4 className="font-semibold text-gray-800">Escolha o seu quarto:</h4>
                          {hotel.RoomsOccupancy.item.map((roomGroup) => (
                            <div key={roomGroup.RoomGroup} className="space-y-2">
                              {roomGroup.Rooms.item.map((room) => (
                                <div
                                  key={`${room.Code}-${room.RoomNum}`}
                                  className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                                    bookingState.selectedHotel?.hotelCode === hotel.Code &&
                                    bookingState.selectedHotel?.roomCode === room.Code &&
                                    bookingState.selectedHotel?.roomNum === room.RoomNum
                                      ? 'border-blue-500 bg-blue-50'
                                      : 'border-gray-200 hover:border-gray-300'
                                  }`}
                                  onClick={() => handleHotelRoomSelection(hotel.Code, room.Code, room.RoomNum)}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                      <div className={`w-3 h-3 rounded-full border mr-3 ${
                                        bookingState.selectedHotel?.hotelCode === hotel.Code &&
                                        bookingState.selectedHotel?.roomCode === room.Code &&
                                        bookingState.selectedHotel?.roomNum === room.RoomNum
                                          ? 'border-blue-500 bg-blue-500'
                                          : 'border-gray-300'
                                      }`}>
                                        {bookingState.selectedHotel?.hotelCode === hotel.Code &&
                                         bookingState.selectedHotel?.roomCode === room.Code &&
                                         bookingState.selectedHotel?.roomNum === room.RoomNum && (
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
                                          +€{room.UpgradeSupVal} upgrade
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between">
                <button
                  onClick={() => switchTab('flights')}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  Voltar aos Voos
                </button>
                
                {bookingState.selectedHotel && (
                  <button
                    onClick={() => switchTab('review')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                  >
                    Seguinte: Revisão
                  </button>
                )}
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
                      const selectedFlightOption = flightOptions.find(option => option.OptionCode === bookingState.selectedFlight!.optionCode);
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
                      const selectedHotel = hotels.find(hotel => hotel.Code === bookingState.selectedHotel!.hotelCode);
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
                      const selectedOption = flightOptions.find(option => option.OptionCode === bookingState.selectedFlight!.optionCode);
                      return selectedOption && (
                        <div className="flex justify-between">
                          <span>Voo:</span>
                          <span>€{(parseFloat(selectedOption.RateTaxVal) + parseFloat(selectedOption.SuplementsTotalVal) + parseFloat(selectedOption.Tax)).toFixed(2)}</span>
                        </div>
                      );
                    })()}
                    
                    {bookingState.selectedHotel && (() => {
                      const selectedHotel = hotels.find(hotel => hotel.Code === bookingState.selectedHotel!.hotelCode);
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
                      <span className="text-blue-600">€{calculateTotalPrice().toFixed(2)}</span>
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

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-6">
                <button
                  onClick={() => switchTab('hotels')}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  Voltar ao Alojamento
                </button>
                
                <button
                  onClick={() => {
                    // Here you would typically handle the booking confirmation
                    alert('Reserva confirmada! Redireccionar para o processo de pagamento.');
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  Continuar para Reserva
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
