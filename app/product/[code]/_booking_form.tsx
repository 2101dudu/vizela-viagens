"use client";

import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt } from "react-icons/fa";
import { parseISO } from "date-fns";

interface DepartureLocal {
  Code: string;
  Name: string;
}

interface DepartureDate {
  Date: string;
}

interface RoomType {
  Code: string;
  Name: string;
  NumAdults: string;
  NumChilds: string;
  ChildAgeFrom: string;
  ChildAgeTo: string;
}

interface BaseLocal {
  MinNights: string;
  MaxNights: string;
}

export interface ApiData {
  Code: string;
  Name: string;
  Localization: string;
  Country: string;
  Zone: string;
  ExtraNightsFrom: string;
  ExtraNightsTo: string;
  MinPaxReserve: string;
  MaxPaxReserve: string;

  DepartureLocals: { item: DepartureLocal[] };
  DepartureDates: { item: DepartureDate[] };
  RoomTypes: { item: RoomType[] };
  BaseLocals: { item: BaseLocal[] };
}

interface BookingFormProps {
  data: ApiData;
}

export default function BookingForm({ data }: BookingFormProps) {
  // flatten
  const locales = data.DepartureLocals.item;
  const dates = data.DepartureDates.item.map((d) => d.Date);
  const roomTypes = data.RoomTypes.item;
  const { MinNights, MaxNights } = data.BaseLocals.item[0];

  // form state
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedLocale, setSelectedLocale] = useState("");
  const [selectedNights, setSelectedNights] = useState<number | "">("");
  const [numRooms, setNumRooms] = useState<number>(1);

  const allowedDatesSet = new Set(dates);

  // one entry per room
  const [rooms, setRooms] = useState<
    {
      roomTypeCode: string;
      childAges: (number | "")[];
    }[]
  >(
    Array.from({ length: 1 }).map(() => ({
      roomTypeCode: "",
      childAges: [],
    }))
  );

  // when numRooms changes, resize rooms array
  const handleNumRoomsChange = (n: number) => {
    setNumRooms(n);
    setRooms((prev) => {
      const next = prev.slice(0, n);
      while (next.length < n) {
        next.push({ roomTypeCode: "", childAges: [] });
      }
      return next;
    });
  };

  // when a roomType changes, update childAges length
  const handleRoomTypeChange = (index: number, code: string) => {
    const rt = roomTypes.find((r) => r.Code === code)!;
    setRooms((prev) =>
      prev.map((room, i) =>
        i !== index
          ? room
          : {
              roomTypeCode: code,
              childAges: Array.from({ length: Number(rt.NumChilds) }).map(() => ""),
            }
      )
    );
  };

  // update a single child age
  const handleChildAgeChange = (
    roomIndex: number,
    childIndex: number,
    age: number
  ) => {
    setRooms((prev) =>
      prev.map((room, i) =>
        i !== roomIndex
          ? room
          : {
              ...room,
              childAges: room.childAges.map((a, j) =>
                j !== childIndex ? a : age
              ),
            }
      )
    );
  };

  return (
    <form className="flex flex-col space-y-4 p-4 max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-4">Reservar {data.Name}</h1>
      {/* Date dropdown */}
        <div className="flex flex-col">
            <label className="mb-1 font-medium">Data de Partida</label>
            <div className="relative w-full">
                <DatePicker
                selected={selectedDate ? parseISO(selectedDate) : dates.pop() ? parseISO(dates[0]) : null}
                onChange={(date: Date | null) => {
                    if (date) {
                    const iso = date.toISOString().split("T")[0];
                    if (allowedDatesSet.has(iso)) {
                        setSelectedDate(iso);
                    }
                    }
                }}
                includeDates={dates.map((d) => parseISO(d))}
                dateFormat="yyyy-MM-dd"
                wrapperClassName="w-full"
                popperPlacement="bottom-start"
                className="w-full h-12 pl-4 pr-10 rounded-xl border-2 border-zinc-200 bg-softBackground text-lg focus:outline-none focus:ring-highlight"
                />
                <FaCalendarAlt className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            </div>
        </div>

      {/* Departure locale */}
      <div className="flex flex-col">
        <label className="mb-1 font-medium">Local de Partida</label>
        <select
          value={selectedLocale}
          onChange={(e) => setSelectedLocale(e.target.value)}
          className="h-12 rounded-xl pl-4 pr-2 text-lg border-2 border-zinc-200 bg-softBackground focus:outline-none focus:ring-highlight"
        >
          {locales.map((loc) => (
            <option key={loc.Code} value={loc.Code}>
              {loc.Name}
            </option>
          ))}
        </select>
      </div>

      {/* Number of nights */}
      <div className="flex flex-col">
        <label className="mb-1 font-medium">Noites em Alojamento</label>
        <select
          value={selectedNights}
          onChange={(e) => setSelectedNights(+e.target.value)}
          className="h-12 rounded-xl pl-4 pr-2 text-lg border-2 border-zinc-200 bg-softBackground focus:outline-none focus:ring-highlight"
        >
          {Array.from(
            { length: Number(MaxNights) - Number(MinNights) + 1 },
            (_, i) => Number(MinNights) + i
          ).map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      {/* Number of rooms */}
      <div className="flex flex-col">
        <label className="mb-1 font-medium">Número de Quartos</label>
        <select
          value={numRooms}
          onChange={(e) => handleNumRoomsChange(+e.target.value)}
          className="h-12 rounded-xl pl-4 pr-2 text-lg border-2 border-zinc-200 bg-softBackground focus:outline-none focus:ring-highlight"
        >
          {Array.from({ length: 5 }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      {/* Rooms */}
      {rooms.map((room, idx) => {
        const maxChildren =
          roomTypes.find((r) => r.Code === room.roomTypeCode)
            ?.NumChilds || 0;
        const { ChildAgeFrom, ChildAgeTo } =
          roomTypes.find((r) => r.Code === room.roomTypeCode) || {};
        return (
          <div key={idx} className="flex flex-col border p-4 rounded-xl space-y-3">
            <h4 className="font-medium">Quarto {numRooms === 1 ? "" : idx + 1}</h4>

            {/* Room type */}
            <div className="flex flex-col">
              <label className="mb-1">Tipologia do Quarto</label>
              <select
                value={room.roomTypeCode}
                onChange={(e) =>
                  handleRoomTypeChange(idx, e.target.value)
                }
                className="h-12 rounded-xl pl-4 pr-2 text-lg border-2 border-zinc-200 bg-softBackground focus:outline-none focus:ring-highlight"
              >
                {roomTypes.map((rt) => (
                  <option key={rt.Code} value={rt.Code}>
                    {rt.Name}
                  </option>
                ))}
              </select>
            </div>

            {/* Child ages */}
            {Number(maxChildren) > 0 &&
              room.childAges.map((age, cIdx) => (
                <div className="flex flex-col" key={cIdx}>
                  <label className="mb-1">Idade da Criança {maxChildren === "1" ? "" : cIdx + 1}</label>
                  <select
                    value={age}
                    onChange={(e) =>
                      handleChildAgeChange(idx, cIdx, +e.target.value)
                    }
                    className="h-12 rounded-xl pl-4 pr-2 text-lg border-2 border-zinc-200 bg-softBackground focus:outline-none focus:ring-highlight"
                  >
                    {Array.from(
                      { length: Number(ChildAgeTo) - Number(ChildAgeFrom) + 1 },
                      (_, i) => Number(ChildAgeFrom) + i
                    ).map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
          </div>
        );
      })}

      <button
        type="submit"
        className="mt-4 bg-highlight text-white py-3 rounded-xl font-medium"
      >
        Procurar
      </button>
    </form>
  );
}
