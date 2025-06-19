"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import _Label from "./_label";
import CountryDropdown from "./_country_dropdown";
import LocationDropdown from "./_location_dropdown";
import DatePicker from "./_date_picker";
import NumberInput from "./_number_input";
import { useMasterData } from "@/app/hooks/_master_data"
import { _Button } from "@/app/components";

interface InputFieldConfig {
  component: React.FC<any>;
  props: any;
}

interface InputConfig {
  label: string;
  layout: string;
  fields: InputFieldConfig[];
}

export default function _MainInputArea() {
  const router = useRouter();

  const travelData = useMasterData();
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedLabel, setSelectedLabel] = useState(0);
  const [fromDate, setFromDate] = useState("");
  const [error, setError] = useState<string | null>(null);


  if (!travelData) {
    return <div>Loading...</div>;
  }

  const inputConfigs: InputConfig[] = [
    {
      label: "Destinos",
      layout: "grid grid-cols-9 gap-4",
      fields: [
        {
          component: CountryDropdown,
          props: () => ({
            className: "col-span-3",
            countries: travelData.countries,
            selectedCountry,
            onSelect: setSelectedCountry,
          }),
        },
        {
          component: LocationDropdown,
          props: () => ({
            className: "col-span-3",
            locations: travelData.locations,
            selectedLocation,
            selectedCountry,
            onSelect: setSelectedLocation,
          }),
        },
        {
          component: DatePicker,
          props: {
            label: "Data de partida",
            className: "col-span-3",
            value: fromDate,
            onChange: setFromDate
          },
        },
      ],
    },
    {
      label: "Voo + Hotel",
      layout: "grid grid-cols-2 gap-4",
      fields: [
        {
          component: CountryDropdown,
          props: () => ({
            className: "col-span-full",
            countries: travelData.countries,
            selectedCountry,
            onSelect: setSelectedCountry,
          }),
        },
        {
          component: DatePicker,
          props: { label: "Data de partida", className: "col-span-1" },
        },
        {
          component: DatePicker,
          props: { label: "Data de chegada", className: "col-span-1" },
        },
      ],
    },
    {
      label: "Hotel",
      layout: "grid grid-cols-8 gap-4",
      fields: [
        {
          component: CountryDropdown,
          props: () => ({
            className: "col-span-4",
            countries: travelData.countries,
            selectedCountry,
            onSelect: setSelectedCountry,
          }),
        },
        {
          component: NumberInput,
          props: { label: "Número de adultos", className: "col-span-2" },
        },
        {
          component: NumberInput,
          props: { label: "Número de crianças", className: "col-span-2" },
        },
        {
          component: DatePicker,
          props: { label: "Data de partida", className: "col-span-4" },
        },
        {
          component: DatePicker,
          props: { label: "Data de chegada", className: "col-span-4" },
        },
      ],
    },
    {
      label: "Cruzeiro",
      layout: "grid grid-cols-2 gap-4",
      fields: [
        {
          component: CountryDropdown,
          props: () => ({
            className: "col-span-full",
            countries: travelData.countries,
            selectedCountry,
            onSelect: setSelectedCountry,
          }),
        },
        {
          component: NumberInput,
          props: { label: "Número de adultos", className: "col-span-1" },
        },
        {
          component: NumberInput,
          props: { label: "Número de crianças", className: "col-span-1" },
        },
        {
          component: DatePicker,
          props: { label: "Data de partida", className: "col-span-full" },
        },
        {
          component: DatePicker,
          props: { label: "Data de chegada", className: "col-span-full" },
        },
      ],
    },
  ];

  const handleSearch = () => {
    if (!fromDate) {
      setError("A data de partida é obrigatória.");
      return;
    }

    const query = new URLSearchParams();

    query.set("from", fromDate);

    if (selectedCountry) query.set("country", selectedCountry);
    if (selectedLocation) query.set("location", selectedLocation);

    router.push(`/results?${query.toString()}`);
  };

  const labels = inputConfigs.map((config) => config.label);

  const handleLabelClick = (index: number) => {
    setSelectedLabel(index);
  };
  
  const currentConfig = inputConfigs[selectedLabel];


  return (
    <div className="w-2/3 h-auto drop-shadow-my">
      <div className="flex gap-2">
        {labels.map((element, index) => (
          <_Label
            key={index}
            selected={selectedLabel === index}
            onClick={() => handleLabelClick(index)}
          >
            {element}
          </_Label>
        ))}
      </div>
      <div
        className="relative w-11/12 rounded-b-md rounded-tr-md p-4"
        style={{ backgroundColor: "rgba(255, 255, 255, 0.92)" }}
      >
        <div className={`${currentConfig.layout}`}>
          {currentConfig.fields.map((field, idx) => {
              const FieldComponent = field.component;
              const fieldProps = typeof field.props === "function" ? field.props() : field.props;
              return <FieldComponent key={idx} {...fieldProps} />;
          })}
        </div>
        <div className="mt-10 w-full flex justify-between">
          <p><b className="text-red-500">*</b> Campos obrigatórios</p>
          <_Button highlighted onClick={handleSearch}>
            Pesquisar
          </_Button>
        </div>
      </div>
    </div>
  );
}
