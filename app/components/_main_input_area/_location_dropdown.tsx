"use client";

import React from "react";

interface Location {
  Code: string;
  Description: string;
  Country: string;
}

interface LocationDropdownProps {
  className?: string;
  locations: Location[];
  selectedLocation: string;
  selectedCountry: string;
  onSelect: (code: string) => void;
}


export default function LocationDropdown({
  className = "",
  locations,
  selectedLocation,
  selectedCountry,
  onSelect,
}: LocationDropdownProps) {
  const filteredLocations = locations.filter(
    (c) => c.Country === selectedCountry || selectedCountry === ""
  );

  const hasNoLocations = filteredLocations.length === 0 && selectedCountry !== "";

  return (
    <div className={`flex flex-col ${className}`}>
      <label className="mb-1 font-medium">Localização</label>
      <select
        className="w-full h-12 rounded-xl pl-4 pr-2 text-lg border-none bg-softBackground focus:outline-none focus:ring-highlight"
        value={selectedLocation}
        onChange={(e) => onSelect(e.target.value)}
        disabled={hasNoLocations}
      >
        <option value="">
          {hasNoLocations
            ? "Nenhuma localização disponível para este país"
            : "Selecione um local"}
        </option>
        {filteredLocations.map((location) => (
          <option key={location.Code} value={location.Code}>
            {location.Description}
          </option>
        ))}
      </select>
      {hasNoLocations && (
        <p className="mt-1 text-sm text-gray-500">
          Este país não tem destinos disponíveis no momento
        </p>
      )}
    </div>
  );
}
