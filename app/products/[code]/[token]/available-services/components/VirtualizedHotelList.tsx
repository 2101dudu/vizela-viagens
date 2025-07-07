import React from 'react';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
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
  const Row = ({ index, style }: ListChildComponentProps) => {
    const hotel = hotels[index];

    return (
      <div style={style}>
        <HotelCard 
          hotel={hotel}
          selectedHotel={selectedHotel}
          onRoomSelection={onRoomSelection}
          renderStarRating={renderStarRating}
          formatDate={formatDate}
        />
      </div>
    );
  };

  return (
    <List
      height={800} // height of the entire list container (adjust as needed)
      itemCount={hotels.length}
      itemSize={700} // height of each item (you may need to tweak this)
      width="100%"
    >
      {Row}
    </List>
  );
};

VirtualizedHotelList.displayName = 'VirtualizedHotelList';

export default VirtualizedHotelList;
