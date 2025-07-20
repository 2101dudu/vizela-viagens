import React, { useState } from 'react';
import { BookingState, ProductData, DynGetSimulationResponse } from '../types';

interface ReviewTabProps {
  bookingState: BookingState;
  productData: ProductData;
  hotelLocations: any[];
  totalPrice: number;
  formatDate: (date: string) => string;
  renderStarRating: (rating: string) => React.ReactNode;
  onInsuranceChange: (insuranceId: string) => void;
  simulationData: DynGetSimulationResponse | null;
  setServicesError: string | null;
}

const ReviewTab = React.memo<ReviewTabProps>(({
  bookingState,
  productData,
  hotelLocations,
  totalPrice,
  formatDate,
  renderStarRating,
  onInsuranceChange,
  simulationData,
  setServicesError
}) => {
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({});
  
  const toggleSection = (sectionKey: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };


  return (
  <div className="p-6">
    <h2 className="text-xl font-semibold text-gray-800 mb-6">Revisão da Sua Reserva</h2>
    
    {/* Error Display */}
    {setServicesError && (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div>
            <h3 className="text-sm font-medium text-red-800">Erro ao processar a reserva</h3>
            <p className="text-sm text-red-700 mt-1">{setServicesError}</p>
          </div>
        </div>
      </div>
    )}
    
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
              
              if (!selectedHotel) return null;
              
              let totalHotelPrice = 0;
              
              return (
                <div key={locationCode} className="border-l-4 border-blue-500 pl-4">
                  <div className="font-medium text-blue-600 text-sm mb-2">{location?.Name}</div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="font-medium">{selectedHotel.Name}</div>
                      <div className="space-y-1 text-sm text-gray-600">
                        {Object.entries(hotelSelection.roomSelections || {}).map(([roomGroupId, roomSelection], roomIndex) => {
                          // Find the room details
                          const roomGroup = selectedHotel.RoomsOccupancy.item.find(
                            (rg: any) => rg.RoomGroup === roomGroupId
                          );
                          const room = roomGroup?.Rooms.item.find((r: any) => 
                            r.Code === roomSelection.roomCode && r.RoomNum === roomSelection.roomNum
                          );
                          
                          if (!room) return null;
                          
                          const roomPrice = parseFloat(room.SellValue);
                          totalHotelPrice += roomPrice;
                          
                          return (
                            <div key={`${roomGroupId}-${roomSelection.roomCode}`} className="text-xs">
                              <span className="font-medium">Quarto {roomIndex + 1}:</span> {room.Name}
                              <span className="ml-2 text-gray-500">
                                ({roomGroup?.NumAdults} adulto{roomGroup?.NumAdults !== '1' ? 's' : ''}
                                {parseInt(roomGroup?.NumChilds || '0') > 0 && `, ${roomGroup?.NumChilds} criança${roomGroup?.NumChilds !== '1' ? 's' : ''}`})
                              </span>
                              <span className="ml-2 font-medium text-green-600">€{roomPrice.toFixed(2)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <span className="text-lg font-bold text-green-600">€{totalHotelPrice.toFixed(2)}</span>
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-600">
                    <div>Classificação: {renderStarRating(selectedHotel.Rating)}</div>
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
            {Array.isArray(productData.data.DynInsurance.Upgrades?.item) && productData.data.DynInsurance.Upgrades.item.map((upgrade) => (
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
            
            if (!selectedHotel) return null;
            
            let totalHotelPrice = 0;
            const roomEntries: React.ReactNode[] = [];
            
            Object.entries(hotelSelection.roomSelections || {}).forEach(([roomGroupId, roomSelection], roomIndex) => {
              const roomGroup = selectedHotel.RoomsOccupancy.item.find(
                (rg: any) => rg.RoomGroup === roomGroupId
              );
              const room = roomGroup?.Rooms.item.find((r: any) => 
                r.Code === roomSelection.roomCode && r.RoomNum === roomSelection.roomNum
              );
              
              if (room) {
                const roomPrice = parseFloat(room.SellValue);
                totalHotelPrice += roomPrice;
                roomEntries.push(
                  <div key={`${roomGroupId}-${roomSelection.roomCode}`} className="flex justify-between text-xs text-gray-600 ml-4">
                    <span>
                      Quarto {roomIndex + 1} ({roomGroup?.NumAdults} adulto{roomGroup?.NumAdults !== '1' ? 's' : ''}
                      {parseInt(roomGroup?.NumChilds || '0') > 0 && `, ${roomGroup?.NumChilds} criança${roomGroup?.NumChilds !== '1' ? 's' : ''}`}):
                    </span>
                    <span>€{roomPrice.toFixed(2)}</span>
                  </div>
                );
              }
            });
            
            return (
              <div key={locationCode}>
                <div className="flex justify-between font-medium">
                  <span>Hotel {location?.Name === "Alojamento" ? "" : `- ${location?.Name}`}:</span>
                  <span>€{totalHotelPrice.toFixed(2)}</span>
                </div>
                {roomEntries}
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
            {Array.isArray(productData.data.OtherMandatoryServices?.item) &&
            productData.data.OtherMandatoryServices.item.map((service, index) => (
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

      {/* Itinerary Details */}
      {simulationData?.Services?.item && (
        <div className="bg-gray-50 rounded-lg p-6">
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection('itinerary')}
          >
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Itinerário Detalhado
            </h3>
            <svg 
              className={`w-5 h-5 transform transition-transform ${expandedSections.itinerary ? 'rotate-180' : ''}`}
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
          
          {expandedSections.itinerary && (
            <div className="mt-4 space-y-3">
              {simulationData.Services.item.map((service: any, index: number) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-blue-600">
                      {service.Type === 'AVI' ? '✈️ Voo' : 
                       service.Type === 'ALOJ' ? '🏨 Alojamento' : 
                       service.Type === 'TRF' ? '🚌 Transfer' : service.Type}
                    </span>
                    <span className="text-sm text-gray-500">{service.Status}</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{service.Description}</p>
                  <div className="flex justify-between text-xs text-gray-600">
                    <div className="space-x-4">
                      <span>Quantidade: {service.Quant}</span>
                    </div>
                    <div className="space-x-4">
                      <span>De: {formatDate(service.DateFrom)}</span>
                      {service.DateTo !== service.DateFrom && <span>Até: {formatDate(service.DateTo)}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Breakdown of Costs */}
      {simulationData?.Calcs?.item && (
        <div className="bg-green-50 rounded-lg p-6">
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection('breakdown')}
          >
            <h3 className="text-lg font-semibold text-green-800 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm3 5a1 1 0 000 2h6a1 1 0 100-2H7zm0 4a1 1 0 100 2h6a1 1 0 100-2H7z" />
              </svg>
              Discriminação de Custos
            </h3>
            <svg 
              className={`w-5 h-5 transform transition-transform ${expandedSections.breakdown ? 'rotate-180' : ''}`}
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
          
          {expandedSections.breakdown && (
            <div className="mt-4 space-y-3">
              {simulationData.Calcs.item.map((calc: any, index: number) => (
                <div key={index} className="border border-green-200 rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-green-700">{calc.Description}</span>
                    <span className="text-lg font-bold text-green-600">€{calc.GrossTotalVal}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <span>Quantidade: {calc.Quant}</span>
                    <span>Comissão: {calc.ComissionPerc}%</span>
                    <span>Valor Unitário: €{calc.GrossUnitVal}</span>
                    <span>Código: {calc.ServiceCode}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Important Notices */}
      {simulationData?.Remarks?.item && (
        <div className="bg-yellow-50 rounded-lg p-6">
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection('notices')}
          >
            <h3 className="text-lg font-semibold text-yellow-800 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Informações Importantes
            </h3>
            <svg 
              className={`w-5 h-5 transform transition-transform ${expandedSections.notices ? 'rotate-180' : ''}`}
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
          
          {expandedSections.notices && (
            <div className="mt-4 space-y-2">
              {simulationData.Remarks.item.map((remark: any, index: number) => (
                <div key={index} className="border-l-4 border-yellow-500 pl-4 py-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-yellow-700">{remark.Type}</span>
                    <span className="text-xs text-gray-500">Interface: {remark.Interface}</span>
                  </div>
                  <div 
                    className="text-sm text-gray-700"
                    dangerouslySetInnerHTML={{ __html: remark.Text }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Cancellation Policies */}
      {simulationData?.Policies?.item && (
        <div className="bg-red-50 rounded-lg p-6">
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection('policies')}
          >
            <h3 className="text-lg font-semibold text-red-800 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Políticas de Cancelamento
            </h3>
            <svg 
              className={`w-5 h-5 transform transition-transform ${expandedSections.policies ? 'rotate-180' : ''}`}
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
          
          {expandedSections.policies && (
            <div className="mt-4 space-y-3">
              {simulationData.Policies.item
                .filter((policy: any) => policy.Type && policy.Service)
                .map((policy: any, index: number) => (
                <div key={index} className="border border-red-200 rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-red-700">{policy.Service}</span>
                    <span className="text-sm text-gray-500">{policy.Type}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-2">
                    <span>De: {formatDate(policy.DateFrom)}</span>
                    <span>Até: {formatDate(policy.DateTo)}</span>
                  </div>
                  <div className="text-sm font-medium text-red-600">
                    Custo de cancelamento: {policy.Value}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  </div>
  );
});

ReviewTab.displayName = 'ReviewTab';

export default ReviewTab;
