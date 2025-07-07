import React from 'react';
import { BookingState, ProductData } from '../types';

interface SidebarProps {
  productData: ProductData;
  bookingState: BookingState;
  hotelLocations: any[];
  switchTab: (tab: string) => void;
  totalPrice: number;
  isDone: boolean;
  renderStarRating: (rating: string) => React.ReactNode;
  onConfirmButtonHover?: () => void;
}

const Sidebar = React.memo<SidebarProps>(({
  productData,
  bookingState,
  hotelLocations,
  switchTab,
  totalPrice,
  isDone,
  renderStarRating,
  onConfirmButtonHover
}) => (
  <div className="w-80 ml-8">
    <div className="sticky top-28 space-y-4">
      {/* Header Information */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-4">
          <h1 className="text-xl font-bold text-gray-800">{productData.data.Name}</h1>
          <p className="text-gray-600 text-sm">Código: {productData.data.CodeDefined}</p>
          {isDone && (
            <div className="flex items-center text-green-600 mt-2">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium text-sm">Serviços carregados</span>
            </div>
          )}
        </div>
        
        {/* Price Breakdown */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-blue-800 mb-3">Resumo de Preços</h2>
          <div className="space-y-2 text-sm">
            {bookingState.selectedFlight && (() => {
              const originalFlightOptions = productData?.data?.FlightMainGroup?.item?.[0]?.FlightOptionsSuperBB?.item || [];
              const selectedOption = originalFlightOptions.find(option => option.OptionCode === bookingState.selectedFlight!.optionCode);
              return selectedOption && (
                <div className="flex justify-between">
                  <span>Voo:</span>
                  <span>€{(parseFloat(selectedOption.RateTaxVal) + parseFloat(selectedOption.SuplementsTotalVal) + parseFloat(selectedOption.Tax)).toFixed(2)}</span>
                </div>
              );
            })()}
            
            {Object.entries(bookingState.selectedHotels).map(([locationCode, hotelSelection]) => {
              const location = hotelLocations.find((loc: any) => loc.Code === locationCode);
              const hotels = location?.HotelOption?.item || [];
              const selectedHotel = hotels.find((hotel: any) => hotel.Code === hotelSelection.hotelCode);
              const selectedRoom = selectedHotel?.RoomsOccupancy.item[0]?.Rooms.item.find((room: any) => 
                room.Code === hotelSelection.roomCode && 
                room.RoomNum === hotelSelection.roomNum
              );
              return selectedRoom && (
                <div key={locationCode} className="flex justify-between">
                  <span>Alojamento {location?.Name}:</span>
                  <span>€{selectedRoom.SellValue}</span>
                </div>
              );
            })}
            
            {bookingState.selectedInsurance !== "included" && (() => {
              const upgrade = productData.data.DynInsurance.Upgrades.item.find(
                item => item.ID === bookingState.selectedInsurance
              );
              return upgrade && (
                <div className="flex justify-between">
                  <span>Seguro:</span>
                  <span>€{upgrade.Sellvalue}</span>
                </div>
              );
            })()}
            
            <div className="border-t pt-2 mt-3 flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span className="text-blue-600">€{totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="space-y-3">
          {/* Flight Tab Navigation */}
          {bookingState.currentTab === 'flights' && (
            <>
              <button
                disabled={true}
                className="cursor-not-allowed w-full bg-gray-300 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                ← Voltar
              </button>
              <button
                onClick={() => switchTab('hotels-0')}
                disabled={!bookingState.selectedFlight}
                className={`w-full font-medium py-3 px-4 rounded-lg transition-colors ${
                  bookingState.selectedFlight
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Seguinte →
              </button>
            </>
          )}
          
          {/* Hotel Tab Navigation */}
          {bookingState.currentTab.startsWith('hotels-') && (
            <>
              <button
                onClick={() => {
                  if (bookingState.currentHotelIndex === 0) {
                    switchTab('flights');
                  } else {
                    switchTab(`hotels-${bookingState.currentHotelIndex - 1}`);
                  }
                }}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                ← Voltar
              </button>
              <button
                onClick={() => {
                  const currentLocation = hotelLocations[bookingState.currentHotelIndex];
                  
                  if (bookingState.currentHotelIndex < hotelLocations.length - 1) {
                    // Go to next hotel
                    switchTab(`hotels-${bookingState.currentHotelIndex + 1}`);
                  } else {
                    // Go to review
                    switchTab('review');
                  }
                }}                
                onMouseEnter={() => {
                  if (!(bookingState.currentHotelIndex < hotelLocations.length - 1) && onConfirmButtonHover) {
                    onConfirmButtonHover();
                  }
                }}
                disabled={!bookingState.selectedHotels[hotelLocations[bookingState.currentHotelIndex]?.Code]}
                className={`w-full font-medium py-3 px-4 rounded-lg transition-colors ${
                  bookingState.selectedHotels[hotelLocations[bookingState.currentHotelIndex]?.Code]
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {bookingState.currentHotelIndex < hotelLocations.length - 1 ? 'Seguinte →' : 'Revisão →'}
              </button>
            </>
          )}

          {/* Review Tab Navigation */}
          {bookingState.currentTab === 'review' && (
            <>
              <button
                onClick={() => switchTab(`hotels-${hotelLocations.length - 1}`)}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                ← Voltar
              </button>
              <button
                onClick={() => {
                  // Here you would typically handle the booking confirmation
                  alert('Reserva confirmada! Redireccionar para o processo de pagamento.');
                }}
                onMouseEnter={() => {
                  if (onConfirmButtonHover) {
                    onConfirmButtonHover();
                  }
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Confirmar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  </div>
));

Sidebar.displayName = 'Sidebar';

export default Sidebar;
