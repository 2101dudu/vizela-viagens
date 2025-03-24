import Image from "next/image";

export default function Hero() {
  return (
    <div className="h-screen flex items-start pt-20 mb-50">
      <div className="w-full h-screen relative">
        <Image
          src="/_hero/background.jpg"
          alt="Imagem de fundo"
          fill
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
}
