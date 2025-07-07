import React from 'react';
import { Hotel, HotelFilters, Range } from '../types';
import VirtualizedHotelList from './VirtualizedHotelList';
import HotelFiltersComponent from './HotelFiltersComponent';

interface HotelTabProps {
  currentLocation: any;
  filteredHotels: Hotel[];
  selectedHotel: { hotelCode: string; roomCode: string; roomNum: string } | null;
  onRoomSelection: (hotelCode: string, roomCode: string, roomNum: string) => void;
  renderStarRating: (rating: string) => React.ReactNode;
  formatDate: (date: string) => string;
  hotelFilters: HotelFilters;
  onFiltersChange: (filters: HotelFilters) => void;
  starRange: Range;
}

const HotelTab = React.memo<HotelTabProps>(({
  currentLocation,
  filteredHotels,
  selectedHotel,
  onRoomSelection,
  renderStarRating,
  formatDate,
  hotelFilters,
  onFiltersChange,
  starRange
}) => {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Escolha o Seu Alojamento - {currentLocation?.Name}
      </h2>
      
      {/* Hotel Filters */}
      <HotelFiltersComponent 
        filters={hotelFilters}
        onFiltersChange={onFiltersChange}
        starRange={starRange}
      />
      
      <div className="space-y-6 mb-6">
        <VirtualizedHotelList 
          key={`hotels-${currentLocation?.Code}-${hotelFilters.selectedStars.join(',')}-${filteredHotels.length}`}
          hotels={filteredHotels}
          selectedHotel={selectedHotel}
          onRoomSelection={onRoomSelection}
          renderStarRating={renderStarRating}
          formatDate={formatDate}
        />
      </div>
    </div>
  );
});

HotelTab.displayName = 'HotelTab';

export default HotelTab;
