import React from 'react';
import { FlightGroup } from '../types';

interface FlightGroupCardProps {
  flightGroup: FlightGroup;
  isSelected: boolean;
  onSelect: () => void;
  formatTime: (time: string) => string;
}

const FlightGroupCard = React.memo<FlightGroupCardProps>(({ 
  flightGroup, 
  isSelected, 
  onSelect, 
  formatTime 
}) => (
  <div 
    className={`border rounded-md p-3 cursor-pointer transition-colors ${
      isSelected
        ? 'border-blue-500 bg-blue-50'
        : 'border-gray-200 hover:border-gray-300'
    }`}
    onClick={onSelect}
  >
    <div className="flex items-center mb-2">
      <div className={`w-3 h-3 rounded-full border mr-2 ${
        isSelected
          ? 'border-blue-500 bg-blue-500'
          : 'border-gray-300'
      }`}>
        {isSelected && (
          <div className="w-1.5 h-1.5 bg-white rounded-full m-0.5"></div>
        )}
      </div>
      {flightGroup.NumStopOvers !== "0" && (
        <span className="text-xs text-orange-600 font-medium">
          {flightGroup.NumStopOvers} escala(s)
        </span>
      )}
      {flightGroup.NumStopOvers === "0" && (
        <span className="text-xs text-green-600 font-medium">
          Voo direto
        </span>
      )}
    </div>

    {/* Individual Flights */}
    <div className="space-y-2">
      {flightGroup.Flights.item.map((flight, flightIndex) => (
        <div key={flightIndex} className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <img
              src={flight.AirCompLogoUrl}
              alt={flight.AirCompCode}
              className="w-6 h-6 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <span className="font-medium">
              {flight.AirCompCode} {flight.Number}
            </span>
            <span className="text-gray-500">
              Classe {flight.Class}
            </span>
          </div>
          
          <div className="flex items-center space-x-4 text-right">
            <div>
              <div className="font-medium">{formatTime(flight.DepTime)}</div>
              <div className="text-gray-500">{flight.From}</div>
            </div>
            <div className="text-gray-400">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.429a1 1 0 001.17-1.409l-7-14z" />
              </svg>
            </div>
            <div>
              <div className="font-medium">{formatTime(flight.ArrTime)}</div>
              <div className="text-gray-500">{flight.To}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
));

FlightGroupCard.displayName = 'FlightGroupCard';

export default FlightGroupCard;
