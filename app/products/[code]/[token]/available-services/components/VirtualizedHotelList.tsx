import React from 'react';
import { Hotel } from '../types';
import HotelCard from './HotelCard';

interface VirtualizedHotelListProps {
  hotels: Hotel[];
  selectedHotel: { hotelCode: string; roomCode: string; roomNum: string } | null;
  onRoomSelection: (hotelCode: string, roomCode: string, roomNum: string) => void;
  renderStarRating: (rating: string) => React.ReactNode;
  formatDate: (date: string) => string;
}

const VirtualizedHotelList: React.FC<VirtualizedHotelListProps> = ({ 
  hotels, 
  selectedHotel, 
  onRoomSelection, 
  renderStarRating, 
  formatDate 
}) => {
  return (
    <div className="w-full">
      {hotels.map((hotel, index) => (
        <HotelCard 
          key={hotel.Code || index}
          hotel={hotel}
          selectedHotel={selectedHotel}
          onRoomSelection={onRoomSelection}
          renderStarRating={renderStarRating}
          formatDate={formatDate}
        />
      ))}
    </div>
  );
};

VirtualizedHotelList.displayName = 'VirtualizedHotelList';

export default VirtualizedHotelList;
