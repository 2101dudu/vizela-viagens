import { _Button } from "@/app/components";

export default function Newsletter() {
  return (
    <div className="h-auto flex justify-center mt-20 mb-40">
      <div className="w-1/2 h-full flex flex-col gap-10 items-center">
        <h1 className="font-semibold text-4xl">
          Não percas destinos incríveis
        </h1>
        <h1 className="font-regular text-2xl">
          Regista-te à nossa newsletter para receberes as melhores ofertas
        </h1>
        <div className="bg-background mt-10 w-11/12 h-20 rounded-md drop-shadow-my flex justify-end items-center">
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Insira o seu e-mail"
            className="w-full h-full rounded-l-md px-4 text-lg border-none bg-transparent"
            required
          />
          {/* Submit Button */}
          <div className="m-5">
            <_Button highlighted>Aderir</_Button>
          </div>
        </div>
      </div>
    </div>
  );
}
