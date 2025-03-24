import { _BestSellerCards } from "@/app/components";

export default function BestSellers() {
  return (
    <div id="groups" className="h-screen flex justify-center my-36">
      <div className="w-2/3 h-full flex flex-col gap-10">
        <h1 className="font-semibold text-4xl">Best Sellers</h1>
        <_BestSellerCards />
      </div>
    </div>
  );
}
