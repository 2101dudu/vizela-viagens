import React from 'react';
import { Hotel } from '../types';
import VirtualizedRoomList from './VirtualizedRoomList';
import RoomCard from './RoomCard';

interface HotelCardProps {
  hotel: Hotel;
  selectedHotel: { hotelCode: string; roomCode: string; roomNum: string } | null;
  onRoomSelection: (hotelCode: string, roomCode: string, roomNum: string) => void;
  renderStarRating: (rating: string) => React.ReactNode;
  formatDate: (date: string) => string;
}

const HotelCard = React.memo<HotelCardProps>(({ 
  hotel, 
  selectedHotel, 
  onRoomSelection, 
  renderStarRating, 
  formatDate 
}) => {
  // Flatten all rooms from all room groups for this hotel
  const allRooms = hotel.RoomsOccupancy.item.flatMap(roomGroup => 
    roomGroup.Rooms.item.map(room => ({ ...room, roomGroup: roomGroup.RoomGroup }))
  );

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
          {/* Room Selection - Scrollable Container */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-800">Escolha o seu quarto:</h4>
              <span className="text-sm text-gray-500">
                {allRooms.length} quarto{allRooms.length !== 1 ? 's' : ''} disponível{allRooms.length !== 1 ? 'is' : ''}
              </span>
            </div>
            
            {/* Scrollable room container - max 6 rooms visible */}
            <div className="border border-gray-200 rounded-lg">
              {allRooms.length > 10 ? (
                // Use virtualization for large room lists
                <VirtualizedRoomList 
                  allRooms={allRooms}
                  hotelCode={hotel.Code}
                  selectedHotel={selectedHotel}
                  onRoomSelection={onRoomSelection}
                />
              ) : (
                // Use regular scrolling for smaller lists
                <div className="max-h-80 overflow-y-auto">
                  <div className="space-y-2 p-2">
                    {allRooms.map((room) => (
                      <RoomCard 
                        key={`${hotel.Code}-${room.Code}-${room.RoomNum}`}
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
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

HotelCard.displayName = 'HotelCard';

export default HotelCard;
