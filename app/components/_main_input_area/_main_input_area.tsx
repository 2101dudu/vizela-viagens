"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useState } from "react";
import _Label from "./_label";
import CountryDropdown from "./_country_dropdown";
import LocationDropdown from "./_location_dropdown";
import Calendar from "./_date_picker";
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

  const isButtonDisabled = !fromDate && !selectedCountry && !selectedLocation;
    
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter" && !isButtonDisabled) {
        event.preventDefault(); // prevent form submission or other default
        handleSearch();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [fromDate, selectedCountry, selectedLocation]);



  const inputConfigs: InputConfig[] = [
    {
      label: "Destinos",
      layout: "grid grid-cols-9 gap-4",
      fields: [
        {
          component: CountryDropdown,
          props: () => ({
            className: "col-span-3",
            countries: travelData?.countries || [],
            selectedCountry,
            onSelect: setSelectedCountry,
          }),
        },
        {
          component: LocationDropdown,
          props: () => ({
            className: "col-span-3",
            locations: travelData?.locations || [],
            selectedLocation,
            selectedCountry,
            onSelect: setSelectedLocation,
          }),
        },
        {
          component: Calendar,
          props: {
            label: "Data de Partida",
            className: "col-span-3",
            value: fromDate,
            onChange: setFromDate
          },
        },
      ],
    },
  ];

  const handleSearch = () => {
    const query = new URLSearchParams();

    if (fromDate) query.set("from", fromDate);
    if (selectedCountry) query.set("country", selectedCountry);
    if (selectedLocation) query.set("location", selectedLocation);

    router.push(`/products?${query.toString()}`);
  };

  const labels = inputConfigs.map((config) => config.label);

  const handleLabelClick = (index: number) => {
    setSelectedLabel(index);
  };
  
  const currentConfig = inputConfigs[selectedLabel];

  return (
    <div className="w-4/5 h-auto drop-shadow-my">
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
        <div className="mt-10 w-full flex justify-end">
          <_Button highlighted onClick={handleSearch} disabled={isButtonDisabled}>
            Pesquisar
          </_Button>
        </div>
      </div>
    </div>
  );
}
