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

  return (
    <div className={`flex flex-col ${className}`}>
      <label className="mb-1 font-medium">Localização</label>
      <select
        className="w-full h-12 rounded-xl pl-4 pr-2 text-lg border-none bg-softBackground focus:outline-none focus:ring-highlight"
        value={selectedLocation}
        onChange={(e) => onSelect(e.target.value)}
      >
        <option value="">Selecione um local</option>
        {filteredLocations.map((location) => (
          <option key={location.Code} value={location.Code}>
            {location.Description}
          </option>
        ))}
      </select>
    </div>
  );
}
