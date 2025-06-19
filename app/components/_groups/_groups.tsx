"use client";

import { _GroupCards, _Button, _FadeIn } from "@/app/components";

const Groups: React.FC = () => {
  return (
    <div id="groups" className="h-auto flex justify-center mt-20">
      <div className="w-2/3 h-full flex flex-col gap-10">
        <_FadeIn delay={100}>
          <h1 className="font-semibold text-4xl">Grupos a sair</h1>
        </_FadeIn>
        <_GroupCards />
        <div className="mx-auto">
          <_FadeIn delay={100}>
            <_Button highlighted>Ver mais</_Button>
          </_FadeIn>
        </div>
      </div>
    </div>
  );
};

export default Groups;
