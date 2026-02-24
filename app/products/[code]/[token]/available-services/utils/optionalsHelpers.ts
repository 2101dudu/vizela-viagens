import { OptionalServiceSelection, DynOptional } from '../types';

/**
 * Calculate the total price for an optional service selection
 * Handles both PER_PERSON and PER_GROUP pricing, including child pricing
 */
export function calculateOptionalPrice(
  selection: OptionalServiceSelection
): number {
  const basePrice = parseFloat(selection.optional.Price || '0');

  if (selection.optional.PriceType === 'PER_PERSON') {
    let totalPrice = basePrice * selection.adults;

    // Handle child pricing if available
    if (selection.optional.PriceChilds?.item && selection.optional.PriceChilds.item.length > 0) {
      selection.childAges.forEach(age => {
        const childPrice = selection.optional.PriceChilds?.item.find(
          cp => parseInt(cp.Age || '0') === age
        );
        totalPrice += childPrice ? parseFloat(childPrice.Price || '0') : basePrice;
      });
    } else {
      // No specific child pricing, use base price for children
      totalPrice += basePrice * selection.childAges.length;
    }

    return totalPrice;
  } else {
    // PER_GROUP pricing - price applies to entire group
    return basePrice;
  }
}

/**
 * Group optionals by their type for organized display
 * Returns object with type keys and arrays of optionals
 */
export function groupOptionalsByType(
  optionals: DynOptional[]
): { [type: string]: DynOptional[] } {
  const groups: { [type: string]: DynOptional[] } = {};

  optionals.forEach(opt => {
    const type = opt.Type || 'OTHER';
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(opt);
  });

  return groups;
}

/**
 * Validate that an optional selection has all required fields
 * Returns array of error messages, empty if valid
 */
export function validateOptionalSelection(
  optional: DynOptional,
  selection: Partial<OptionalServiceSelection>
): string[] {
  const errors: string[] = [];

  // Check transfer-specific requirements
  if (optional.Type === 'TRF') {
    if (!selection.pickupTime) {
      errors.push('Hora de recolha é obrigatória para transfers');
    }
    if (!selection.pickupLocation) {
      errors.push('Local de recolha é obrigatório');
    }
  }

  // Check if date is required
  if (optional.Dates?.item && optional.Dates.item.length > 0 && !selection.date) {
    errors.push('Seleção de data é obrigatória');
  }

  // Check passenger count
  if (!selection.adults || selection.adults < 1) {
    errors.push('Pelo menos um adulto é obrigatório');
  }

  return errors;
}

/**
 * Get icon emoji for optional service type
 */
export function getOptionalTypeIcon(type?: string): string {
  const icons: { [key: string]: string } = {
    'TRF': '🚌',
    'EXC': '🎯',
    'ACT': '🏃',
    'TOUR': '🗺️',
    'OTHER': '📋'
  };
  return icons[type || 'OTHER'] || icons['OTHER'];
}

/**
 * Get human-readable label for optional service type
 */
export function getOptionalTypeLabel(type?: string): string {
  const labels: { [key: string]: string } = {
    'TRF': 'Transfers',
    'EXC': 'Excursões',
    'ACT': 'Atividades',
    'TOUR': 'Tours',
    'OTHER': 'Outros Serviços'
  };
  return labels[type || 'OTHER'] || labels['OTHER'];
}

/**
 * Format price for display
 */
export function formatPrice(price: number | string): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return `€${numPrice.toFixed(2)}`;
}

/**
 * Check if an optional is mandatory
 */
export function isMandatory(optional: DynOptional): boolean {
  return optional.Mandatory === 'Y';
}

/**
 * Check if an optional allows only single selection (radio behavior)
 */
export function isUniqueSelect(optional: DynOptional): boolean {
  return optional.UniqueSelect === 'Y';
}

/**
 * Get default passenger counts from hotel selections
 */
export function getDefaultPassengerCounts(
  hotelSelections: any
): { adults: number; childAges: number[] } {
  let adults = 0;
  const childAges: number[] = [];

  // This will be called with actual hotel data from the booking state
  // For now, return defaults
  return { adults: adults || 1, childAges };
}
