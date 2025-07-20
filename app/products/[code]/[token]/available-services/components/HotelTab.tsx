import React, { useState } from 'react';
import { Hotel, HotelFilters, Range } from '../types';
import VirtualizedHotelList from './VirtualizedHotelList';
import HotelFiltersComponent from './HotelFiltersComponent';
import FetchMoreHotels from '../hooks/useFetchMoreHotels';

interface HotelTabProps {
  currentLocation: any;
  filteredHotels: Hotel[];
  selectedHotelData: {
    hotelCode: string;
    roomSelections: {
      [roomGroupId: string]: {
        roomCode: string;
        roomNum: string;
        roomGroupId: string;
      };
    };
  } | null;
  onRoomSelection: (hotelCode: string, roomGroupId: string, roomCode: string, roomNum: string) => void;
  renderStarRating: (rating: string) => React.ReactNode;
  formatDate: (date: string) => string;
  hotelFilters: HotelFilters;
  onFiltersChange: (filters: HotelFilters) => void;
  starRange: Range;
  token: string;
  hasMore: boolean;
  updateLookupMapsWithRooms: (newRooms: any[], hotelCode: string) => void;
  updateHotelLocationsWithNewHotels: (newHotels: any[], locationCode: string) => void;
}

const HotelTab = React.memo<HotelTabProps>(({
  currentLocation,
  filteredHotels,
  selectedHotelData,
  onRoomSelection,
  renderStarRating,
  formatDate,
  hotelFilters,
  onFiltersChange,
  starRange,
  token,
  hasMore,
  updateLookupMapsWithRooms,
  updateHotelLocationsWithNewHotels,
}) => {
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [allHotels, setAllHotels] = useState<Hotel[]>(filteredHotels);
  const [hasMoreHotels, setHasMoreHotels] = useState(hasMore);
  const [fetchedHotels, setFetchedHotels] = useState<Hotel[]>([]);
  const [hasFetched, setHasFetched] = useState(false);
  const [hasHotelsToShow, setHasHotelsToShow] = useState(false);

  // Update local state when props change
  React.useEffect(() => {
    setAllHotels(filteredHotels);
    setHasMoreHotels(hasMore);
  }, [filteredHotels, hasMore]);

  const fetchMoreHotels = async () => {
    if (isLoadingMore || hasFetched) return;
    
    setIsLoadingMore(true);
    try {
      const result = await FetchMoreHotels(token, allHotels.length, 5);
      setFetchedHotels(result.hotels);
      setHasFetched(true);
      setHasMoreHotels(result.hasMore);
      setHasHotelsToShow(true);
    } catch (error) {
      console.error('Error fetching more hotels:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const showMoreHotels = () => {
    if (hasFetched) {
      setAllHotels(prevHotels => [...prevHotels, ...fetchedHotels]);
      // Also update the base hotel locations data
      updateHotelLocationsWithNewHotels(fetchedHotels, currentLocation?.Code || '');
      setHasFetched(false);
      setHasHotelsToShow(false);
    }
  };
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Escolha o Seu Alojamento {currentLocation?.Name === "Alojamento" ? "" : "— " + currentLocation?.Name}
      </h2>
      
      {/* Hotel Filters */}
      <HotelFiltersComponent 
        filters={hotelFilters}
        onFiltersChange={onFiltersChange}
        starRange={starRange}
      />
      
      <div className="space-y-6 mb-6">
        <VirtualizedHotelList 
          key={`hotels-${currentLocation?.Code}-${hotelFilters.selectedStars.join(',')}-${allHotels.length}`}
          hotels={allHotels}
          selectedHotelData={selectedHotelData}
          onRoomSelection={onRoomSelection}
          renderStarRating={renderStarRating}
          formatDate={formatDate}
          onNewRoomsFetched={updateLookupMapsWithRooms}
        />
      </div>
      
      {/* Load More Button */}
      {(hasMoreHotels || hasHotelsToShow) && (
        <div className="flex justify-center mt-8">
          <button
            onMouseEnter={fetchMoreHotels}
            onClick={showMoreHotels}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {'Ver mais'}
          </button>
        </div>
      )}
    </div>
  );
});

HotelTab.displayName = 'HotelTab';

export default HotelTab;
