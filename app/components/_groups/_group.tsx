import Image from "next/legacy/image";
import Link from "next/link";

interface GroupDepartures {
  when: string;
  desc1: string;
  desc2: string;
  price: number;
  href: string;
}

export interface Group {
  destination: string;
  photo?: string;
  departures: GroupDepartures[];
}

export default function _Group({ group }: { group: Group }) {
  return (
    <div className="hover:scale-105 hover:cursor-pointer transition-transform duration-100 h-auto min-w-56 flex-1">
      <div className="h-1/3 w-full relative rounded-lg">
        <Image
          src={group.photo ? group.photo : "/_group/placeholder.svg"}
          alt={"Foto destino " + group.destination}
          layout="fill"
          priority
          style={{ borderTopLeftRadius: "8px", borderTopRightRadius: "8px" }}
          objectFit="cover"
        />
        <h1 className="w-full h-full flex items-center justify-center text-background text-2xl font-bold absolute">
          {group.destination}
        </h1>
      </div>
      <div className="py-4 flex flex-col gap-2 bg-background drop-shadow-lg rounded-lg">
        {group.departures.map((departure, index) => (
          <Link
            key={index}
            className="hover:underline h-auto w-full flex justify-between px-2"
            href={departure.href}
          >
            <div className="w-auto pr-5">
              <p className="text-xl font-bold">{departure.when}</p>
              <p className="text-md">{departure.desc1}</p>
              <p className="text-sm italic opacity-65">{departure.desc2}</p>
            </div>
            <p className="text-2xl text-highlight font-bold">
              {departure.price} €
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
