"use client";

import { _GroupCards, _Button, _FadeIn } from "@/app/components";

const Groups: React.FC = () => {
  return (
    <div id="groups" className="h-auto flex justify-center mt-20">
      <div className="w-4/5 h-full flex flex-col gap-10">
        <_FadeIn delay={100}>
          <h1 className="font-semibold text-4xl">Grupos a sair</h1>
        </_FadeIn>
        <h1>Por Implementar</h1>
      </div>
    </div>
  );
};

export default Groups;
