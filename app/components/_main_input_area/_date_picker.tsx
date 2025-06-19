"use client";

import React from "react";

interface DatePickerProps {
  label: string;
  className?: string;
  value?: string;
  onChange?: (date: string) => void;
}

export default function DatePicker({
  label,
  className = "",
  value,
  onChange,
}: DatePickerProps) {
  return (
    <div className={`flex flex-col ${className}`}>
      <label className="mb-1 font-medium">
        {label}
        <b className="text-red-500">*</b>
      </label>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full h-12 rounded-xl pl-4 pr-2 text-lg border-zinc-200 border-2 bg-softBackground focus:outline-none focus:ring-highlight"
      />
    </div>
  );
}
