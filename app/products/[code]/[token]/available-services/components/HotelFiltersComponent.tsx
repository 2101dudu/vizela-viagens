import React from 'react';
import { HotelFilters, Range } from '../types';

interface HotelFiltersComponentProps {
  filters: HotelFilters;
  onFiltersChange: (filters: HotelFilters) => void;
  starRange: Range;
}

const HotelFiltersComponent = React.memo<HotelFiltersComponentProps>(({
  filters,
  onFiltersChange,
  starRange
}) => {
  // Check if we have a valid star range (min !== max and both are greater than 0)
  if (!starRange || starRange.max <= starRange.min || starRange.max === 0) {
    return null;
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="font-medium text-gray-700">Filtrar por estrelas:</span>
          <div className="flex items-center space-x-2">
            {Array.from({ length: starRange.max - starRange.min + 1 }, (_, i) => {
              const starCount = starRange.min + i;
              const isSelected = filters.selectedStars.includes(starCount);
              
              return (
                <button
                  key={starCount}
                  onClick={() => {
                    onFiltersChange({
                      ...filters,
                      selectedStars: isSelected
                        ? filters.selectedStars.filter(s => s !== starCount)
                        : [...filters.selectedStars, starCount]
                    });
                  }}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors flex items-center space-x-1 ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  <span>{starCount}</span>
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              );
            })}
          </div>
        </div>
        <button
          onClick={() => onFiltersChange({ ...filters, selectedStars: [] })}
          disabled={filters.selectedStars.length === 0}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            filters.selectedStars.length === 0
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

HotelFiltersComponent.displayName = 'HotelFiltersComponent';

export default HotelFiltersComponent;
