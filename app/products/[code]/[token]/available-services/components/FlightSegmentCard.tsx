import React from 'react';
import { FlightSegment } from '../types';
import FlightGroupCard from './FlightGroupCard';

interface FlightSegmentCardProps {
  segment: FlightSegment;
  optionCode: string;
  selectedFlight: string;
  onFlightSelection: (optionCode: string, segmentCode: string, flightGroupCode: string) => void;
  formatTime: (time: string) => string;
  formatDate: (date: string) => string;
}

const FlightSegmentCard = React.memo<FlightSegmentCardProps>(({ 
  segment, 
  optionCode, 
  selectedFlight, 
  onFlightSelection,
  formatTime,
  formatDate 
}) => (
  <div className="bg-white rounded-lg border border-gray-100 p-4">
    <h4 className="text-md font-semibold text-blue-600 mb-3 flex items-center">
      {segment.ServiceDesc.toLowerCase().includes("ida") ? (
        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.429a1 1 0 001.17-1.409l-7-14z" />
        </svg>
      ) : segment.ServiceDesc.toLowerCase().includes("regresso") || segment.ServiceDesc.toLowerCase().includes("volta") ? (
        <svg className="w-4 h-4 mr-2 transform rotate-180" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.429a1 1 0 001.17-1.409l-7-14z" />
        </svg>
      ) : (
        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 6a2 2 0 012-2h8a2 2 0 012 2v7a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
          <path d="M6 8v6h8V8H6z" />
        </svg>
      )}
      {segment.ServiceDesc}
    </h4>

    {/* Route Overview */}
    <div className="bg-gray-50 rounded-lg p-3 mb-3">
      <div className="flex items-center justify-between text-sm relative">
        <div>
          <span className="font-medium">{segment.FromIATADesc}</span>
          <span className="text-gray-500 ml-1">({segment.FromIATA})</span>
        </div>
        <div className="text-gray-400 absolute left-1/2 transform -translate-x-1/2">
          <svg className="w-4 h-4 mx-auto" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </div>
        <div>
          <span className="font-medium">{segment.ToIATADesc}</span>
          <span className="text-gray-500 ml-1">({segment.ToIATA})</span>
        </div>
      </div>
      <div className="text-center text-sm text-gray-600 mt-1">
        {formatDate(segment.Date)}
      </div>
    </div>

    {/* Flight Options for this Segment */}
    {segment.Flights.item.length > 1 && (
      <div className="text-sm text-orange-600 font-medium mb-2 flex items-center">
        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        Múltiplas opções disponíveis - deve escolher uma opção
      </div>
    )}
    
    <div className="space-y-2">
      {segment.Flights.item.map((flightGroup) => {
        const isSelected = selectedFlight === flightGroup.FlightGroupCode;
        
        return (
          <FlightGroupCard 
            key={flightGroup.FlightGroupCode}
            flightGroup={flightGroup}
            isSelected={isSelected}
            onSelect={() => onFlightSelection(optionCode, segment.SegmentCode, flightGroup.FlightGroupCode)}
            formatTime={formatTime}
          />
        );
      })}
    </div>
  </div>
));

FlightSegmentCard.displayName = 'FlightSegmentCard';

export default FlightSegmentCard;
