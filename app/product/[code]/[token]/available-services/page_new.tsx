"use client";

import { useParams, useRouter } from "next/navigation";
import React, { useState } from "react";
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
        {bookingState.currentTab === 'flights' && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
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
                  {/* Flight content */}
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
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    Reservar até: {formatDate(option.Lasttkdt)}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Next Button */}
            {bookingState.selectedFlight && (
              <div className="flex justify-end">
                <button
                  onClick={() => switchTab('hotels')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Seguinte
                </button>
              </div>
            )}
          </div>
        )}

        {bookingState.currentTab === 'hotels' && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Escolha o Seu Alojamento</h2>
            
            <div className="space-y-6 mb-6">
              {hotels.map((hotel) => {
                const isHotelSelected = bookingState.selectedHotel?.hotelCode === hotel.Code;
                const roomGroup = hotel.RoomsOccupancy.item[0];
                
                return (
                  <div 
                    key={hotel.Code}
                    className={`border rounded-lg p-6 transition-all ${
                      isHotelSelected ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    {/* Hotel Header */}
                    <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-6 mb-4">
                      <div className="flex-shrink-0 mb-4 lg:mb-0">
                        <img
                          src={hotel.Image}
                          alt={hotel.Name}
                          className="w-full lg:w-64 h-48 object-cover rounded-lg"
                          onError={(e) => {
                            e.currentTarget.src = '/fallback.png';
                          }}
                        />
                      </div>
                      
                      <div className="flex-grow">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-xl font-bold text-gray-800">{hotel.Name}</h3>
                            <div className="flex items-center mt-1">
                              {Array.from({ length: parseInt(hotel.Rating) }, (_, i) => (
                                <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                              <span className="ml-2 text-sm text-gray-600">{hotel.Rating} estrelas</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-600">
                              A partir de €{hotel.PriceFrom}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600 mb-3">
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          <span className="flex-grow">{hotel.Address}</span>
                          <button
                            onClick={() => {
                              const url = `https://www.google.com/maps?q=${hotel.GpsLatitude},${hotel.GpsLongitude}&z=15&t=m&q=${encodeURIComponent(hotel.Name)}`;
                              window.open(url, '_blank');
                            }}
                            className="ml-2 text-blue-600 hover:text-blue-800 underline"
                          >
                            Ver no Mapa
                          </button>
                        </div>
                        
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Check-in:</span> {formatDate(hotel.CheckIn)} | 
                          <span className="font-medium ml-2">Check-out:</span> {formatDate(hotel.CheckOut)}
                        </div>
                      </div>
                    </div>
                    
                    {/* Room Selection */}
                    <div className="border-t pt-4">
                      <h4 className="text-lg font-semibold text-gray-700 mb-3">Escolha o Seu Quarto</h4>
                      <div className="space-y-3">
                        {roomGroup?.Rooms.item.map((room) => (
                          <div
                            key={`${room.Code}-${room.RoomNum}`}
                            className={`border rounded-md p-4 cursor-pointer transition-colors ${
                              bookingState.selectedHotel?.roomCode === room.Code && 
                              bookingState.selectedHotel?.roomNum === room.RoomNum
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => handleHotelRoomSelection(hotel.Code, room.Code, room.RoomNum)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                                  bookingState.selectedHotel?.roomCode === room.Code && 
                                  bookingState.selectedHotel?.roomNum === room.RoomNum
                                    ? 'border-blue-500 bg-blue-500'
                                    : 'border-gray-300'
                                }`}>
                                  {bookingState.selectedHotel?.roomCode === room.Code && 
                                   bookingState.selectedHotel?.roomNum === room.RoomNum && (
                                    <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                                  )}
                                </div>
                                <div>
                                  <h5 className="font-semibold text-gray-800">{room.Name}</h5>
                                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                                    <span>{room.BoardDescription}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="text-right">
                                <div className="text-xl font-bold text-green-600">
                                  €{room.SellValue}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Next Button */}
            {bookingState.selectedHotel && (
              <div className="flex justify-end">
                <button
                  onClick={() => switchTab('review')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Seguinte
                </button>
              </div>
            )}
          </div>
        )}

        {bookingState.currentTab === 'review' && (
          <div className="space-y-6">
            {/* Final Price and Book Button */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Preço Final</h2>
                <div className="text-3xl font-bold text-blue-600">
                  €{calculateTotalPrice().toFixed(2)}
                </div>
              </div>
              
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
                Continuar para Reserva
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
