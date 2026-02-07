"use client";

import { useParams, useRouter } from "next/navigation";
import React, { useState, useCallback } from "react";
import useFetchProductServices from "@/app/hooks/_fetch_product_services";
import SetProductServices, { SetServicesPayload } from "@/app/hooks/_set_product_services";
import FetchOptionals from "@/app/hooks/_fetch_optionals";

// Import types
import { ProductData, BookingState, DynOptional, OptionalServiceSelection } from './types';

// Import custom hooks
import { 
  useBookingState, 
  useFilters, 
  useDataProcessing, 
  useFilteredData, 
  usePriceCalculation 
} from './hooks/useBooking';
import { useFlightSelection } from './hooks/useFlightSelection';

// Import components
import TabNavigation from './components/TabNavigation';
import FlightTab from './components/FlightTab';
import HotelTab from './components/HotelTab';
import OptionalsTab from './components/OptionalsTab';
import ReviewTab from './components/ReviewTab';
import Sidebar from './components/Sidebar';

// Import utilities
import { formatTime, formatDate } from './utils/formatters';
import { renderStarRating } from './utils/starRating';
import { calculateLocationStarRange, updateLookupMapsWithNewRooms, updateLookupMapsWithNewFlights } from './utils/dataProcessing';
import { base } from "framer-motion/client";

export default function AvailableServicesPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;
  const token = params.token as string;

  const { data, loading, error, isDone } = useFetchProductServices(token);
  const productData = data as ProductData;
  const SessionHash = productData?.data?.SessionHash || '';

  const latestRequestIdRef = React.useRef(0);
  const [simulationData, setSimulationData] = useState<any | null>(null);

  // Custom hooks
  const { bookingState, setBookingState, selectedFlights, setSelectedFlights } = useBookingState();
  const { flightFilters, updateFlightFilters, updateHotelFilters, getHotelFiltersForLocation } = useFilters();
  const { baseData, lookupMaps: initialLookupMaps, ranges } = useDataProcessing(productData);
  
  // State for dynamically updated lookup maps and hotel locations
  const [lookupMaps, setLookupMaps] = useState(initialLookupMaps);
  const [updatedHotelLocations, setUpdatedHotelLocations] = useState(baseData.hotelLocations);
  const [updatedFlightOptions, setUpdatedFlightOptions] = useState(baseData.flightOptions);

  // State for optional services
  const [optionals, setOptionals] = useState<DynOptional[]>([]);
  const [optionalsLoading, setOptionalsLoading] = useState(false);
  const [optionalsError, setOptionalsError] = useState<string | null>(null);
  
  // Update lookup maps when initial data changes
  React.useEffect(() => {
    setLookupMaps(initialLookupMaps);
  }, [initialLookupMaps]);

  // Update hotel locations when base data changes
  React.useEffect(() => {
    setUpdatedHotelLocations(baseData.hotelLocations);
  }, [baseData.hotelLocations]);

  // Update flight options when base data changes
  React.useEffect(() => {
    setUpdatedFlightOptions(baseData.flightOptions);
  }, [baseData.flightOptions]);

  // Fetch optional services
  React.useEffect(() => {
    const fetchOptionals = async () => {
      if (!SessionHash || !code) return;

      setOptionalsLoading(true);
      setOptionalsError(null);

      try {
        const data = await FetchOptionals(SessionHash, code);
        setOptionals(data);

        // Auto-select mandatory optionals
        const mandatory = data.filter((opt: DynOptional) => opt.Mandatory === 'Y');
        if (mandatory.length > 0) {
          setBookingState(prev => {
            const newOptionals = { ...prev.selectedOptionals };

            mandatory.forEach((opt: DynOptional) => {
              // Calculate default passenger counts from hotel selections
              let adults = 0;
              const childAges: number[] = [];

              Object.values(prev.selectedHotels).forEach((hotelSel: any) => {
                const location = baseData.hotelLocations.find((loc: any) =>
                  loc.HotelOption?.item?.some((h: any) => h.Code === hotelSel.hotelCode)
                );
                const hotel = location?.HotelOption?.item?.find((h: any) => h.Code === hotelSel.hotelCode);

                if (hotel) {
                  hotel.RoomsOccupancy.item.forEach((roomGroup: any) => {
                    adults += parseInt(roomGroup.NumAdults || '0');
                    // Assuming child ages are stored somewhere, for now use count
                    const numChildren = parseInt(roomGroup.NumChilds || '0');
                    for (let i = 0; i < numChildren; i++) {
                      childAges.push(10); // Default age, ideally get from actual data
                    }
                  });
                }
              });

              newOptionals[opt.Code || ''] = {
                optional: opt,
                adults: adults || 1,
                childAges
              };
            });

            return { ...prev, selectedOptionals: newOptionals };
          });
        }
      } catch (err: any) {
        setOptionalsError(err.message || 'Erro ao carregar serviços opcionais');
        setOptionals([]);
      } finally {
        setOptionalsLoading(false);
      }
    };

    fetchOptionals();
  }, [SessionHash, code, baseData.hotelLocations]);

  // Get current location filters for proper dependency tracking
  const currentLocationCode = updatedHotelLocations[bookingState.currentHotelIndex]?.Code || '';
  const currentLocationFilters = getHotelFiltersForLocation(currentLocationCode);
  
  // Create updated base data with dynamic flight options and hotel locations
  const updatedBaseData = React.useMemo(() => ({
    flightOptions: updatedFlightOptions,
    hotelLocations: updatedHotelLocations
  }), [updatedFlightOptions, updatedHotelLocations]);
  
  const filteredData = useFilteredData(updatedBaseData, flightFilters, currentLocationFilters, bookingState.currentHotelIndex);
  const totalPrice = usePriceCalculation(bookingState, lookupMaps, productData);

  // Flight selection logic
  const { handleFlightSelection, getSelectedFlightForSegment } = useFlightSelection(
    selectedFlights,
    setSelectedFlights,
    updatedBaseData,
    lookupMaps,
    setBookingState
  );

  // Service setting state
  const [setServicesError, setSetServicesError] = useState<string | null>(null);
  const [setServicesLoading, setSetServicesLoading] = useState(false);
  const [simulToken, setSimulToken] = useState<string | null>(null);
  const [hasTriggeredSetServices, setHasTriggeredSetServices] = useState(false);
  const [isSetServicesInProgress, setIsSetServicesInProgress] = useState(false);
  const [hasPrefetchedSimulation, setHasPrefetchedSimulation] = useState(false);
  const [isSimulationPrefetchInProgress, setIsSimulationPrefetchInProgress] = useState(false);

  // Function to update lookup maps with new rooms
  const updateLookupMapsWithRooms = useCallback((newRooms: any[], hotelCode: string) => {
    setLookupMaps(prevMaps => updateLookupMapsWithNewRooms(prevMaps, newRooms, hotelCode));
  }, []);

  // Function to update lookup maps with new flights
  const updateLookupMapsWithFlights = useCallback((newFlights: any[]) => {
    setLookupMaps(prevMaps => updateLookupMapsWithNewFlights(prevMaps, newFlights));
    setUpdatedFlightOptions(prevFlights => [...prevFlights, ...newFlights]);
  }, []);

  // Function to update hotel locations with new hotels
  const updateHotelLocationsWithNewHotels = useCallback((newHotels: any[], locationCode: string) => {
    setUpdatedHotelLocations(prevLocations => {
      return prevLocations.map(location => {
        if (location.Code === locationCode) {
          // Find existing hotels to avoid duplicates
          const existingHotelCodes = new Set(location.HotelOption?.item?.map((h: any) => h.Code) || []);
          const uniqueNewHotels = newHotels.filter(hotel => !existingHotelCodes.has(hotel.Code));
          
          return {
            ...location,
            HotelOption: {
              ...location.HotelOption,
              item: [...(location.HotelOption?.item || []), ...uniqueNewHotels]
            }
          };
        }
        return location;
      });
    });
  }, []);

  // Hotel room selection handler
  const handleHotelRoomSelection = useCallback((hotelCode: string, roomGroupId: string, roomCode: string, roomNum: string) => {
    const currentLocation = updatedHotelLocations[bookingState.currentHotelIndex];
    if (!currentLocation) return;

    setBookingState(prev => {
      // If selecting a room from a different hotel, clear all selections for this location
      const currentSelections = prev.selectedHotels[currentLocation.Code];
      const isDifferentHotel = currentSelections && currentSelections.hotelCode !== hotelCode;

      if (isDifferentHotel) {
        // Clear all selections for this location and start fresh with the new hotel
        return {
          ...prev,
          selectedHotels: {
            ...prev.selectedHotels,
            [currentLocation.Code]: {
              itineraryCode: currentLocation.Code,
              hotelCode,
              roomSelections: {
                [roomGroupId]: {
                  roomCode,
                  roomNum,
                  roomGroupId
                }
              }
            }
          }
        };
      } else {
        // Same hotel or no previous selection - add/update the room selection
        return {
          ...prev,
          selectedHotels: {
            ...prev.selectedHotels,
            [currentLocation.Code]: {
              itineraryCode: currentLocation.Code,
              hotelCode,
              roomSelections: {
                ...currentSelections?.roomSelections,
                [roomGroupId]: {
                  roomCode,
                  roomNum,
                  roomGroupId
                }
              }
            }
          }
        };
      }
    });
  }, [updatedHotelLocations, bookingState.currentHotelIndex, setBookingState]);

  // Tab access control
  const canAccessTab = useCallback((tab: string) => {
    if (tab === 'flights') return true;
    if (tab.startsWith('hotels-')) return bookingState.selectedFlight !== null;

    const allHotelLocationsSelected = updatedHotelLocations.every(location => {
      const hotelSelection = bookingState.selectedHotels[location.Code];
      if (!hotelSelection) return false;

      // Check if all room groups for this location have selections
      const hotelData = location.HotelOption?.item?.find(h => h.Code === hotelSelection.hotelCode);
      if (!hotelData) return false;

      const requiredRoomGroups = hotelData.RoomsOccupancy.item.length;
      const selectedRoomGroups = Object.keys(hotelSelection.roomSelections || {}).length;

      return selectedRoomGroups === requiredRoomGroups;
    });

    // Optionals tab accessible after all hotels selected
    if (tab === 'optionals') {
      return bookingState.selectedFlight !== null && allHotelLocationsSelected;
    }

    // Review tab accessible after optionals tab is visited (user has seen optionals)
    if (tab === 'review') {
      const optionalsVisited = optionals.length === 0 || bookingState.currentTab === 'optionals' || bookingState.currentTab === 'review';
      return bookingState.selectedFlight !== null && allHotelLocationsSelected && optionalsVisited;
    }

    return false;
  }, [bookingState.selectedFlight, bookingState.selectedHotels, bookingState.currentTab, updatedHotelLocations, optionals.length]);

  // Set services function - runs in background without blocking UI
  const setServices = useCallback(async () => {
    if (!bookingState.selectedFlight || Object.keys(bookingState.selectedHotels).length === 0) {
      setSetServicesError("Missing flight or hotel selection");
      return;
    }

    const currentRequestId = ++latestRequestIdRef.current; // increment ID

    setSimulToken(null);
    setSetServicesLoading(true);
    setIsSetServicesInProgress(true);
    setSetServicesError(null);

    try {
      const flightPayload = [
        {
          OptionCode: bookingState.selectedFlight.optionCode,
          SegmentLists: {
            item: Object.entries(bookingState.selectedFlight.flightSelections).map(
              ([segmentCode, flightGroupCode]) => ({
                SegmentCode: segmentCode,
                FlightGroupCode: flightGroupCode
              })
            )
          }
        }
      ];

      const hotelPayload = Object.entries(bookingState.selectedHotels).map(([locationCode, hotelSelection]) => {
        // Build all room selections for this hotel
        const roomsSelected = Object.values(hotelSelection.roomSelections).map(roomSelection => {
          const roomKey = `${hotelSelection.hotelCode}-${roomSelection.roomCode}-${roomSelection.roomNum}`;
          const selectedRoom = lookupMaps.roomsMap.get(roomKey);
          if (!selectedRoom) {
            throw new Error(`Invalid room selection for location ${locationCode}, room ${roomSelection.roomCode}`);
          }

          return {
            RoomCode: roomSelection.roomCode,
            RoomNum: roomSelection.roomNum
          };
        });

        return {
          ItineraryCode: hotelSelection.itineraryCode,
          HotelSelected: hotelSelection.hotelCode,
          RoomsSelected: {
            item: roomsSelected
          },
        };
      });

      // Build optionals payload
      const optionalsPayload = Object.values(bookingState.selectedOptionals || {}).map(selection => ({
        Code: selection.optional.Code || '',
        Date: selection.date,
        Adults: selection.adults?.toString(),
        ChildAges: selection.childAges.join(','),
        PickUp: selection.pickupLocation,
        PickUpTime: selection.pickupTime,
        Drop: selection.dropoffLocation,
        ItemId: selection.optional.ItemId
      }));

      const payload: SetServicesPayload = {
        SessionHash: SessionHash,
        FlightsSelectedSuperBB: { item: flightPayload },
        HotelsSelected: { item: hotelPayload },
        OptionalsSelected: optionalsPayload.length > 0 ? { item: optionalsPayload } : undefined
      };

      const result = await SetProductServices(code, payload);

      // only accept the result if the request ID is the latest
      if (currentRequestId === latestRequestIdRef.current && result.token !== '') {
        setSimulToken(result.token);
      } else {
        console.log('Discarded outdated setServices result');
      }

    } catch (err: any) {
      if (currentRequestId === latestRequestIdRef.current) {
        setSetServicesError(err.message || "Something went wrong while setting services");
        setSimulToken(null);
      }
    } finally {
      if (currentRequestId === latestRequestIdRef.current) {
        setIsSetServicesInProgress(false);
        console.log('setServices completed');
      }
    }
  }, [bookingState.selectedFlight, bookingState.selectedHotels, bookingState.selectedOptionals, lookupMaps.roomsMap, SessionHash]);


  // Effect to trigger setServices when review tab becomes available
  React.useEffect(() => {
    const reviewTabAvailable = canAccessTab('review');

    if (reviewTabAvailable && bookingState.selectedFlight && Object.keys(bookingState.selectedHotels).length > 0) {
      setServices();
    }
  }, [
    bookingState.selectedFlight, 
    bookingState.selectedHotels, 
    updatedHotelLocations.length, 
    canAccessTab,
    setServices
  ]);


  // Effect to clear loading state when simulToken becomes available
  React.useEffect(() => {
    if (simulToken && setServicesLoading) {
      setSetServicesLoading(false);
    }
  }, [simulToken, setServicesLoading]);

  // Effect to reset prefetch flag when simulToken changes
  React.useEffect(() => {
    if (simulToken) {
      console.log('simulToken changed, resetting prefetch flag and clearing simulation data');
      setHasPrefetchedSimulation(false);
      setIsSimulationPrefetchInProgress(false);
      setSimulationData(null); // Clear previous simulation data
    }
  }, [simulToken]);

  // Tab switching
  const switchTab = useCallback((tab: string) => {
    if (canAccessTab(tab)) {
      if (tab.startsWith('hotels-')) {
        const hotelIndex = parseInt(tab.split('-')[1]);
        setBookingState(prev => ({
          ...prev,
          currentTab: tab,
          currentHotelIndex: hotelIndex
        }));
      } else if (tab === 'review') {
        // For review tab, set the loading state if services are still being set
        if (isSetServicesInProgress && !simulToken) {
          setSetServicesLoading(true);
        }
        setBookingState(prev => ({
          ...prev,
          currentTab: tab
        }));
      } else {
        setBookingState(prev => ({
          ...prev,
          currentTab: tab
        }));
      }
    }
  }, [canAccessTab, setBookingState, isSetServicesInProgress, simulToken]);

  // Function to get simulation data with improved hover prefetch
  const getSimulationData = useCallback(async () => {
    console.log('getSimulationData called - hasPrefetchedSimulation:', hasPrefetchedSimulation, 'simulToken:', simulToken, 'isSetServicesInProgress:', isSetServicesInProgress, 'isSimulationPrefetchInProgress:', isSimulationPrefetchInProgress);
    
    // Don't prefetch if already done or if a prefetch is already in progress
    if (hasPrefetchedSimulation || isSimulationPrefetchInProgress) {
      console.log('Already prefetched or prefetch in progress, skipping...');
      return;
    }

    // If simulToken is not available yet but setServices is in progress, keep polling until it's ready
    if (!simulToken && isSetServicesInProgress) {
      console.log('simulToken not ready yet, setServices in progress - will poll for token...');
      
      // Poll for simulToken with increasing intervals (500ms, 1s, 1.5s, 2s, etc.) up to 20 seconds total
      let attempts = 0;
      const maxAttempts = 20; // 20 attempts over ~20 seconds
      
      const pollForToken = () => {
        attempts++;
        const delay = Math.min(500 + (attempts * 500), 2000); // Increasing delay, max 2s
        
        setTimeout(() => {
          console.log(`Polling attempt ${attempts} for simulToken...`);
          
          // Check if token is now available and we haven't already prefetched
          if (simulToken && !hasPrefetchedSimulation) {
            console.log('simulToken now available, proceeding with prefetch');
            getSimulationData();
          } else if (attempts < maxAttempts && isSetServicesInProgress && !simulToken) {
            // Continue polling if still in progress and no token yet
            pollForToken();
          } else {
            console.log('Stopped polling for simulToken:', { attempts, simulToken: !!simulToken, isSetServicesInProgress, hasPrefetchedSimulation });
          }
        }, delay);
      };
      
      pollForToken();
      return;
    }
    
    if (!simulToken) {
      console.log('simulToken not available yet for prefetch');
      return;
    }
    
    try {
      console.log('Starting simulation data prefetch for token:', simulToken);
      setIsSimulationPrefetchInProgress(true);
      setHasPrefetchedSimulation(true);
      
      const response = await fetch(`http://192.168.1.182:8080/api/dynamic/product/get-simulation?token=${simulToken}`);
      
      if (!response.ok) {
        console.error(`Failed to fetch simulation data: ${response.status}`);
        // Reset prefetch flag on error so it can be retried
        setHasPrefetchedSimulation(false);
        setIsSimulationPrefetchInProgress(false);
        return;
      }
      
      const simulationData = await response.json();
      setSimulationData(simulationData);
      console.log('Successfully prefetched simulation data');
    } catch (error) {
      console.error('Error fetching simulation data:', error);
      // Reset prefetch flag on error so it can be retried
      setHasPrefetchedSimulation(false);
      setIsSimulationPrefetchInProgress(false);
    } finally {
      setIsSimulationPrefetchInProgress(false);
    }
  }, [simulToken, isSetServicesInProgress, hasPrefetchedSimulation, isSimulationPrefetchInProgress]);

  // Effect to auto-trigger simulation prefetch when simulToken becomes available
  React.useEffect(() => {
    if (simulToken && !hasPrefetchedSimulation && !isSimulationPrefetchInProgress) {
      console.log('Auto-triggering simulation prefetch after token became available');
      // Small delay to allow state updates to settle
      setTimeout(() => {
        if (!hasPrefetchedSimulation && !isSimulationPrefetchInProgress) {
          getSimulationData();
        }
      }, 100);
    }
  }, [simulToken, hasPrefetchedSimulation, isSimulationPrefetchInProgress, getSimulationData]);

  // Insurance change handler
  const handleInsuranceChange = useCallback((insuranceId: string) => {
    setBookingState(prev => ({ ...prev, selectedInsurance: insuranceId }));
  }, [setBookingState]);

  // Handle optional service selection
  const handleOptionalSelection = useCallback((
    optionalCode: string,
    selection: OptionalServiceSelection | null
  ) => {
    setBookingState(prev => {
      if (selection === null) {
        // Remove the optional
        const { [optionalCode]: removed, ...rest } = prev.selectedOptionals;
        return { ...prev, selectedOptionals: rest };
      } else {
        // Add or update the optional
        return {
          ...prev,
          selectedOptionals: {
            ...prev.selectedOptionals,
            [optionalCode]: selection
          }
        };
      }
    });
  }, [setBookingState]);

  // Loading state
  if (loading && !isDone) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg">A carregar serviços disponíveis.
            Esta operação pode demorar alguns segundos.</p>
        </div>
      </div>
    );
  }

  // Check for empty flight options or hotels
  const hasHotels = updatedHotelLocations.some(location => 
    location.HotelOption?.item && location.HotelOption.item.length > 0
  );
  
  const hasFlightOptions = baseData?.flightOptions?.length > 0;
  const shouldShowError = !loading && (error || !hasFlightOptions || !hasHotels);
  
  // Only show error state when not loading and either there's an error or no data available
  if (shouldShowError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600 max-w-md">
          <div className="mb-4">
            <svg className="w-16 h-16 mx-auto text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Serviços Indisponíveis</h2>
          
          {baseData.flightOptions.length === 0 && !hasHotels ? (
            <div className="mb-4">
              <p className="mb-2 text-gray-700">
                <strong>Não existem voos ou alojamentos disponíveis</strong> para as suas datas e especificações.
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
          <TabNavigation 
            bookingState={bookingState}
            hotelLocations={updatedHotelLocations}
            canAccessTab={canAccessTab}
            switchTab={switchTab}
            onReviewTabHover={getSimulationData}
          />

          {/* Tab Content */}
          <div className="bg-white rounded-lg shadow-lg">
            {/* Flight Selection Tab */}
            {bookingState.currentTab === 'flights' && (
              <FlightTab 
                filteredFlightOptions={filteredData.filteredFlightOptions}
                selectedFlights={selectedFlights}
                handleFlightSelection={handleFlightSelection}
                getSelectedFlightForSegment={getSelectedFlightForSegment}
                formatTime={formatTime}
                formatDate={formatDate}
                flightFilters={flightFilters}
                onFiltersChange={updateFlightFilters}
                layoverRange={ranges.layoverRange}
                token={productData?.flightsToken || ''}
                hasMore={productData?.hasMoreFlights || false}
                updateLookupMapsWithFlights={updateLookupMapsWithFlights}
              />
            )}

            {/* Hotel Selection Tab */}
            {bookingState.currentTab.startsWith('hotels-') && (
              <HotelTab 
                currentLocation={filteredData.currentLocation}
                filteredHotels={filteredData.filteredHotels}
                selectedHotelData={bookingState.selectedHotels[filteredData.currentLocation?.Code || ''] || null}
                onRoomSelection={handleHotelRoomSelection}
                renderStarRating={renderStarRating}
                formatDate={formatDate}
                hotelFilters={currentLocationFilters}
                onFiltersChange={(filters) => updateHotelFilters(filteredData.currentLocation?.Code || '', filters)}
                starRange={calculateLocationStarRange(filteredData.currentLocation)}
                token={filteredData.currentLocation?.Token || ''}
                hasMore={filteredData.currentLocation?.HasMore || false}
                updateLookupMapsWithRooms={updateLookupMapsWithRooms}
                updateHotelLocationsWithNewHotels={updateHotelLocationsWithNewHotels}
              />
            )}

            {/* Optionals Tab */}
            {bookingState.currentTab === 'optionals' && (
              <OptionalsTab
                optionals={optionals}
                selectedOptionals={bookingState.selectedOptionals || {}}
                onOptionalSelection={handleOptionalSelection}
                flightData={bookingState.selectedFlight}
                paxCounts={(() => {
                  // Calculate passenger counts from hotel selections
                  let adults = 0;
                  const children: number[] = [];

                  Object.values(bookingState.selectedHotels).forEach((hotelSel: any) => {
                    const location = updatedHotelLocations.find((loc: any) =>
                      loc.HotelOption?.item?.some((h: any) => h.Code === hotelSel.hotelCode)
                    );
                    const hotel = location?.HotelOption?.item?.find((h: any) => h.Code === hotelSel.hotelCode);

                    if (hotel) {
                      hotel.RoomsOccupancy.item.forEach((roomGroup: any) => {
                        adults += parseInt(roomGroup.NumAdults || '0');
                        const numChildren = parseInt(roomGroup.NumChilds || '0');
                        // Add default ages for children
                        for (let i = 0; i < numChildren; i++) {
                          children.push(10); // Default age
                        }
                      });
                    }
                  });

                  return { adults: adults || 1, children };
                })()}
                loading={optionalsLoading}
              />
            )}

            {/* Review Tab */}
            {bookingState.currentTab === 'review' && (
              <>
                {setServicesLoading && !simulToken ? (
                  <div className="bg-white rounded-lg shadow-lg p-8">
                    <div className="flex items-center justify-center min-h-64">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p className="text-lg text-gray-700">A preparar a sua reserva...</p>
                        <p className="text-sm text-gray-500 mt-2">Por favor aguarde alguns segundos.</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <ReviewTab 
                    bookingState={bookingState}
                    productData={productData}
                    hotelLocations={updatedHotelLocations}
                    totalPrice={totalPrice}
                    formatDate={formatDate}
                    renderStarRating={renderStarRating}
                    onInsuranceChange={handleInsuranceChange}
                    simulationData={simulationData}
                    setServicesError={setServicesError}
                  />
                )}
              </>
            )}
          </div>
        </div>

        {/* Sticky Sidebar */}
        <Sidebar 
          productData={productData}
          bookingState={bookingState}
          hotelLocations={updatedHotelLocations}
          switchTab={switchTab}
          totalPrice={totalPrice}
          isDone={isDone}
          renderStarRating={renderStarRating}
          onConfirmButtonHover={getSimulationData}
          token={simulToken}
          lookupMaps={lookupMaps}
        />
      </div>
    </div>
  );
}
