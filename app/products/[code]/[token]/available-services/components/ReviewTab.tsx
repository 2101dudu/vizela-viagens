import React from 'react';
import { BookingState, ProductData } from '../types';

interface ReviewTabProps {
  bookingState: BookingState;
  productData: ProductData;
  hotelLocations: any[];
  totalPrice: number;
  formatDate: (date: string) => string;
  renderStarRating: (rating: string) => React.ReactNode;
  onInsuranceChange: (insuranceId: string) => void;
}

const ReviewTab = React.memo<ReviewTabProps>(({
  bookingState,
  productData,
  hotelLocations,
  totalPrice,
  formatDate,
  renderStarRating,
  onInsuranceChange
}) => (
  <div className="p-6">
    <h2 className="text-xl font-semibold text-gray-800 mb-6">Revisão da Sua Reserva</h2>
    
    <div className="space-y-6">
      {/* Flight Summary */}
      {bookingState.selectedFlight && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.429a1 1 0 001.17-1.409l-7-14z" />
            </svg>
            Voo Selecionado
          </h3>
          
          {(() => {
            const originalFlightOptions = productData?.data?.FlightMainGroup?.item?.[0]?.FlightOptionsSuperBB?.item || [];
            const selectedFlightOption = originalFlightOptions.find(option => option.OptionCode === bookingState.selectedFlight!.optionCode);
            return selectedFlightOption && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium">Pacote de Voo {parseInt(selectedFlightOption.OptionCode) + 1}</span>
                  <span className="text-lg font-bold text-green-600">
                    €{(parseFloat(selectedFlightOption.RateTaxVal) + parseFloat(selectedFlightOption.SuplementsTotalVal) + parseFloat(selectedFlightOption.Tax)).toFixed(2)}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  {selectedFlightOption.FlightSegments.item.map((segment) => (
                    <div key={segment.SegmentCode} className="flex items-center justify-between">
                      <span>{segment.ServiceDesc}: {segment.FromIATADesc} → {segment.ToIATADesc}</span>
                      <span>{formatDate(segment.Date)}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Hotel Summary */}
      {Object.keys(bookingState.selectedHotels).length > 0 && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 000 1.414l7 7a1 1 0 001.414 0l7-7a1 1 0 000-1.414l-7-7zM13 11H7v-1h6v1z" />
            </svg>
            Alojamento{Object.keys(bookingState.selectedHotels).length > 1 ? 's' : ''} Selecionado{Object.keys(bookingState.selectedHotels).length > 1 ? 's' : ''}
          </h3>
          
          <div className="space-y-4">
            {Object.entries(bookingState.selectedHotels).map(([locationCode, hotelSelection]) => {
              const location = hotelLocations.find((loc: any) => loc.Code === locationCode);
              const hotels = location?.HotelOption?.item || [];
              const selectedHotel = hotels.find((hotel: any) => hotel.Code === hotelSelection.hotelCode);
              const selectedRoom = selectedHotel?.RoomsOccupancy.item[0]?.Rooms.item.find((room: any) => 
                room.Code === hotelSelection.roomCode && 
                room.RoomNum === hotelSelection.roomNum
              );
              
              return selectedHotel && selectedRoom && (
                <div key={locationCode} className="border-l-4 border-blue-500 pl-4">
                  <div className="font-medium text-blue-600 text-sm mb-2">{location?.Name}</div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="font-medium">{selectedHotel.Name}</div>
                      <div className="text-sm text-gray-600">{selectedRoom.Name}</div>
                    </div>
                    <span className="text-lg font-bold text-green-600">€{selectedRoom.SellValue}</span>
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-600">
                    <div>Classificação: {renderStarRating(selectedHotel.Rating)}</div>
                    <div>Regime: {selectedRoom.BoardDescription}</div>
                    <div>Check-in: {formatDate(selectedHotel.CheckIn)} | Check-out: {formatDate(selectedHotel.CheckOut)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Insurance Selection */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" />
          </svg>
          Seguro de Viagem
        </h3>
        
        <div className="space-y-3">
          {/* Included Insurance */}
          <div className="border rounded-lg p-3">
            <div className="flex items-center mb-2">
              <input
                type="radio"
                id="insurance-included"
                name="insurance"
                value="included"
                checked={bookingState.selectedInsurance === "included"}
                onChange={(e) => onInsuranceChange(e.target.value)}
                className="mr-3 h-4 w-4 text-blue-600"
              />
              <label htmlFor="insurance-included" className="font-medium cursor-pointer">
                Incluído
              </label>
              <span className="ml-auto text-green-600 font-medium">Grátis</span>
            </div>
            <p className="text-sm text-gray-600 pl-7">
              {productData.data.DynInsurance.Included.Description}
            </p>
          </div>

          {/* Insurance Upgrades */}
          {productData.data.DynInsurance.Upgrades.item.map((upgrade) => (
            <div key={upgrade.ID} className="border rounded-lg p-3">
              <div className="flex items-center mb-2">
                <input
                  type="radio"
                  id={`insurance-${upgrade.ID}`}
                  name="insurance"
                  value={upgrade.ID}
                  checked={bookingState.selectedInsurance === upgrade.ID}
                  onChange={(e) => onInsuranceChange(e.target.value)}
                  className="mr-3 h-4 w-4 text-blue-600"
                />
                <label htmlFor={`insurance-${upgrade.ID}`} className="font-medium cursor-pointer">
                  Upgrade
                </label>
                <span className="ml-auto text-blue-600 font-medium">+€{upgrade.Sellvalue}</span>
              </div>
              <p className="text-sm text-gray-600 pl-7">
                {upgrade.Description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Price Summary */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-4">Resumo de Preços</h3>
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
          
          <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg">
            <span>Total:</span>
            <span className="text-blue-600">€{totalPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Mandatory Services */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Serviços Incluídos</h3>
        <div className="space-y-2">
          {productData.data.OtherMandatoryServices.item.map((service, index) => (
            <div key={index} className="flex items-center text-sm">
              <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{service.Type}: </span>
              <span className="text-gray-600 ml-1">{service.Description}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
));

ReviewTab.displayName = 'ReviewTab';

export default ReviewTab;
