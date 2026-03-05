import React, { useState, useCallback } from 'react';
import { DynOptional, OptionalServiceSelection } from '../types';
import {
  calculateOptionalPrice,
  getOptionalTypeIcon,
  validateOptionalSelection,
  isMandatory,
  isUniqueSelect,
  formatPrice
} from '../utils/optionalsHelpers';

interface OptionalServiceCardProps {
  optional: DynOptional;
  isSelected: boolean;
  selection: OptionalServiceSelection | null;
  onSelect: (selection: OptionalServiceSelection | null) => void;
  flightData: any;
  paxCounts: { adults: number; children: number[] };
}

const OptionalServiceCard = React.memo<OptionalServiceCardProps>(({
  optional,
  isSelected,
  selection,
  onSelect,
  flightData,
  paxCounts
}) => {
  const [localSelection, setLocalSelection] = useState<Partial<OptionalServiceSelection>>(
    selection || {
      optional,
      adults: paxCounts.adults,
      childAges: paxCounts.children
    }
  );

  const mandatory = isMandatory(optional);
  const uniqueSelect = isUniqueSelect(optional);
  const icon = getOptionalTypeIcon(optional.Type);
  const isTransfer = optional.Type === 'TRF';

  const handleToggle = useCallback(() => {
    if (mandatory) return; // Can't deselect mandatory services

    if (isSelected) {
      onSelect(null);
    } else {
      // Validate before selecting
      const errors = validateOptionalSelection(optional, localSelection);
      if (errors.length === 0) {
        onSelect(localSelection as OptionalServiceSelection);
      }
    }
  }, [isSelected, mandatory, optional, localSelection, onSelect]);

  const handleFieldChange = useCallback((
    field: keyof OptionalServiceSelection,
    value: any
  ) => {
    const updated = { ...localSelection, [field]: value };
    setLocalSelection(updated);

    // If already selected, update the selection
    if (isSelected) {
      const errors = validateOptionalSelection(optional, updated);
      if (errors.length === 0) {
        onSelect(updated as OptionalServiceSelection);
      }
    }
  }, [localSelection, isSelected, optional, onSelect]);

  const price = selection
    ? calculateOptionalPrice(selection)
    : parseFloat(optional.Price || '0');

  const pricePerPerson = optional.PriceType === 'PER_PERSON';

  return (
    <div
      className={`border-2 rounded-lg p-4 transition-all ${
        isSelected
          ? 'border-purple-500 bg-purple-50'
          : 'border-gray-200 hover:border-gray-300'
      } ${mandatory ? 'bg-blue-50' : ''}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start flex-1">
          {/* Selection Control */}
          {!mandatory && (
            <div className="mr-3 mt-1">
              {uniqueSelect ? (
                // Radio button
                <div
                  className={`w-4 h-4 rounded-full border-2 cursor-pointer ${
                    isSelected
                      ? 'border-purple-500 bg-purple-500'
                      : 'border-gray-300'
                  }`}
                  onClick={handleToggle}
                >
                  {isSelected && (
                    <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                  )}
                </div>
              ) : (
                // Checkbox
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={handleToggle}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
              )}
            </div>
          )}

          {/* Service Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{icon}</span>
              <h3 className="font-semibold text-gray-800">{optional.Name}</h3>
              {mandatory && (
                <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded font-medium">
                  Obrigatório
                </span>
              )}
            </div>

            {optional.ShortDescription && (
              <p className="text-sm text-gray-600 mb-2">
                {optional.ShortDescription}
              </p>
            )}

            {optional.LongDescription && (
              <p className="text-xs text-gray-500 mb-2">
                {optional.LongDescription}
              </p>
            )}

            {/* Transfer-specific info */}
            {isTransfer && (optional.FromDetails || optional.ToDetails) && (
              <div className="text-xs text-gray-600 mb-2">
                {optional.FromDetails && (
                  <div>📍 De: {optional.FromDetails}</div>
                )}
                {optional.ToDetails && (
                  <div>📍 Para: {optional.ToDetails}</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Price */}
        <div className="text-right ml-4">
          <div className="text-xl font-bold text-green-600">
            {formatPrice(price)}
          </div>
          <div className="text-xs text-gray-500">
            {pricePerPerson ? 'por pessoa' : 'por grupo'}
          </div>
        </div>
      </div>

      {/* Selection Fields (shown when selected or mandatory) */}
      {(isSelected || mandatory) && (
        <div className="border-t pt-3 mt-3 space-y-3">
          {/* Date Selection */}
          {optional.Dates?.item && optional.Dates.item.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data *
              </label>
              <select
                value={localSelection.date || ''}
                onChange={(e) => handleFieldChange('date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Selecione uma data</option>
                {optional.Dates.item
                  .filter(d => d.Available === 'Y')
                  .map((date, idx) => (
                    <option key={idx} value={date.Date}>
                      {date.Date}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* Pickup Time (for transfers) */}
          {isTransfer && optional.PickupTime?.item && optional.PickupTime.item.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hora de Recolha *
              </label>
              <select
                value={localSelection.pickupTime || ''}
                onChange={(e) => handleFieldChange('pickupTime', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Selecione uma hora</option>
                {optional.PickupTime.item.map((time, idx) => (
                  <option key={idx} value={time.Time}>
                    {time.Time} {time.Description ? `- ${time.Description}` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Pickup Location (for transfers) */}
          {isTransfer && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Local de Recolha *
              </label>
              <input
                type="text"
                value={localSelection.pickupLocation || ''}
                onChange={(e) => handleFieldChange('pickupLocation', e.target.value)}
                placeholder="Ex: Hotel, aeroporto, endereço"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          )}

          {/* Dropoff Location (for transfers) */}
          {isTransfer && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Local de Entrega
              </label>
              <input
                type="text"
                value={localSelection.dropoffLocation || ''}
                onChange={(e) => handleFieldChange('dropoffLocation', e.target.value)}
                placeholder="Ex: Hotel, aeroporto, endereço"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          )}

          {/* Passenger Counts */}
          {pricePerPerson && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adultos *
                </label>
                <input
                  type="number"
                  min="1"
                  value={localSelection.adults || paxCounts.adults}
                  onChange={(e) => handleFieldChange('adults', parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Crianças
                </label>
                <div className="text-sm text-gray-600 px-3 py-2 bg-gray-50 rounded-lg">
                  {(localSelection.childAges || paxCounts.children).length || 0}
                </div>
              </div>
            </div>
          )}

          {/* Child Pricing Info */}
          {pricePerPerson && optional.PriceChilds?.item && optional.PriceChilds.item.length > 0 && (
            <div className="text-xs bg-gray-50 p-2 rounded">
              <div className="font-medium text-gray-700 mb-1">Preços para crianças:</div>
              <div className="space-y-0.5">
                {optional.PriceChilds.item.map((cp, idx) => (
                  <div key={idx} className="text-gray-600">
                    Idade {cp.Age}: {formatPrice(cp.Price || '0')}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Select Button for unselected optional */}
          {!isSelected && !mandatory && (
            <button
              onClick={handleToggle}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Adicionar Serviço
            </button>
          )}
        </div>
      )}
    </div>
  );
});

OptionalServiceCard.displayName = 'OptionalServiceCard';

export default OptionalServiceCard;
