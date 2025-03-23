import Image from "next/image";

export default function Hero() {
  return (
    <div className="h-screen flex justify-center my-20">
      <div className="w-1/2 min-w-200 h-full flex flex-col gap-10">
        <h1 className="font-semibold text-2xl">Best Sellers</h1>
        <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-15">
          <div className="col-span-1 row-span-2 relative">
            <Image
              src="/hero/placeholder.svg"
              alt="Image 1"
              layout="fill"
              objectFit="cover"
              className="rounded-t-sm"
            />
          </div>
          <div className="col-span-2 row-span-2 relative">
            <Image
              src="/hero/placeholder.svg"
              alt="Image 1"
              layout="fill"
              objectFit="cover"
              className="rounded-t-sm"
            />
          </div>
          <div className="col-span-2 row-span-1 relative">
            <Image
              src="/hero/placeholder.svg"
              alt="Image 1"
              layout="fill"
              objectFit="cover"
              className="rounded-t-sm"
            />
          </div>
          <div className="col-span-1 row-span-1 relative">
            <Image
              src="/hero/placeholder.svg"
              alt="Image 1"
              layout="fill"
              objectFit="cover"
              className="rounded-t-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
