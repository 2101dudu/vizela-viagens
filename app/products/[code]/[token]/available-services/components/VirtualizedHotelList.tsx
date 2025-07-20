import React from 'react';
import { Hotel, RoomWithGroup } from '../types';
import HotelCard from './HotelCard';

interface VirtualizedHotelListProps {
  hotels: Hotel[];
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
  onNewRoomsFetched?: (newRooms: RoomWithGroup[], hotelCode: string) => void;
}

const VirtualizedHotelList: React.FC<VirtualizedHotelListProps> = ({ 
  hotels, 
  selectedHotelData, 
  onRoomSelection, 
  renderStarRating, 
  formatDate,
  onNewRoomsFetched 
}) => {
  return (
    <div className="w-full">
      {hotels.map((hotel, index) => (
        <HotelCard 
          key={hotel.Code || index}
          hotel={hotel}
          selectedHotelData={selectedHotelData}
          onRoomSelection={onRoomSelection}
          renderStarRating={renderStarRating}
          formatDate={formatDate}
          onNewRoomsFetched={onNewRoomsFetched}
        />
      ))}
    </div>
  );
};

VirtualizedHotelList.displayName = 'VirtualizedHotelList';

export default VirtualizedHotelList;
