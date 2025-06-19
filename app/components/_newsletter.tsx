import { _Button, _FadeIn } from "@/app/components";
import Image from "next/image";

export default function Newsletter() {
  return (
    <div className="h-auto flex justify-center mt-20 mb-40">
      <div className="w-1/2 h-full flex flex-col gap-10 items-center">
        <_FadeIn>
          <h1 className="font-semibold text-4xl">
            Não percas destinos incríveis
          </h1>
        </_FadeIn>
        <_FadeIn delay={100}>
          <h1 className="font-regular text-2xl">
            Regista-te à nossa newsletter para receberes as melhores ofertas
          </h1>
        </_FadeIn>
        <_FadeIn
          delay={200}
          className="bg-background mt-10 w-11/12 h-20 rounded-xl drop-shadow-my flex items-center"
        >
          <Image
            className="absolute left-5"
            src="/mail.svg"
            width={24}
            height={24}
            alt={""}
          />
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Insira o seu e-mail"
            className="w-full h-full rounded-xl pl-16 pr-40 text-lg border-none bg-transparent focus:outline-none focus:ring-highlight"
            required
          />
          <div className="absolute right-5">
            <_Button highlighted>Aderir</_Button>
          </div>
        </_FadeIn>
      </div>
    </div>
  );
}
