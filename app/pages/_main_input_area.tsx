"use client";

import { useState } from "react";
import { _Label } from "@/app/components";

export default function MainInputArea() {
  const labels = ["Destinos", "Voo + Hotel", "Hotel", "Cruzeiro"];

  const [selectedLabel, setSelectedLabel] = useState(0);

  const handleLabelClick = (index: number) => {
    setSelectedLabel(index);
  };

  return (
    <div className="w-full flex justify-center h-40 relative -top-96 drop-shadow-(--my-drop-shadow)">
      <div className="w-2/3 min-w-200 ">
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
        <div className="w-full h-70 bg-background"></div>
      </div>
    </div>
  );
}
