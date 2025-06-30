"use client";

import React from "react";
import DatePicker from "react-datepicker";
import { FaCalendarAlt } from "react-icons/fa";
import { format, parseISO } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";


interface DatePickerProps {
  label: string;
  className?: string;
  value?: string;
  onChange?: (date: string) => void;
}

export default function Calendar({
  label,
  className = "",
  value,
  onChange,
}: DatePickerProps) {

  const allowedDatesSet = new Set<string>();
  const today = new Date();
  const nextYear = new Date(today);
  nextYear.setFullYear(today.getFullYear() + 1);

  const addDate = (date: Date) => {
    allowedDatesSet.add(format(date, "yyyy-MM-dd"));
  };

  for (let d = today; d <= nextYear; d.setDate(d.getDate() + 1)) {
    addDate(new Date(d));
  }

  return (
    <div className={`flex flex-col ${className}`}>
      <label className="mb-1 font-medium">
        {label}
      </label>
        <div className="relative w-full">
            <DatePicker
            placeholderText="Selecione uma data"
            selected={value ? parseISO(value) : null}
            onChange={(date: Date | null) => {
                if (date) {
                  const { format } = require("date-fns");
                    const iso = format(date, "yyyy-MM-dd");
                    const today = format(new Date(), "yyyy-MM-dd");
                    if (iso >= today) {
                      onChange?.(iso);
                    }
                }
            }}
            includeDates={Array.from(allowedDatesSet).map((d) => parseISO(d))}
            dateFormat="yyyy-MM-dd"
            wrapperClassName="w-full"
            popperPlacement="bottom-start"
            className="w-full h-12 pl-4 pr-10 rounded-xl border-2 border-zinc-200 bg-softBackground text-lg focus:outline-none focus:ring-highlight"
            />
            <FaCalendarAlt className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
        </div>
    </div>
  );
}
