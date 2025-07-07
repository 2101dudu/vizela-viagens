import React from 'react';
import { FlightFilters, Range } from '../types';

interface FlightFiltersComponentProps {
  filters: FlightFilters;
  onFiltersChange: (filters: FlightFilters) => void;
  layoverRange: Range;
}

const FlightFiltersComponent = React.memo<FlightFiltersComponentProps>(({
  filters,
  onFiltersChange,
  layoverRange
}) => {
  if (layoverRange.max <= layoverRange.min) {
    return null;
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="font-medium text-gray-700">Filtrar por escalas:</span>
          <div className="flex items-center space-x-2">
            {Array.from({ length: layoverRange.max - layoverRange.min + 1 }, (_, i) => {
              const layoverCount = layoverRange.min + i;
              const isSelected = filters.selectedLayovers.includes(layoverCount);
              
              return (
                <button
                  key={layoverCount}
                  onClick={() => {
                    onFiltersChange({
                      ...filters,
                      selectedLayovers: isSelected
                        ? filters.selectedLayovers.filter(l => l !== layoverCount)
                        : [...filters.selectedLayovers, layoverCount]
                    });
                  }}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {layoverCount === 0 ? 'Direto' : `${layoverCount} escala${layoverCount > 1 ? 's' : ''}`}
                </button>
              );
            })}
          </div>
        </div>
        <button
          onClick={() => onFiltersChange({ ...filters, selectedLayovers: [] })}
          disabled={filters.selectedLayovers.length === 0}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            filters.selectedLayovers.length === 0
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-red-100 text-red-700 hover:bg-red-200'
          }`}
        >
          Limpar filtros
        </button>
      </div>
    </div>
  );
});

FlightFiltersComponent.displayName = 'FlightFiltersComponent';

export default FlightFiltersComponent;
