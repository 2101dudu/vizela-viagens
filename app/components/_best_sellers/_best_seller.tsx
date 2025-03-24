import Image from "next/legacy/image";
import Link from "next/link";

export interface BestSeller {
  destination: string;
  photo?: string;
  price: number;
  grid: string;
  href: string;
}

export default function _BestSeller({
  bestSeller,
}: {
  bestSeller: BestSeller;
}) {
  return (
    <div
      className={`hover:scale-105 hover:cursor-pointer transition-transform duration-100 relative drop-shadow-2xl ${bestSeller.grid}`}
    >
      <Image
        src={
          bestSeller.photo ? bestSeller.photo : "/_best_sellers/placeholder.svg"
        }
        alt={"Foto de " + bestSeller.destination}
        layout="fill"
        className="rounded-md object-cover"
      />
      <Link
        className="hover:underline h-auto w-full flex justify-between px-2"
        href={bestSeller.href}
      >
        <h1 className="absolute top-4 left-4 text-2xl font-bold text-background">
          {bestSeller.destination}
        </h1>
        <div className="absolute bottom-0 right-0">
          <div className="bg-background opacity-80 rounded-tl-md flex flex-col gap-2 items-right p-3">
            <h1 className="text-xl font-semibold text-foreground">
              Apenas por
            </h1>
            <h1 className="text-right text-4xl font-bold text-highlight">
              {bestSeller.price} €
            </h1>
          </div>
        </div>
      </Link>
    </div>
  );
}
