"use client";

import { _Carousel, _Button } from "@/app/components";

export default function Cruises() {
  return (
    <div id="groups" className="h-screen flex justify-center my-20">
      <div className="w-1/2 min-w-200 h-full flex flex-col gap-10">
        <h1 className="font-semibold text-2xl">Cruzeiros</h1>
        <_Carousel>
          <_Button highlighted href="/page1">
            {" "}
            Page 1{" "}
          </_Button>
          <_Button highlighted href="/page2" imageSrc="/icons/icon2.svg" />
          <_Button highlighted href="/page3">
            {" "}
            Page 3{" "}
          </_Button>
        </_Carousel>
      </div>
    </div>
  );
}
