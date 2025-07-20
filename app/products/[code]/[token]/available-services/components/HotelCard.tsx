import React, { useState } from 'react';
import { Hotel, RoomWithGroup, RoomGroup } from '../types';
import RoomCard from './RoomCard';
import FetchMoreRooms from '../hooks/useFetchMoreRooms';

interface RoomGroupState {
  id: number;
  roomGroup: RoomGroup;
  allRooms: RoomWithGroup[];
  isLoadingMore: boolean;
  hasMoreRooms: boolean;
  fetchedRooms: RoomWithGroup[];
  hasFetched: boolean;
  hasRoomsToShow: boolean;
}

interface HotelCardProps {
  hotel: Hotel;
  selectedHotel: { hotelCode: string; roomCode: string; roomNum: string } | null;
  onRoomSelection: (hotelCode: string, roomCode: string, roomNum: string) => void;
  renderStarRating: (rating: string) => React.ReactNode;
  formatDate: (date: string) => string;
  onNewRoomsFetched?: (newRooms: RoomWithGroup[], hotelCode: string) => void;
}

const HotelCard = React.memo<HotelCardProps>(({ 
  hotel, 
  selectedHotel, 
  onRoomSelection, 
  renderStarRating, 
  formatDate,
  onNewRoomsFetched
}) => {
  // State for each room group
  const [roomGroupStates, setRoomGroupStates] = useState(() =>
    hotel.RoomsOccupancy.item.map((roomGroup, index) => ({
      id: index,
      roomGroup,
      allRooms: roomGroup.Rooms.item.map(room => ({ ...room, roomGroup: roomGroup.RoomGroup })),
      isLoadingMore: false,
      hasMoreRooms: roomGroup.HasMore,
      fetchedRooms: [] as RoomWithGroup[],
      hasFetched: false,
      hasRoomsToShow: false,
    }))
  );

  // Update local state when props change
  React.useEffect(() => {
    const newStates = hotel.RoomsOccupancy.item.map((roomGroup, index) => ({
      id: index,
      roomGroup,
      allRooms: roomGroup.Rooms.item.map(room => ({ ...room, roomGroup: roomGroup.RoomGroup })),
      isLoadingMore: false,
      hasMoreRooms: roomGroup.HasMore,
      fetchedRooms: [] as RoomWithGroup[],
      hasFetched: false,
      hasRoomsToShow: false,
    }));
    setRoomGroupStates(newStates);
  }, [hotel]);

  const fetchMoreRooms = async (groupIndex: number) => {
    const currentState = roomGroupStates[groupIndex];
    if (currentState.isLoadingMore || currentState.hasFetched) return;
    
    setRoomGroupStates(prev => prev.map((state, index) => 
      index === groupIndex ? { ...state, isLoadingMore: true } : state
    ));

    try {
      const result = await FetchMoreRooms(
        currentState.roomGroup.Token, 
        currentState.allRooms.length, 
        5
      );
      
      setRoomGroupStates(prev => prev.map((state, index) => 
        index === groupIndex ? {
          ...state,
          fetchedRooms: result.rooms,
          hasFetched: true,
          hasMoreRooms: result.hasMore,
          hasRoomsToShow: true,
          isLoadingMore: false,
        } : state
      ));

      // Update the original data structure
      hotel.RoomsOccupancy.item[groupIndex].Rooms.item.push(...result.rooms);
      
      // Call the callback to update lookup maps with new rooms
      if (onNewRoomsFetched) {
        onNewRoomsFetched(result.rooms, hotel.Code);
      }
    } catch (error) {
      console.error('Error fetching more rooms:', error);
      setRoomGroupStates(prev => prev.map((state, index) => 
        index === groupIndex ? { ...state, isLoadingMore: false } : state
      ));
    }
  };

  const showMoreRooms = (groupIndex: number) => {
    const currentState = roomGroupStates[groupIndex];
    if (currentState.hasFetched) {
      setRoomGroupStates(prev => prev.map((state, index) => 
        index === groupIndex ? {
          ...state,
          allRooms: [...state.allRooms, ...state.fetchedRooms],
          hasFetched: false,
          hasRoomsToShow: false,
        } : state
      ));
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="">
        <div className="md:w-full flex">
          <div className="relative h-64 w-80">
            <img
              src={hotel.Image === "" ? "/fallback.png" : hotel.Image}
              alt={hotel.Name}
              loading="lazy"
              className="object-cover w-full h-full"
              onError={(e) => {
                e.currentTarget.src = '/fallback.png';
              }}
            />
          </div>

          <div className="flex flex-col justify-between mt-8 mx-8 w-3/5">
            <div className="flex">
              <div className="w-full">
                <div className="flex justify-between">
                  <div className="flex flex-col">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{hotel.Name}</h3>
                    {renderStarRating(hotel.Rating)}
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">A partir de</div>
                    <div className="text-2xl font-bold text-green-600">€{hotel.PriceFrom}</div>
                  </div>
                </div>
                <div className="flex items-center mt-8 text-sm text-gray-600">
                  <svg className="ml-1.5 w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <span>{hotel.Address}</span>
                </div>
                <a
                  href={`https://www.google.com/maps?q=${hotel.GpsLatitude},${hotel.GpsLongitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-blue-600 hover:text-blue-800 mt-2 text-sm"
                >
                 [ Ver no mapa ]
                </a>
              </div>
            </div>
            <div className="ml-2 text-sm text-gray-600">
              <div className="flex items-center space-x-4">
                <span>Check-in: {formatDate(hotel.CheckIn)}</span>
                <span>Check-out: {formatDate(hotel.CheckOut)}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Hotel Details */}
        <div className="md:w-full p-6">
          {/* Room Selection - Multiple Room Groups */}
          <div className="space-y-6">
            <h4 className="font-semibold text-gray-800">Escolha os seus quartos:</h4>
            
            {roomGroupStates.map((roomGroupState, groupIndex) => {
              const { roomGroup, allRooms, hasMoreRooms, hasRoomsToShow } = roomGroupState;
              
              return (
                <div key={`${hotel.Code}-group-${groupIndex}`} className="border border-gray-200 rounded-lg p-4">
                  {/* Room Group Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <h5 className="font-medium text-gray-700">
                        Quarto {groupIndex + 1}
                      </h5>
                      <div className="text-sm text-gray-600 flex items-center space-x-2">
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                          {roomGroup.NumAdults} adulto{roomGroup.NumAdults !== '1' ? 's' : ''}
                        </span>
                        {parseInt(roomGroup.NumChilds) > 0 && (
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 2a4 4 0 100 8 4 4 0 000-8zM8 14a6 6 0 00-6 6 1 1 0 001 1h10a1 1 0 001-1 6 6 0 00-6-6H8z" clipRule="evenodd" />
                            </svg>
                            {roomGroup.NumChilds} criança{roomGroup.NumChilds !== '1' ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {allRooms.length} quarto{allRooms.length !== 1 ? 's' : ''} disponível{allRooms.length !== 1 ? 'is' : ''}
                    </span>
                  </div>

                  {/* Room Cards for this Group */}
                  <div className="border border-gray-100 rounded-lg">
                    <div className="space-y-2 p-2">
                      {allRooms.map((room) => (
                        <RoomCard 
                          key={`${hotel.Code}-${room.Code}-${room.RoomNum}-${groupIndex}`}
                          room={room}
                          hotelCode={hotel.Code}
                          isSelected={
                            selectedHotel?.hotelCode === hotel.Code &&
                            selectedHotel?.roomCode === room.Code &&
                            selectedHotel?.roomNum === room.RoomNum
                          }
                          onSelect={() => onRoomSelection(hotel.Code, room.Code, room.RoomNum)}
                        />
                      ))}
                    </div>
                    
                    {/* Load More Button for this Group */}
                    {(hasMoreRooms || hasRoomsToShow) && (
                      <div className="flex justify-center p-4">
                        <button
                          onMouseEnter={() => fetchMoreRooms(groupIndex)}
                          onClick={() => showMoreRooms(groupIndex)}
                          disabled={roomGroupState.isLoadingMore}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm"
                        >
                          {roomGroupState.isLoadingMore ? 'A carregar...' : 'Ver mais'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
});

HotelCard.displayName = 'HotelCard';

export default HotelCard;
