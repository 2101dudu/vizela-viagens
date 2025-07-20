import React from 'react';
import { FlightGroup } from '../types';
import Image from "next/image";

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
    <div className="space-y-3">
      {flightGroup.Flights.item.map((flight, flightIndex) => {
        const bagCount = parseInt(flight.Bag.replace('PC', '')) || 0;
        
        return (
            <div
            key={flightIndex}
            className={`border-l-2 pl-3 ${
              isSelected ? 'border-blue-600' : 'border-blue-200'
            }`}
            >
            <div className="flex items-center justify-between text-xs mb-2">
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
              
              {/* Bag Information */}
              <div className="flex items-center space-x-1">
              {bagCount === 0 ? (
                <div className="relative w-4 h-4 scale-150"> {/* 16px x 16px */}
                <Image
                  src="/bag.svg"
                  alt="Sem bagagem"
                  width={16}
                  height={16}
                />
                <div className="absolute inset-0">
                  <div className="absolute w-full m-0 h-0.5 bg-red-500 -rotate-45 top-1/2 left-0 -translate-y-1/2" />
                </div>
                </div>
              ) : (
                Array.from({ length: bagCount }, (_, i) => (
                <Image
                  key={i}
                  src="/bag.svg"
                  alt={`Bagagem ${i + 1}`}
                  width={24}
                  height={24}
                />
                ))
              )}
              </div>
            </div>
            
            <div className="flex items-center justify-between relative">
              {/* Left */}
              <div className="text-left z-10">
              <div className="font-medium text-sm">{formatTime(flight.DepTime)}</div>
              <div className="text-xs text-gray-500">
                {new Date(flight.DepDate).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' })}
              </div>
              <div className="text-xs font-medium text-gray-700">{flight.From}</div>
              </div>

              {/* Center (visually centered in container) */}
              <div className="absolute left-1/2 -translate-x-1/2 flex items-center space-x-2 text-gray-400">
              <div className="h-px bg-gray-300 w-8"></div>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.429a1 1 0 001.17-1.409l-7-14z" />
              </svg>
              <div className="h-px bg-gray-300 w-8"></div>
              </div>

              {/* Right */}
              <div className="text-right z-10">
              <div className="font-medium text-sm">{formatTime(flight.ArrTime)}</div>
              <div className="text-xs text-gray-500">
                {new Date(flight.ArrDate).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' })}
              </div>
              <div className="text-xs font-medium text-gray-700">{flight.To}</div>
              </div>
            </div>
            </div>
        );
      })}
    </div>
  </div>
));

FlightGroupCard.displayName = 'FlightGroupCard';

export default FlightGroupCard;
