"use client";

import React from "react";

interface NumberInputProps {
  label: string;
  className?: string;
}

export default function NumberInput({
  label,
  className = "",
}: NumberInputProps) {
  return (
    <div className={`flex flex-col ${className}`}>
      <label className="mb-1 font-medium">{label}</label>
      <input
        type="number"
        placeholder={0}
        className="w-full h-12 rounded-xl pl-4 pr-2 text-lg border-none bg-softBackground focus:outline-none focus:ring-highlight"
      />
    </div>
  );
}
