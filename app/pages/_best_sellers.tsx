import Image from "next/image";

export default function BestSellers() {
  return (
    <div id="groups" className="h-screen flex justify-center my-36">
      <div className="w-2/3 h-full flex flex-col gap-10">
        <h1 className="font-semibold text-4xl">Best Sellers</h1>
        <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-16">
          <div className="col-span-1 row-span-2 relative">
            <Image
              src="/_best_sellers/statue.jpg"
              alt="Estátua da Liberdade"
              fill
              className="rounded-t-sm object-cover"
            />
          </div>
          <div className="col-span-2 row-span-2 relative">
            <Image
              src="/_best_sellers/greece.jpg"
              alt="Grécia"
              fill
              className="rounded-t-sm object-cover"
            />
          </div>
          <div className="col-span-2 row-span-1 relative">
            <Image
              src="/_best_sellers/snow.jpg"
              alt="Neve"
              fill
              className="rounded-t-sm object-cover"
            />
          </div>
          <div className="col-span-1 row-span-1 relative">
            <Image
              src="/_best_sellers/temple.jpg"
              alt="Templo asiático"
              fill
              className="rounded-t-sm object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
