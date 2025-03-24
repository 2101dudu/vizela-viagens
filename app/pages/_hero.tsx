import Image from "next/image";

import { _MainInputArea } from "@/app/components/";

export default function Hero() {
  return (
    <div id="home" className="h-screen flex items-start pt-20 mb-52">
      <div className="w-full h-screen relative">
        <Image
          src="/_hero/background.jpg"
          alt="Imagem de fundo"
          fill
          className="objectcover"
          priority
        />
        <div className="w-full relatibe top-1/3 flex justify-center h-40 relative drop-shadow-my">
          <_MainInputArea />
        </div>
      </div>
    </div>
  );
}
