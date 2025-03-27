"use client";

import React from "react";

interface DatePickerProps {
  label: string;
  className?: string;
}

export default function DatePicker({ label, className = "" }: DatePickerProps) {
  return (
    <div className={`flex flex-col ${className}`}>
      <label className="mb-1 font-medium">{label}</label>
      <input
        type="date"
        className="w-full h-12 rounded-xl pl-4 pr-2 text-lg border-zinc-200 border-2 bg-softBackground focus:outline-none focus:ring-highlight"
      />
    </div>
  );
}
