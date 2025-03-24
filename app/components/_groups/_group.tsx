import Image from "next/legacy/image";
import Link from "next/link";

export default interface Group {
  destination: string;
  when: date;
  desc1: string;
  desc2: string;
  price: int;
  href: string;
  photo?: string;
}

export default function _Group({ entry }: Group) {
  return (
    <div className="hover:scale-105 hover:cursor-pointer transition-transform duration-100 min-h-96 min-w-56 flex-1 bg-background drop-shadow-lg rounded-md flex flex-col justify-around gap-5 items-center">
      <div className="flex-1 w-full relative bg-blend-color-burn">
        {" "}
        <Image
          src={entry.photo ? entry.photo : "/_group/placeholder.svg"}
          alt={"Foto destino " + entry.destination}
          layout="fill"
          priority
          objectFit="cover"
        />{" "}
      </div>
      <h1 className="flex-1 text-center text-background text-2xl font-bold absolute top-12">
        {entry.destination}
      </h1>
      <Link
        className="hover:underline flex-1 w-full flex justify-between px-2"
        href={entry.href}
      >
        <div className="w-auto pr-5">
          <p className="text-xl font-bold">{entry.when}</p>
          <p className="text-md">{entry.desc1}</p>
          <p className="text-sm italic opacity-65">{entry.desc2}</p>
        </div>
        <p className="text-2xl text-highlight font-bold">{entry.price} €</p>
      </Link>
    </div>
  );
}
