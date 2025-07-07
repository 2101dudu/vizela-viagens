import React from 'react';
import { FixedSizeList as List } from 'react-window';
import { RoomWithGroup } from '../types';
import RoomCard from './RoomCard';

interface VirtualizedRoomListProps {
  allRooms: RoomWithGroup[];
  hotelCode: string;
  selectedHotel: { hotelCode: string; roomCode: string; roomNum: string } | null;
  onRoomSelection: (hotelCode: string, roomCode: string, roomNum: string) => void;
}

const VirtualizedRoomList = React.memo<VirtualizedRoomListProps>(({ 
  allRooms, 
  hotelCode,
  selectedHotel, 
  onRoomSelection 
}) => {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const room = allRooms[index];
    const isSelected = 
      selectedHotel?.hotelCode === hotelCode &&
      selectedHotel?.roomCode === room.Code &&
      selectedHotel?.roomNum === room.RoomNum;

    return (
      <div style={{ ...style, paddingBottom: '8px' }}>
        <RoomCard 
          room={room}
          hotelCode={hotelCode}
          isSelected={isSelected}
          onSelect={() => onRoomSelection(hotelCode, room.Code, room.RoomNum)}
        />
      </div>
    );
  };

  return (
    <List
      height={320} // Fixed height for room list virtualization
      width="100%" // Full width
      itemCount={allRooms.length}
      itemSize={85} // Height per room card
    >
      {Row}
    </List>
  );
});

VirtualizedRoomList.displayName = 'VirtualizedRoomList';

export default VirtualizedRoomList;
