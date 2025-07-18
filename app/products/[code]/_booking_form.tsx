"use client";

import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt } from "react-icons/fa";
import { parseISO } from "date-fns";
import { useParams, useRouter } from "next/navigation";
import FetchProductID, {SearchProducts} from "@/app/hooks/_fetch_product_services_id";

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
  Code: string;
  Name: string
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
  const router = useRouter();
  const params = useParams();
  const code = params.code; // code from URL

  // flatten
  const locales = data.DepartureLocals.item;
  const dates = Array.isArray(data.DepartureDates.item) && data.DepartureDates.item.length > 0
    ? data.DepartureDates.item.map((d) => d.Date)
    : [];
  const roomTypes = data.RoomTypes.item;
  const baseLocalsId = data.BaseLocals.item[0].Code;
  const { MinNights, MaxNights } = data.BaseLocals.item[0];

  // form state
  const [selectedDate, setSelectedDate] = useState(dates.length > 0 ? dates[0] : "");
  const [selectedLocale, setSelectedLocale] = useState(locales.length > 0 ? locales[0].Code : "");
  // Track nights for each base local
  const [selectedNights, setSelectedNights] = useState<(number | "")[]>(
    data.BaseLocals.item.map((local) => Number(local.MinNights))
  );
  const [numRooms, setNumRooms] = useState<number>(1);

  const allowedDatesSet = new Set(dates);

  // one entry per room
  const [rooms, setRooms] = useState<
    {
      roomTypeCode: string;
      childAges: (number | "")[];
    }[]
  >(
    Array.from({ length: 1 }).map(() => {
      const defaultRoomType = roomTypes.length > 0 ? roomTypes[0] : null;
      return {
        roomTypeCode: defaultRoomType ? defaultRoomType.Code : "",
        childAges: defaultRoomType 
          ? Array.from({ length: Number(defaultRoomType.NumChilds) }).map(() => 
              defaultRoomType.ChildAgeFrom ? Number(defaultRoomType.ChildAgeFrom) : ""
            )
          : [],
      };
    })
  );

  // when numRooms changes, resize rooms array
  const handleNumRoomsChange = (n: number) => {
    setNumRooms(n);
    setRooms((prev) => {
      const next = prev.slice(0, n);
      while (next.length < n) {
        const defaultRoomType = roomTypes.length > 0 ? roomTypes[0] : null;
        next.push({
          roomTypeCode: defaultRoomType ? defaultRoomType.Code : "",
          childAges: defaultRoomType 
            ? Array.from({ length: Number(defaultRoomType.NumChilds) }).map(() => 
                defaultRoomType.ChildAgeFrom ? Number(defaultRoomType.ChildAgeFrom) : ""
              )
            : [],
        });
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
              childAges: Array.from({ length: Number(rt.NumChilds) }).map(() => 
                rt.ChildAgeFrom ? Number(rt.ChildAgeFrom) : ""
              ),
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

  // handle nights change for a specific local
  const handleNightsChange = (idx: number, value: number) => {
    setSelectedNights((prev) => prev.map((n, i) => (i === idx ? value : n)));
  };

  // handle form submission
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission

    const payload: SearchProducts = {
      productCode: data.Code,
      departureDate: selectedDate,
      departureLocal: selectedLocale,
      roomTypes: {
        item: rooms.map((room, idx) => {
          const childAges = room.childAges
            .filter((age) => age !== "")
            .map(String)
            .join(",");

          return {
            roomNum: String(idx + 1),
            code: room.roomTypeCode,
            childAges: childAges || undefined,
          };
        }),
      },
      baseLocals: {
        item: data.BaseLocals.item.map((local, idx) => ({
          code: local.Code,
          nights: selectedNights[idx] ? String(selectedNights[idx]) : String(local.MinNights),
        })),
      },
    };


    try {
      const ID: string = await FetchProductID(payload);
      router.push(`/products/${code}/${ID}/available-services`);
    } catch (error) {
      console.error('Error fetching product ID:', error);
    }
  };

  return (
    <form className="flex flex-col space-y-4 px-4 max-w-md" onSubmit={handleSearch}>
        <h1 className="text-2xl font-bold mb-4">Reservar {data.Name}</h1>
      {/* Date dropdown */}
        <div className="flex flex-col">
            <label className="mb-1 font-medium">Data de Partida</label>
            <div className="relative w-full">
                <DatePicker
                selected={selectedDate ? parseISO(selectedDate) : dates.pop() ? parseISO(dates[0]) : null}
                onChange={(date: Date | null) => {
                    if (date) {
                      const { format } = require("date-fns");
                      const iso = format(date, "yyyy-MM-dd");
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
          <option value="" disabled>Selecione um local</option>
          {locales.map((loc) => (
            <option key={loc.Code} value={loc.Code}>
              {loc.Name}
            </option>
          ))}
        </select>
      </div>

      {/* Number of nights for each base local */}
      {data.BaseLocals.item.map((local, idx) => (
        <div className="flex flex-col" key={local.Code}>
          <label className="mb-1 font-medium">
            Noites em Alojamento {data.BaseLocals.item.length > 1 ? local.Name : ""}
          </label>
          <select
            value={selectedNights[idx]}
            onChange={(e) => handleNightsChange(idx, +e.target.value)}
            className="h-12 rounded-xl pl-4 pr-2 text-lg border-2 border-zinc-200 bg-softBackground focus:outline-none focus:ring-highlight"
          >
            <option value="" disabled>Selecione as noites</option>
            {Array.from(
              { length: Number(local.MaxNights) - Number(local.MinNights) + 1 },
              (_, i) => Number(local.MinNights) + i
            ).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      ))}

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
                <option value="" disabled>Selecione a tipologia</option>
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
                    <option value="" disabled>Selecione a idade</option>
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
