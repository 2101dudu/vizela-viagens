import React, { useState } from 'react';
import { BookingState, ProductData, LookupMaps } from '../types';

interface SidebarProps {
  productData: ProductData;
  bookingState: BookingState;
  hotelLocations: any[];
  switchTab: (tab: string) => void;
  totalPrice: number;
  isDone: boolean;
  renderStarRating: (rating: string) => React.ReactNode;
  onConfirmButtonHover?: () => void;
  token: string | null;
  lookupMaps: LookupMaps;
}

interface FormData {
  name: string;
  surname: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  wantsNewsletter: string;
}

interface FormErrors {
  name?: string;
  surname?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
}

const Sidebar = React.memo<SidebarProps>(({
  productData,
  bookingState,
  hotelLocations,
  switchTab,
  totalPrice,
  isDone,
  renderStarRating,
  onConfirmButtonHover,
  token,
  lookupMaps
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    surname: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    wantsNewsletter: 'false'
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation functions
  const validateName = (name: string): string | undefined => {
    if (!name.trim()) return 'Nome é obrigatório';
    if (name.trim().length < 2) return 'Nome deve ter pelo menos 2 caracteres';
    if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(name)) return 'Nome deve conter apenas letras';
    return undefined;
  };

  const validateSurname = (surname: string): string | undefined => {
    if (!surname.trim()) return 'Apelido é obrigatório';
    if (surname.trim().length < 2) return 'Apelido deve ter pelo menos 2 caracteres';
    if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(surname)) return 'Apelido deve conter apenas letras';
    return undefined;
  };

  const validateEmail = (email: string): string | undefined => {
    if (!email.trim()) return 'Email é obrigatório';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Email deve ter um formato válido (exemplo@email.com)';
    return undefined;
  };

  const validatePhone = (phone: string): string | undefined => {
    if (!phone.trim()) return 'Número de telefone é obrigatório';
    // Remove spaces, dashes, and plus signs for validation
    const cleanPhone = phone.replace(/[\s\-\+]/g, '');
    if (!/^\d{9,15}$/.test(cleanPhone)) return 'Número de telefone deve conter entre 9 e 15 dígitos';
    return undefined;
  };

  const validateDateOfBirth = (dateOfBirth: string): string | undefined => {
    if (!dateOfBirth) return 'Data de nascimento é obrigatória';
    
    const selectedDate = new Date(dateOfBirth);
    const today = new Date();
    const minDate = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate());
    const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    
    if (selectedDate > today) return 'Data de nascimento não pode ser no futuro';
    if (selectedDate < minDate) return 'Data de nascimento inválida';
    if (selectedDate > maxDate) return 'Deve ter pelo menos 18 anos de idade';
    
    return undefined;
  };

  const validateField = (field: keyof FormData, value: string) => {
    let error: string | undefined;
    
    switch (field) {
      case 'name':
        error = validateName(value);
        break;
      case 'surname':
        error = validateSurname(value);
        break;
      case 'email':
        error = validateEmail(value);
        break;
      case 'phone':
        error = validatePhone(value);
        break;
      case 'dateOfBirth':
        error = validateDateOfBirth(value);
        break;
    }
    
    setFormErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    // Special handling for phone number to allow only digits, spaces, dashes, and plus
    if (field === 'phone') {
      value = value.replace(/[^0-9\s\-\+]/g, '');
    }
    
    // Special handling for name and surname to allow only letters and spaces
    if (field === 'name' || field === 'surname') {
      value = value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Validate field on change
    validateField(field, value);
  };

  const isFormValid = (): boolean => {
    // Check if all required fields are filled (excluding wantsNewsletter which is optional)
    const requiredFields = ['name', 'surname', 'email', 'phone', 'dateOfBirth'];
    const allRequiredFieldsFilled = requiredFields.every(field => 
      formData[field as keyof FormData].toString().trim() !== ''
    );
    
    // Check if there are no validation errors
    const noErrors = Object.values(formErrors).every(error => !error);
    
    // Check if terms are accepted
    return allRequiredFieldsFilled && noErrors && acceptedTerms;
  };

  const validateAllFields = (): boolean => {
    const errors: FormErrors = {};
    
    errors.name = validateName(formData.name);
    errors.surname = validateSurname(formData.surname);
    errors.email = validateEmail(formData.email);
    errors.phone = validatePhone(formData.phone);
    errors.dateOfBirth = validateDateOfBirth(formData.dateOfBirth);
    
    setFormErrors(errors);
    
    return Object.values(errors).every(error => !error);
  };

  const handleSubmit = async () => {
    // Validate all fields before submission
    if (!validateAllFields() || !acceptedTerms) {
      alert('Por favor, corrija os erros no formulário antes de continuar.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`http://192.168.1.120:8080/api/dynamic/product/send-email?token=${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Informações enviadas com sucesso!');
        setIsModalOpen(false);
        setFormData({
          name: '',
          surname: '',
          email: '',
          phone: '',
          dateOfBirth: '',
          wantsNewsletter: 'false'
        });
        setFormErrors({});
        setAcceptedTerms(false);
      } else {
        alert('Erro ao enviar informações. Tente novamente.');
      }
    } catch (error) {
      alert('Erro de rede. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({
      name: '',
      surname: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      wantsNewsletter: 'false'
    });
    setFormErrors({});
    setAcceptedTerms(false);
  };

  return (
    <>
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
                  const selectedOption = lookupMaps.flightOptionsMap.get(bookingState.selectedFlight!.optionCode);
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
                  
                  // Calculate total price for all rooms in this hotel
                  let hotelTotalPrice = 0;
                  const roomSelections = hotelSelection.roomSelections || {};
                  
                  return (
                    <div key={locationCode} className="space-y-1">
                      <div className="font-medium text-blue-700 flex justify-between">
                        <span>Hotel {location?.Name === "Alojamento" ? "" : `- ${location?.Name}`}:</span>
                        <span>{selectedHotel.Name}</span>
                      </div>
                      {Object.entries(roomSelections).map(([roomGroupId, roomSelection], roomIndex) => {
                        // Find the room details
                        const roomGroup = selectedHotel.RoomsOccupancy.item.find(
                          (rg: any) => rg.RoomGroup === roomGroupId
                        );
                        const room = roomGroup?.Rooms.item.find((r: any) => 
                          r.Code === roomSelection.roomCode && r.RoomNum === roomSelection.roomNum
                        );
                        
                        if (!room) return null;
                        
                        const roomPrice = parseFloat(room.SellValue);
                        hotelTotalPrice += roomPrice;
                        
                        return (
                          <div key={`${roomGroupId}-${roomSelection.roomCode}`} className="flex justify-between text-xs text-gray-600 ml-4">
                            <span>
                              Quarto {roomIndex + 1} ({roomGroup?.NumAdults} adulto{roomGroup?.NumAdults !== '1' ? 's' : ''}
                              {parseInt(roomGroup?.NumChilds || '0') > 0 && `, ${roomGroup?.NumChilds} criança${roomGroup?.NumChilds !== '1' ? 's' : ''}`}):
                            </span>
                            <span>€{roomPrice.toFixed(2)}</span>
                          </div>
                        );
                      })}
                      <div className="flex justify-between font-medium border-t pt-1">
                        <span>Subtotal {location?.Name === "Alojamento" ? "Alojamento" : location?.Name}:</span>
                        <span>€{hotelTotalPrice.toFixed(2)}</span>
                      </div>
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
                    className="cursor-not-allowed w-full bg-gray-300 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                  >
                    ← Voltar
                  </button>
                    <button
                    onClick={() => {
                      switchTab('hotels-0');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
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
                      window.scrollTo({ top: 0, behavior: 'smooth' });
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
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}                
                    onMouseEnter={() => {
                      if (!(bookingState.currentHotelIndex < hotelLocations.length - 1) && onConfirmButtonHover) {
                      onConfirmButtonHover();
                      }
                    }}
                    disabled={(() => {
                      const currentLocation = hotelLocations[bookingState.currentHotelIndex];
                      const hotelSelection = bookingState.selectedHotels[currentLocation?.Code];
                      
                      if (!hotelSelection) return true;
                      
                      // Check if all room groups for this location have selections
                      const selectedHotel = currentLocation?.HotelOption?.item?.find((h: any) => h.Code === hotelSelection.hotelCode);
                      if (!selectedHotel) return true;
                      
                      const requiredRoomGroups = selectedHotel.RoomsOccupancy.item.length;
                      const selectedRoomGroups = Object.keys(hotelSelection.roomSelections || {}).length;
                      
                      return selectedRoomGroups !== requiredRoomGroups;
                    })()}
                    className={`w-full font-medium py-3 px-4 rounded-lg transition-colors ${
                      (() => {
                        const currentLocation = hotelLocations[bookingState.currentHotelIndex];
                        const hotelSelection = bookingState.selectedHotels[currentLocation?.Code];
                        
                        if (!hotelSelection) return 'bg-gray-300 text-gray-500 cursor-not-allowed';
                        
                        // Check if all room groups for this location have selections
                        const selectedHotel = currentLocation?.HotelOption?.item?.find((h: any) => h.Code === hotelSelection.hotelCode);
                        if (!selectedHotel) return 'bg-gray-300 text-gray-500 cursor-not-allowed';
                        
                        const requiredRoomGroups = selectedHotel.RoomsOccupancy.item.length;
                        const selectedRoomGroups = Object.keys(hotelSelection.roomSelections || {}).length;
                        
                        return selectedRoomGroups === requiredRoomGroups
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed';
                      })()
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
                    onClick={() => {
                      switchTab(`hotels-${hotelLocations.length - 1}`);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                    >
                    ← Voltar
                    </button>
                  <button
                    onClick={openModal}
                    disabled={!token}
                    onMouseEnter={() => {
                      if (onConfirmButtonHover) {
                        onConfirmButtonHover();
                      }
                    }}
                    className={`w-full font-medium py-3 px-4 rounded-lg transition-colors ${
                      !token
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    Confirmar
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Form Submission */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Informações Pessoais</h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
              >
                ×
              </button>
            </div>
            
            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => handleInputChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    formErrors.name 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder="Introduza o seu nome"
                />
                {formErrors.name && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Apelido *</label>
                <input
                  type="text"
                  value={formData.surname}
                  onChange={e => handleInputChange('surname', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    formErrors.surname 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder="Introduza o seu apelido"
                />
                {formErrors.surname && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.surname}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => handleInputChange('email', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    formErrors.email 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder="exemplo@email.com"
                />
                {formErrors.email && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número de Telefone *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => handleInputChange('phone', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    formErrors.phone 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder="+351 xxx xxx xxx"
                />
                {formErrors.phone && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento *</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={e => handleInputChange('dateOfBirth', e.target.value)}
                  max={new Date(new Date().getFullYear() - 18, new Date().getMonth(), new Date().getDate()).toISOString().split('T')[0]}
                  min={new Date(new Date().getFullYear() - 120, new Date().getMonth(), new Date().getDate()).toISOString().split('T')[0]}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    formErrors.dateOfBirth 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {formErrors.dateOfBirth && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.dateOfBirth}</p>
                )}
              </div>
            </div>

            {/* Newsletter Subscription */}
            <div className="flex items-start space-x-2 mt-6">
              <input
                type="checkbox"
                id="newsletter"
                checked={formData.wantsNewsletter === 'true'}
                onChange={e => setFormData(prev => ({ ...prev, wantsNewsletter: e.target.checked ? 'true' : 'false' }))}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="newsletter" className="text-sm text-gray-700">
                Quero subscrever a newsletter para receber ofertas especiais e novidades
              </label>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start space-x-2 mt-4">
              <input
                type="checkbox"
                id="terms"
                checked={acceptedTerms}
                onChange={e => setAcceptedTerms(e.target.checked)}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="terms" className="text-sm text-gray-700">
                Li e aceito os{' '}
                <a
                  href="/termos-e-condicoes"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  termos e condições
                </a>
                {' '}*
              </label>
            </div>

            {/* Submit Button */}
            <div className="mt-6">
              <button
                onClick={handleSubmit}
                disabled={!isFormValid() || isSubmitting}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  isFormValid() && !isSubmitting
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? 'A enviar...' : 'Enviar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;
