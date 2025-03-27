import { _BestSellerCards, _FadeIn } from "@/app/components";

export default function BestSellers() {
  return (
    <div id="groups" className="h-screen flex justify-center my-36">
      <div className="w-2/3 h-full flex flex-col gap-10">
        <_FadeIn>
          <h1 className="font-semibold text-4xl">Best Sellers</h1>
        </_FadeIn>
        <_BestSellerCards />
      </div>
    </div>
  );
}
