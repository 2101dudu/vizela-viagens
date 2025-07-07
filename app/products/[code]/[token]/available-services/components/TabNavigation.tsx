import React from 'react';
import { BookingState } from '../types';

interface TabNavigationProps {
  bookingState: BookingState;
  hotelLocations: any[];
  canAccessTab: (tab: string) => boolean;
  switchTab: (tab: string) => void;
  onReviewTabHover?: () => void;
}

const TabNavigation = React.memo<TabNavigationProps>(({
  bookingState,
  hotelLocations,
  canAccessTab,
  switchTab,
  onReviewTabHover
}) => (
  <div className="bg-white rounded-lg shadow-lg mb-6">
    <div className="border-b border-gray-200">
      <nav className="flex space-x-8 px-6">
        {/* Flight Tab */}
        <button
          onClick={() => switchTab('flights')}
          disabled={!canAccessTab('flights')}
          className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
            bookingState.currentTab === 'flights'
              ? 'border-blue-500 text-blue-600'
              : canAccessTab('flights')
              ? 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              : 'border-transparent text-gray-300 cursor-not-allowed'
          }`}
        >
          <div className="flex items-center space-x-2">
            <span>✈️</span>
            <span>Voos</span>
            {bookingState.selectedFlight && (
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        </button>

        {/* Hotel Tabs - One for each location */}
        {hotelLocations.map((location, index) => {
          const tabId = `hotels-${index}`;
          const isActive = bookingState.currentTab === tabId;
          const canAccess = canAccessTab(tabId);
          const isCompleted = bookingState.selectedHotels[location.Code] !== undefined;
          
          return (
            <button
              key={location.Code}
              onClick={() => switchTab(tabId)}
              disabled={!canAccess}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                isActive
                  ? 'border-blue-500 text-blue-600'
                  : canAccess
                  ? 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  : 'border-transparent text-gray-300 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span>🏨</span>
                <span>Alojamento {location.Name}</span>
                {isCompleted && (
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </button>
          );
        })}

        {/* Review Tab */}
        <button
          onClick={() => switchTab('review')}
          onMouseEnter={() => {
            if (canAccessTab('review') && onReviewTabHover) {
              onReviewTabHover();
            }
          }}
          disabled={!canAccessTab('review')}
          className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
            bookingState.currentTab === 'review'
              ? 'border-blue-500 text-blue-600'
              : canAccessTab('review')
              ? 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              : 'border-transparent text-gray-300 cursor-not-allowed'
          }`}
        >
          <div className="flex items-center space-x-2">
            <span>📋</span>
            <span>Revisão</span>
            {canAccessTab('review') && (
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        </button>
      </nav>
    </div>
  </div>
));

TabNavigation.displayName = 'TabNavigation';

export default TabNavigation;
