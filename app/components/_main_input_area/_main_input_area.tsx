"use client";

import { useState } from "react";
import _Label from "./_label";
import DestinationDropdown from "./_destination_dropdown";
import DatePicker from "./_date_picker";
import NumberInput from "./_number_input";

interface InputFieldConfig {
  component: React.FC<any>;
  props: any;
}

interface InputConfig {
  label: string;
  layout: string;
  fields: InputFieldConfig[];
}

const inputConfigs: InputConfig[] = [
  {
    label: "Destinos",
    layout: "grid grid-cols-8 gap-4",
    fields: [
      {
        component: DestinationDropdown,
        props: { className: "col-span-4" },
      },
      {
        component: DatePicker,
        props: { label: "Data de partida", className: "col-span-2" },
      },
      {
        component: DatePicker,
        props: { label: "Data de chegada", className: "col-span-2" },
      },
    ],
  },
  {
    label: "Voo + Hotel",
    layout: "grid grid-cols-2 gap-4",
    fields: [
      {
        component: DestinationDropdown,
        props: { className: "col-span-full" },
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
        component: DestinationDropdown,
        props: { className: "col-span-4" },
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
        component: DestinationDropdown,
        props: { className: "col-span-full" },
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

export default function _MainInputArea() {
  const labels = inputConfigs.map((config) => config.label);
  const [selectedLabel, setSelectedLabel] = useState(0);

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
        className={`bg-background w-11/12 rounded-b-md rounded-tr-md p-4 ${
          currentConfig.layout
        }`}
      >
        {currentConfig.fields.map((field, idx) => {
          const FieldComponent = field.component;
          return <FieldComponent key={idx} {...field.props} />;
        })}
      </div>
    </div>
  );
}
