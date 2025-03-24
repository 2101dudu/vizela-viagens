"use client";

import { useState } from "react";
import _Label from "./_label";

export default function _MainInputArea() {
  const labels = ["Destinos", "Voo + Hotel", "Hotel", "Cruzeiro"];

  const [selectedLabel, setSelectedLabel] = useState(0);

  const handleLabelClick = (index: number) => {
    setSelectedLabel(index);
  };

  return (
    <div className="w-2/3">
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
      <div className="w-full h-72 bg-background"></div>
    </div>
  );
}
