"use client";

import BestSellerCard from "./_best_seller_card";
import { _FadeIn } from "@/app/components/";
import { useEffect, useState, useRef } from "react";
import SearchProducts from "@/app/hooks/_search_products";

interface Product {
}

interface PaginatedResponse {
  token: string;
  products: Product[];
  hasMore: boolean;
}

export default function _BestSellerCards({ tag }: { tag: string }) {
  const elements = [
    { className: "col-span-2 row-span-2" }, // element 1
    { className: "col-span-1 row-span-1" }, // element 2
    { className: "col-span-1 row-span-1" }, // element 3
    { className: "col-span-1 row-span-1" }, // element 4
    { className: "col-span-1 row-span-1" }, // element 5
  ];


  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const body: any = {};
        body.Length = "5";
        body.Tag = tag;

        const data: PaginatedResponse = await SearchProducts(body);

        setProducts(data.products);
      } catch (err) {
        setError("Erro ao buscar resultados.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  return (
    <div className="w-full h-auto grid grid-cols-4 grid-rows-2 gap-10">
      {products.map((element, index) => (
        <_FadeIn key={index} delay={(index % 2) * 100} className={elements[index].className}>
          <BestSellerCard product={element} isMain={index === 0} />
        </_FadeIn>
      ))}
    </div>
  );
}
