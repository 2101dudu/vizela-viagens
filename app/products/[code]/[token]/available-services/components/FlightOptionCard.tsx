import React from 'react';
import { FlightOption } from '../types';
import FlightSegmentCard from './FlightSegmentCard';

interface FlightOptionCardProps {
  option: FlightOption;
  selectedFlights: {[optionCode: string]: {[segmentCode: string]: string}};
  handleFlightSelection: (optionCode: string, segmentCode: string, flightGroupCode: string) => void;
  getSelectedFlightForSegment: (optionCode: string, segmentCode: string) => string;
  formatTime: (time: string) => string;
  formatDate: (date: string) => string;
}

const FlightOptionCard = React.memo<FlightOptionCardProps>(({ 
  option, 
  selectedFlights, 
  handleFlightSelection, 
  getSelectedFlightForSegment,
  formatTime,
  formatDate 
}) => {
  const optionSelections = selectedFlights[option.OptionCode] || {};
  const selectedCount = Object.values(optionSelections).filter(selection => selection !== "").length;
  const totalSegments = option.FlightSegments.item.length;
  const hasAllFlightsSelected = selectedCount === totalSegments;
  const hasSelectedFlights = selectedCount > 0;
  
  return (
    <div 
      className={`border-2 rounded-lg p-6 transition-all ${
        hasAllFlightsSelected
          ? 'border-blue-500 bg-blue-50' 
          : hasSelectedFlights
          ? 'border-orange-400 bg-orange-50'
          : 'border-gray-200'
      }`}
    >
      {/* Option Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <h3 className="text-lg font-semibold text-gray-800">
            Pacote de Voo {parseInt(option.OptionCode) + 1}
          </h3>
          {hasSelectedFlights && (
            <div className="ml-3 flex items-center">
              {hasAllFlightsSelected ? (
                <div className="flex items-center text-green-600 text-sm font-medium">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Completo ({selectedCount}/{totalSegments})
                </div>
              ) : (
                <div className="flex items-center text-orange-600 text-sm font-medium">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Parcial ({selectedCount}/{totalSegments})
                </div>
              )}
            </div>
          )}
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-green-600">
            €{(parseFloat(option.RateTaxVal) + parseFloat(option.SuplementsTotalVal) + parseFloat(option.Tax)).toFixed(2)}
          </div>
          <div className="text-sm text-gray-500">
            +€{option.CheapestDifPax} vs mais barato
          </div>
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="text-sm text-gray-600 mb-4 pb-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <span>Taxa Base: €{option.RateTaxVal}</span>
          <span>Suplementos: €{option.SuplementsTotalVal}</span>
          <span>Taxas: €{option.Tax}</span>
          <span className="text-xs text-gray-500">Reservar até: {formatDate(option.Lasttkdt)}</span>
        </div>
      </div>

      {/* Flight Segments */}
      <div className="space-y-4">
        {option.FlightSegments.item.map((segment) => (
          <FlightSegmentCard 
            key={segment.SegmentCode}
            segment={segment}
            optionCode={option.OptionCode}
            selectedFlight={getSelectedFlightForSegment(option.OptionCode, segment.SegmentCode)}
            onFlightSelection={handleFlightSelection}
            formatTime={formatTime}
            formatDate={formatDate}
          />
        ))}
      </div>
    </div>
  );
});

FlightOptionCard.displayName = 'FlightOptionCard';

export default FlightOptionCard;
