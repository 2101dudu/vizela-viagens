import { useCallback, useEffect } from 'react';
import { BookingState, FlightOption, LookupMaps } from '../types';

export const useFlightSelection = (
  selectedFlights: {[optionCode: string]: {[segmentCode: string]: string}},
  setSelectedFlights: (flights: {[optionCode: string]: {[segmentCode: string]: string}}) => void,
  baseData: { flightOptions: FlightOption[], hotelLocations: any[] },
  lookupMaps: LookupMaps,
  setBookingState: (updater: (prev: BookingState) => BookingState) => void
) => {
  const handleFlightSelection = useCallback((optionCode: string, segmentCode: string, flightGroupCode: string) => {
    // Check if we're selecting from the same entry as currently selected flights
    const currentlySelectedEntry = Object.keys(selectedFlights).find(entryCode => 
      Object.values(selectedFlights[entryCode] || {}).some(selection => selection !== "")
    );
    
    let newSelections: {[optionCode: string]: {[segmentCode: string]: string}};
    
    if (currentlySelectedEntry && currentlySelectedEntry !== optionCode) {
      // Selecting from a different entry - clear all and start fresh
      newSelections = {};
      baseData.flightOptions.forEach(option => {
        newSelections[option.OptionCode] = {};
        option.FlightSegments.item.forEach(segment => {
          newSelections[option.OptionCode][segment.SegmentCode] = "";
        });
      });
    } else {
      // Selecting from the same entry or no entry selected yet - preserve existing selections
      newSelections = { ...selectedFlights };
      // Ensure all entries are initialized
      baseData.flightOptions.forEach(option => {
        if (!newSelections[option.OptionCode]) {
          newSelections[option.OptionCode] = {};
          option.FlightSegments.item.forEach(segment => {
            newSelections[option.OptionCode][segment.SegmentCode] = "";
          });
        }
      });
    }

    // Find the selected option using Map lookup
    const selectedOption = lookupMaps.flightOptionsMap.get(optionCode);
    if (!selectedOption) return;

    // Set the selected flight for this segment
    newSelections[optionCode] ??= {};
    newSelections[optionCode][segmentCode] = flightGroupCode;


    // Auto-select other segments if they have only one flight option
    selectedOption.FlightSegments.item.forEach(segment => {
      if (segment.SegmentCode !== segmentCode && segment.Flights.item.length === 1) {
        // Auto-select if it has only one option and not already selected
        if (!newSelections[optionCode][segment.SegmentCode]) {
          newSelections[optionCode][segment.SegmentCode] = segment.Flights.item[0].FlightGroupCode;
        }
      }
    });

    setSelectedFlights(newSelections);
    
    // Update booking state - check if we have all segments selected for this option
    const entrySelections = newSelections[optionCode];
    const selectedCount = Object.values(entrySelections).filter(selection => selection !== "").length;
    const totalSegments = selectedOption.FlightSegments.item.length;
    
    if (selectedCount === totalSegments) {
      setBookingState(prev => ({
        ...prev,
        selectedFlight: {
          optionCode,
          flightSelections: entrySelections
        }
      }));
    } else {
      setBookingState(prev => ({
        ...prev,
        selectedFlight: null
      }));
    }
  }, [selectedFlights, baseData.flightOptions, lookupMaps.flightOptionsMap, setSelectedFlights, setBookingState]);

  const getSelectedFlightForSegment = useCallback((optionCode: string, segmentCode: string) => {
    return selectedFlights[optionCode]?.[segmentCode] || "";
  }, [selectedFlights]);

  // Initialize selected flights - only first option has flights selected by default
  useEffect(() => {
    if (baseData.flightOptions.length > 0 && Object.keys(selectedFlights).length === 0) {
      const initialSelections: {[optionCode: string]: {[segmentCode: string]: string}} = {};
      
      baseData.flightOptions.forEach((option, optionIndex) => {
        initialSelections[option.OptionCode] = {};
        option.FlightSegments.item.forEach(segment => {
          if (segment.Flights.item.length > 0) {
            // Only select flights for the first option, and only if segments have 1 flight option
            if (optionIndex === 0) {
              if (segment.Flights.item.length === 1) {
                // Auto-select if only one option
                initialSelections[option.OptionCode][segment.SegmentCode] = segment.Flights.item[0].FlightGroupCode;
              } else {
                // For multiple options, don't auto-select
                initialSelections[option.OptionCode][segment.SegmentCode] = "";
              }
            } else {
              // For other options, don't pre-select anything
              initialSelections[option.OptionCode][segment.SegmentCode] = "";
            }
          }
        });
      });
      
      setSelectedFlights(initialSelections);
      
      // Check if first option has all flights selected (meaning all segments have only 1 flight option)
      const firstOptionSelections = initialSelections["0"] || {};
      const hasAllFlightsSelected = Object.values(firstOptionSelections).every(selection => selection !== "");
      
      if (hasAllFlightsSelected && baseData.flightOptions[0]) {
        const firstOption = baseData.flightOptions[0];
        const numSegments = firstOption.FlightSegments.item.length;
        const selectedCount = Object.values(firstOptionSelections).filter(selection => selection !== "").length;
        
        // Only set as selected if all segments are selected
        if (selectedCount === numSegments) {
          setBookingState(prev => ({
            ...prev,
            selectedFlight: {
              optionCode: "0",
              flightSelections: firstOptionSelections
            }
          }));
        }
      }
    }
  }, [baseData.flightOptions, selectedFlights, setSelectedFlights, setBookingState]);

  // Handle new flights being added to baseData - ensure they have entries in selectedFlights
  useEffect(() => {
    if (baseData.flightOptions.length > 0) {
      const currentSelections = selectedFlights;
      const updated: {[optionCode: string]: {[segmentCode: string]: string}} = { ...currentSelections };
      let hasChanges = false;
      
      baseData.flightOptions.forEach(option => {
        if (!updated[option.OptionCode]) {
          updated[option.OptionCode] = {};
          hasChanges = true;
          
          option.FlightSegments.item.forEach(segment => {
            updated[option.OptionCode][segment.SegmentCode] = "";
          });
        }
      });
      
      if (hasChanges) {
        setSelectedFlights(updated);
      }
    }
  }, [baseData.flightOptions, selectedFlights, setSelectedFlights]);

  return {
    handleFlightSelection,
    getSelectedFlightForSegment
  };
};
