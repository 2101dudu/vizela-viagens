import _BestSeller, { BestSeller } from "./_best_seller";
import { _FadeIn } from "@/app/components/";

export default function _BestSellerCards() {
  const bestSellers: BestSeller[] = [
    {
      destination: "Estados Unidos",
      photo: "/_best_sellers/statue.jpg",
      price: 999,
      grid: "col-span-1 row-span-2",
      href: "",
    },
    {
      destination: "Grécia",
      photo: "/_best_sellers/greece.jpg",
      price: 1199,
      grid: "col-span-2 row-span-2",
      href: "",
    },
    {
      destination: "Suíça",
      photo: "/_best_sellers/snow.jpg",
      price: 789,
      grid: "col-span-2 row-span-1",
      href: "",
    },
    {
      destination: "Japão",
      photo: "/_best_sellers/temple.jpg",
      price: 819,
      grid: "col-span-1 row-span-1",
      href: "",
    },
  ];

  return (
    <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-16">
      {bestSellers.map((element, index) => (
        <_FadeIn key={index} delay={(index % 2) * 100} className={element.grid}>
          <_BestSeller bestSeller={element} key={index} />
        </_FadeIn>
      ))}
    </div>
  );
}
