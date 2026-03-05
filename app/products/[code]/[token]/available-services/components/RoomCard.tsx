import React from 'react';
import { RoomWithGroup } from '../types';

interface RoomCardProps {
  room: RoomWithGroup;
  hotelCode: string;
  isSelected: boolean;
  onSelect: () => void;
}

const RoomCard = React.memo<RoomCardProps>(({ 
  room, 
  hotelCode, 
  isSelected, 
  onSelect,
}) => (
  <div
    className={`border rounded-lg p-3 cursor-pointer transition-colors ${
      isSelected
        ? 'border-blue-500 bg-blue-50'
        : 'border-gray-200 hover:border-gray-300'
    }`}
    onClick={onSelect}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <div className={`w-3 h-3 rounded-full border mr-3 ${
          isSelected
            ? 'border-blue-500 bg-blue-500'
            : 'border-gray-300'
        }`}>
          {isSelected && (
            <div className="w-1.5 h-1.5 bg-white rounded-full m-0.5"></div>
          )}
        </div>
        <div>
          <div className="font-medium">{room.Name}</div>
          <div className="text-sm text-gray-600 flex items-center gap-2">
            <span>{room.BoardDescription}</span>
            {room.NonRefundable === "1" && (
              <span className="text-xs text-red-600 font-medium">
                Não Reembolsável
              </span>
            )}
            {parseFloat(room.UpgradeSupVal) > 0 && (
              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
                Inclui upgrade
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-lg font-bold text-green-600">€{room.SellValue}</div>
      </div>
    </div>
  </div>
));

RoomCard.displayName = 'RoomCard';

export default RoomCard;
