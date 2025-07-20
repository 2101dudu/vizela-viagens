import React, { useState } from 'react';
import { Hotel, RoomWithGroup, RoomGroup } from '../types';
import Image from 'next/image';
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

const HotelCard = React.memo<HotelCardProps>(({ 
  hotel, 
  selectedHotelData, 
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

  // Helper functions
  const getRoomSelectionForGroup = (groupId: string) => {
    return selectedHotelData?.hotelCode === hotel.Code 
      ? selectedHotelData.roomSelections[groupId] 
      : null;
  };

  const isRoomSelected = (room: RoomWithGroup, groupId: string) => {
    const groupSelection = getRoomSelectionForGroup(groupId);
    return groupSelection?.roomCode === room.Code && groupSelection?.roomNum === room.RoomNum;
  };

  const getSelectedRoomCount = () => {
    if (selectedHotelData?.hotelCode !== hotel.Code) return 0;
    return Object.keys(selectedHotelData.roomSelections || {}).length;
  };

  const getTotalRoomGroups = () => {
    return hotel.RoomsOccupancy.item.length;
  };

  const isHotelFullySelected = () => {
    return getSelectedRoomCount() === getTotalRoomGroups();
  };

  const shouldShowWarning = () => {
    const selectedCount = getSelectedRoomCount();
    return selectedCount > 0 && selectedCount < getTotalRoomGroups();
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
          {/* Selection Status Warning */}
          {shouldShowWarning() && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-medium text-yellow-800">
                    Seleção Incompleta ({getSelectedRoomCount()}/{getTotalRoomGroups()} quartos selecionados)
                  </p>
                  <p className="text-sm text-yellow-700">
                    Por favor selecione um quarto para cada tipo de ocupação para continuar.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {isHotelFullySelected() && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="font-medium text-green-800">
                  Hotel Completamente Selecionado ✓
                </p>
              </div>
            </div>
          )}

          {/* Room Selection - Multiple Room Groups */}
          <div className="space-y-6">
            <h4 className="font-semibold text-gray-800">Escolha os seus quartos:</h4>
            
            {roomGroupStates.map((roomGroupState, groupIndex) => {
              const { roomGroup, allRooms, hasMoreRooms, hasRoomsToShow } = roomGroupState;
              const roomGroupId = roomGroup.RoomGroup;
              const selectedRoom = getRoomSelectionForGroup(roomGroupId);
              
              return (
                <div key={`${hotel.Code}-group-${groupIndex}`} className="border border-gray-200 rounded-lg p-4">
                  {/* Room Group Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <h5 className="font-medium text-gray-700">
                        Quarto {groupIndex + 1}
                        {selectedRoom && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ✓ Selecionado
                          </span>
                        )}
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
                          isSelected={isRoomSelected(room, roomGroupId)}
                          onSelect={() => onRoomSelection(hotel.Code, roomGroupId, room.Code, room.RoomNum)}
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
