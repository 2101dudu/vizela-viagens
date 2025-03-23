"use client";

import { useState } from "react";
import { _Label } from "@/app/components";

export default function Hero() {
  const labels = ["Label1", "Label2", "Label3", "Label4"];

  const [selectedLabel, setSelectedLabel] = useState(0);

  const handleLabelClick = (index: number) => {
    setSelectedLabel(index);
  };

  return (
    <div className="w-full flex justify-center h-40 relative -top-50  drop-shadow-xl">
      <div className="w-1/2 min-w-200 ">
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
        <div className="w-full h-60 bg-background"></div>
      </div>
    </div>
  );
}
