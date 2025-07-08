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
}

const ReviewTab = React.memo<ReviewTabProps>(({
  bookingState,
  productData,
  hotelLocations,
  totalPrice,
  formatDate,
  renderStarRating,
  onInsuranceChange,
  simulationData
}) => {
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({});
  
  const toggleSection = (sectionKey: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  // Debug simulation data structure
  React.useEffect(() => {
    if (simulationData) {
      console.log('🔍 Debugging simulationData structure:');
      console.log('Full simulationData:', simulationData);
      console.log('Services:', simulationData.Services);
      console.log('Services?.Items:', simulationData.Services?.Items);
      console.log('Remarks:', simulationData.Remarks);
      console.log('Remarks?.Items:', simulationData.Remarks?.Items);
      console.log('Calcs:', simulationData.Calcs);
      console.log('Calcs?.Items:', simulationData.Calcs?.Items);
      console.log('HotelWarnings:', simulationData.HotelWarnings);
      console.log('HotelWarnings?.Items:', simulationData.HotelWarnings?.Items);
      console.log('ResumeCalcs:', simulationData.ResumeCalcs);
      console.log('ResumeCalcs?.Items:', simulationData.ResumeCalcs?.Items);
      console.log('Conditions:', simulationData.Conditions);
    }
  }, [simulationData]);

  return (
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
                <span>Alojamento {location?.Name === "Alojamento" ? "" : location?.Name}:</span>
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

      {/* Simulation Data Sections */}
      {simulationData && (
        <>
          {/* Debug Section - This should always show if simulationData exists */}
          <div className="bg-purple-50 rounded-lg p-6 border-2 border-purple-200">
            <h3 className="text-lg font-semibold text-purple-800 mb-4">🔍 Debug: Simulation Data Structure</h3>
            <div className="text-sm space-y-1">
              <div>✅ simulationData exists: {simulationData ? 'YES' : 'NO'}</div>
              <div>Services structure: {JSON.stringify(simulationData.Services, null, 2)}</div>
              <div>Remarks structure: {JSON.stringify(simulationData.Remarks, null, 2)}</div>
              <div>Calcs structure: {JSON.stringify(simulationData.Calcs, null, 2)}</div>
              <div>Object.keys(Services): {simulationData.Services ? JSON.stringify(Object.keys(simulationData.Services)) : 'N/A'}</div>
              <div>Object.keys(Remarks): {simulationData.Remarks ? JSON.stringify(Object.keys(simulationData.Remarks)) : 'N/A'}</div>
            </div>
          </div>

          {/* Services Information - Try different property names */}
          {(((simulationData.Services as any)?.Items && (simulationData.Services as any).Items.length > 0) ||
            ((simulationData.Services as any)?.items && (simulationData.Services as any).items.length > 0) ||
            ((simulationData.Services as any)?.item && (simulationData.Services as any).item.length > 0) ||
            (Array.isArray(simulationData.Services) && simulationData.Services.length > 0)) && (
            <div className="bg-gray-50 rounded-lg p-6">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection('services')}
              >
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Serviços Detalhados
                </h3>
                <svg 
                  className={`w-5 h-5 transform transition-transform ${expandedSections.services ? 'rotate-180' : ''}`}
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              
              {expandedSections.services && (
                <div className="mt-4 space-y-3">
                  {(() => {
                    // Determine the correct array to use
                    let servicesArray: any[] = [];
                    const services = simulationData.Services as any;
                    if (services?.Items) {
                      servicesArray = services.Items;
                    } else if (services?.items) {
                      servicesArray = services.items;
                    } else if (services?.item) {
                      servicesArray = services.item;
                    } else if (Array.isArray(simulationData.Services)) {
                      servicesArray = simulationData.Services;
                    }
                    
                    return servicesArray.map((service: any, index: number) => (
                      <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                        <div className="flex items-center justify-between mb-1">
                          {service.Type && <span className="font-medium text-blue-600">{service.Type}</span>}
                          {service.SubType && <span className="text-sm text-gray-500">{service.SubType}</span>}
                        </div>
                        {service.Description && (
                          <p className="text-sm text-gray-700 mb-2">{service.Description}</p>
                        )}
                        <div className="flex justify-between text-xs text-gray-600">
                          <div className="space-x-4">
                            {service.Quant && <span>Quantidade: {service.Quant}</span>}
                            {service.Status && <span>Status: {service.Status}</span>}
                          </div>
                          <div className="space-x-4">
                            {service.DateFrom && <span>De: {formatDate(service.DateFrom)}</span>}
                            {service.DateTo && <span>Até: {formatDate(service.DateTo)}</span>}
                          </div>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              )}
            </div>
          )}

          {/* Remarks - Try different property names */}
          {(((simulationData.Remarks as any)?.Items && (simulationData.Remarks as any).Items.length > 0) ||
            ((simulationData.Remarks as any)?.items && (simulationData.Remarks as any).items.length > 0) ||
            ((simulationData.Remarks as any)?.item && (simulationData.Remarks as any).item.length > 0) ||
            (Array.isArray(simulationData.Remarks) && simulationData.Remarks.length > 0)) && (
            <div className="bg-yellow-50 rounded-lg p-6">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection('remarks')}
              >
                <h3 className="text-lg font-semibold text-yellow-800 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Observações
                </h3>
                <svg 
                  className={`w-5 h-5 transform transition-transform ${expandedSections.remarks ? 'rotate-180' : ''}`}
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              
              {expandedSections.remarks && (
                <div className="mt-4 space-y-2">
                  {simulationData.Remarks.Items.map((remark, index) => (
                    <div key={index} className="border-l-4 border-yellow-500 pl-4 py-2">
                      <div className="flex items-center justify-between mb-1">
                        {remark.Type && <span className="font-medium text-yellow-700">{remark.Type}</span>}
                        {remark.Interface && <span className="text-xs text-gray-500">Interface: {remark.Interface}</span>}
                      </div>
                      {remark.Text && <p className="text-sm text-gray-700">{remark.Text}</p>}
                      {remark.RelatedUnit && <span className="text-xs text-gray-600">Unidade: {remark.RelatedUnit}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Calculations */}
          {simulationData.Calcs?.Items && simulationData.Calcs.Items.length > 0 && (
            <div className="bg-green-50 rounded-lg p-6">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection('calcs')}
              >
                <h3 className="text-lg font-semibold text-green-800 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm3 5a1 1 0 000 2h6a1 1 0 100-2H7zm0 4a1 1 0 100 2h6a1 1 0 100-2H7z" />
                  </svg>
                  Cálculos Detalhados
                </h3>
                <svg 
                  className={`w-5 h-5 transform transition-transform ${expandedSections.calcs ? 'rotate-180' : ''}`}
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              
              {expandedSections.calcs && (
                <div className="mt-4 space-y-3">
                  {simulationData.Calcs.Items.map((calc, index) => (
                    <div key={index} className="border border-green-200 rounded p-3">
                      <div className="flex items-center justify-between mb-2">
                        {calc.Service && <span className="font-medium text-green-700">{calc.Service}</span>}
                        {calc.ServiceCode && <span className="text-sm text-gray-500">Código: {calc.ServiceCode}</span>}
                      </div>
                      {calc.Description && (
                        <p className="text-sm text-gray-700 mb-2">{calc.Description}</p>
                      )}
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                        {calc.Quant && <span>Quantidade: {calc.Quant}</span>}
                        {calc.ComissionPerc && <span>Comissão: {calc.ComissionPerc}%</span>}
                        {calc.GrossUnitVal && <span>Valor Unitário: €{calc.GrossUnitVal}</span>}
                        {calc.GrossTotalVal && <span>Valor Total: €{calc.GrossTotalVal}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Hotel Warnings */}
          {simulationData.HotelWarnings?.Items && simulationData.HotelWarnings.Items.length > 0 && (
            <div className="bg-red-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Avisos Importantes
              </h3>
              <div className="space-y-2">
                {simulationData.HotelWarnings.Items.map((warning, index) => (
                  warning.Message && (
                    <div key={index} className="border-l-4 border-red-500 pl-4 py-2">
                      <p className="text-sm text-red-700">{warning.Message}</p>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}

          {/* Resume Calculations */}
          {simulationData.ResumeCalcs?.Items && simulationData.ResumeCalcs.Items.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm3 5a1 1 0 000 2h6a1 1 0 100-2H7zm0 4a1 1 0 100 2h6a1 1 0 100-2H7z" />
                </svg>
                Resumo Financeiro
              </h3>
              {simulationData.ResumeCalcs.Items.map((resume, index) => (
                <div key={index} className="space-y-2 text-sm">
                  {resume.TotalCommisionable && (
                    <div className="flex justify-between">
                      <span>Total Comissionável:</span>
                      <span>€{resume.TotalCommisionable}</span>
                    </div>
                  )}
                  {resume.TotalNoCommisionable && (
                    <div className="flex justify-between">
                      <span>Total Não Comissionável:</span>
                      <span>€{resume.TotalNoCommisionable}</span>
                    </div>
                  )}
                  {resume.TotalCommision && (
                    <div className="flex justify-between">
                      <span>Total Comissão:</span>
                      <span>€{resume.TotalCommision}</span>
                    </div>
                  )}
                  {resume.Discount && (
                    <div className="flex justify-between text-green-600">
                      <span>Desconto:</span>
                      <span>€{resume.Discount}</span>
                    </div>
                  )}
                  {resume.Total && (
                    <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                      <span>Total Final:</span>
                      <span className="text-blue-600">€{resume.Total}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Conditions */}
          {simulationData.Conditions && (
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
                </svg>
                Termos e Condições
              </h3>
              <div className="text-sm text-gray-700 whitespace-pre-wrap">
                {simulationData.Conditions}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  </div>
  );
});

ReviewTab.displayName = 'ReviewTab';

export default ReviewTab;
