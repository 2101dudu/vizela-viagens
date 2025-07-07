import React from 'react';
import { FlightOption, FlightFilters, Range } from '../types';
import FlightOptionCard from './FlightOptionCard';
import FlightFiltersComponent from './FlightFiltersComponent';

interface FlightTabProps {
  filteredFlightOptions: FlightOption[];
  selectedFlights: {[optionCode: string]: {[segmentCode: string]: string}};
  handleFlightSelection: (optionCode: string, segmentCode: string, flightGroupCode: string) => void;
  getSelectedFlightForSegment: (optionCode: string, segmentCode: string) => string;
  formatTime: (time: string) => string;
  formatDate: (date: string) => string;
  flightFilters: FlightFilters;
  onFiltersChange: (filters: FlightFilters) => void;
  layoverRange: Range;
}

const FlightTab = React.memo<FlightTabProps>(({
  filteredFlightOptions,
  selectedFlights,
  handleFlightSelection,
  getSelectedFlightForSegment,
  formatTime,
  formatDate,
  flightFilters,
  onFiltersChange,
  layoverRange
}) => (
  <div className="p-6">
    <h2 className="text-xl font-semibold text-gray-800 mb-4">Escolha a Sua Opção de Voo</h2>
    
    {/* Flight Filters */}
    <FlightFiltersComponent 
      filters={flightFilters}
      onFiltersChange={onFiltersChange}
      layoverRange={layoverRange}
    />
    
    <div className="space-y-6 mb-6">
      {filteredFlightOptions.map((option) => (
        <FlightOptionCard 
          key={option.OptionCode}
          option={option}
          selectedFlights={selectedFlights}
          handleFlightSelection={handleFlightSelection}
          getSelectedFlightForSegment={getSelectedFlightForSegment}
          formatTime={formatTime}
          formatDate={formatDate}
        />
      ))}
    </div>
  </div>
));

FlightTab.displayName = 'FlightTab';

export default FlightTab;
