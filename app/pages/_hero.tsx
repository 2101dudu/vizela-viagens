import Image from "next/image";

export default function Hero() {
  return (
    <div className="h-screen flex items-start pt-20 -mb-50">
      <div className="w-full h-2/3 relative">
        <Image
          src="/hero/placeholder.svg"
          alt="Background image"
          fill
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
}
