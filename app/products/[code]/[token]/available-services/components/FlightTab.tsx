import React, { useState } from 'react';
import { FlightOption, FlightFilters, Range } from '../types';
import FlightOptionCard from './FlightOptionCard';
import FlightFiltersComponent from './FlightFiltersComponent';
import FetchMoreFlights from '../hooks/useFetchMoreFlights';
import { filter } from 'framer-motion/client';

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
  token: string;
  hasMore: boolean;
  updateLookupMapsWithFlights: (newFlights: FlightOption[]) => void;
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
  layoverRange,
  token,
  hasMore,
  updateLookupMapsWithFlights,
}) => {
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreFlights, setHasMoreFlights] = useState(hasMore);
  const [fetchedFlights, setFetchedFlights] = useState<FlightOption[]>([]);
  const [hasFetched, setHasFetched] = useState(false);
  const [hasFlightsToShow, setHasFlightsToShow] = useState(false);

  // Update local state when props change
  React.useEffect(() => {
    setHasMoreFlights(hasMore);
  }, [hasMore]);

  const fetchMoreFlights = async () => {
    if (isLoadingMore || hasFetched) return;
    
    setIsLoadingMore(true);
    try {
      const result = await FetchMoreFlights(token, filteredFlightOptions.length, 5);
      setFetchedFlights(result.flights);
      setHasFetched(true);
      setHasMoreFlights(result.hasMore);
      setHasFlightsToShow(true);
    } catch (error) {
      console.error('Error fetching more flights:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const showMoreFlights = () => {
    if (hasFetched) {
      // Update lookup maps and base data with new flights
      updateLookupMapsWithFlights(fetchedFlights);
      console.log("Fetched flights:", fetchedFlights);
      setHasFetched(false);
      setHasFlightsToShow(false);
    }
  };

  return (
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
      
      {/* Load More Button */}
      {(hasMoreFlights || hasFlightsToShow) && (
        <div className="flex justify-center mt-8">
          <button
            onMouseEnter={fetchMoreFlights}
            onClick={showMoreFlights}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {'Ver mais'}
          </button>
        </div>
      )}
    </div>
  );
});

FlightTab.displayName = 'FlightTab';

export default FlightTab;
