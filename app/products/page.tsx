"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import _Product from "./_product";
import LoadingDots from "@/app/components/animations/loading_dots";
import {_FadeIn} from "@/app/components/";

interface Product {
}

interface ProductArray {
  item: Product[];
}

interface ResponseData {
  TotalProducts: string; // actually a string in your response
  ProductArray: ProductArray;
}


export default function ResultsPage() {
  const params = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<ResponseData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const body = {
          DepDate: params.get("from") || undefined,
          Country: params.get("country") || undefined,
          Location: params.get("location") || undefined,
        };

        console.log("Request Body:", body);

        const res = await fetch("http://localhost:8080/api/search/product", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          throw new Error("Erro na resposta da API");
        }

        const data = await res.json();
        console.log("API Response:", data);
        setProducts(data);
      } catch (err) {
        setError("Erro ao buscar resultados.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [params]);

  return (
    <div className="w-full bg-background text-foreground flex flex-col items-center">
      <div className="w-2/3 p-6 min-h-screen">
        {error && <p className="text-center mt-20 text-2xl font-bold text-red-500">{error}</p>}

        {loading ? (
          <LoadingDots/>
        ) : products?.TotalProducts === "0" ? (
          <div className="text-center mt-20 text-2xl font-bold">Nenhum resultado encontrado.</div>
        ) : <h1 className="text-2xl font-bold mb-4">Viagens</h1>}
        <div className="w-full flex flex-wrap gap-2 justify-between">
          {products?.ProductArray?.item?.map((product, i) => (
            <div key={i} className="w-[30%] min-w-[200px]">
              <_FadeIn key={i} delay={(i % 2) * 100}>
                <_Product product={product} />
              </_FadeIn>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
