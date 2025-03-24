import Image from "next/legacy/image";

export default interface ReviewEntry {
  name: string;
  review: string;
  photo?: string;
}

interface Review {
  entry: ReviewEntry;
  shifted: boolean;
}

export default function _Review({ entry, shifted }: Review) {
  return (
    <div
      className={`col-span-2 max-h-40 h-auto p-5 bg-background drop-shadow-lg rounded-md flex justify-around gap-5 items-center" ${
        shifted ? "col-start-2" : "col-start-1"
      }`}
    >
      <div className="flex flex-col items-center justify-around gap-2">
        <div className="size-12 relative">
          <Image
            className="rounded-full"
            src={entry.photo ? entry.photo : "/_review/placeholder.svg"}
            alt={"Foto perfil " + entry.name}
            layout="fill"
            priority
          />
        </div>
        <h1 className="text-center text-highlight font-bold">{entry.name}</h1>
      </div>
      <p className="w-4/5">{entry.review}</p>
    </div>
  );
}
