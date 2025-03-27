"use client";

import React from "react";

interface DestinationDropdownProps {
  className?: string;
}

export default function DestinationDropdown({
  className = "",
}: DestinationDropdownProps) {
  const options = ["Portugal", "Spain", "Italy", "France"];

  return (
    <div className={`flex flex-col ${className}`}>
      <label className="mb-1 font-medium">Destino</label>
      <select className="w-full h-12 rounded-xl pl-4 pr-2 text-lg border-none bg-softBackground focus:outline-none focus:ring-highlight">
        {options.map((option, idx) => (
          <option key={idx} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
