import { _Button } from "@/app/components";

export default function Newsletter() {
  return (
    <div className="h-auto flex justify-center mt-20 mb-40">
      <div className="w-1/2 min-w-200 h-full flex flex-col gap-10 items-center">
        <h1 className="font-semibold text-2xl">
          Não percas destinos incríveis
        </h1>
        <h1 className="font-regular text-xl">
          Regista-te à nossa newsletter para receberes as melhores ofertas
        </h1>
        <div className="bg-background mt-10 w-9/10 h-20 rounded-sm drop-shadow-(--my-drop-shadow) flex justify-end items-center">
          <div className="size-auto m-5">
            <_Button highlighted>Button</_Button>
          </div>
        </div>
      </div>
    </div>
  );
}
