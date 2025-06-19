"use client";

import React from "react";

interface Country {
  Code: string;
  Description: string;
  Continent: string;
}

interface CountryDropdownProps {
  className?: string;
  countries: Country[];
  selectedCountry: string;
  onSelect: (code: string) => void;
}


export default function CountryDropdown({
  className = "",
  countries,
  selectedCountry,
  onSelect,
}: CountryDropdownProps) {
  return (
    <div className={`flex flex-col ${className}`}>
      <label className="mb-1 font-medium">País</label>
      <select
        className="w-full h-12 rounded-xl pl-4 pr-2 text-lg border-none bg-softBackground focus:outline-none focus:ring-highlight"
        value={selectedCountry}
        onChange={(e) => onSelect(e.target.value)}
      >
        <option value="">Selecione um país</option>
        {countries.map((country) => (
          <option key={country.Code} value={country.Code}>
            {country.Description}
          </option>
        ))}
      </select>
    </div>
  );
}
