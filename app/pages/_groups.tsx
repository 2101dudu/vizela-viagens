"use client";

import { _GroupCards, _Button } from "@/app/components";

const Groups: React.FC = () => {
  return (
    <div id="groups" className="h-auto flex justify-center mt-20">
      <div className="w-2/3 h-full flex flex-col gap-10">
        <h1 className="font-semibold text-4xl">Grupos a sair</h1>
        <_GroupCards />
        <div className="mx-auto">
          <_Button highlighted>Ver mais</_Button>
        </div>
      </div>
    </div>
  );
};

export default Groups;
