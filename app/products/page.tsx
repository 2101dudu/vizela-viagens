"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import _Product from "./_product";
import LoadingDots from "@/app/components/animations/loading_dots";
import { _FadeIn } from "@/app/components/";
import SearchProducts from "@/app/hooks/_search_products";
import FetchMoreProducts from "@/app/hooks/_search_more_products";


interface Product {
}

interface PaginatedResponse {
  token: string;
  products: Product[];
  hasMore: boolean;
}

export default function ResultsPage() {
  const params = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [cursor, setCursor] = useState<number>(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const prefetchedRef = useRef<{ products: Product[]; hasMore: boolean } | null>(null);

  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const body: any = {};
        const depDate = params.get("from");
        const country = params.get("country");
        const location = params.get("location");

        if (depDate) body.DepDate = depDate;
        if (country) body.Country = country;
        if (location) body.Location = location;

        const data: PaginatedResponse = await SearchProducts(body);

        setProducts(data.products);
        setToken(data.token);
        setCursor(data.products?.length);
        setHasMore(data.hasMore ?? true);
        prefetchedRef.current = null;
      } catch (err) {
        setError("Erro ao buscar resultados.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [params]);

  const prefetchMore = async () => {
    if (!token || !hasMore || loadingMore || prefetchedRef.current) return;
    try {
      const moreProducts = await FetchMoreProducts(token, cursor);
      prefetchedRef.current = moreProducts; // cache the prefetched results
    } catch (err) {
      console.error("Erro ao pré-carregar mais produtos:", err);
    }
  };

  const handleSeeMore = async () => {
    if (!token || !hasMore) return;

    const prefetched = prefetchedRef.current;

    if (prefetched) {
      setProducts((prev) => [...prev, ...prefetched.products]);
      setCursor((prev) => prev + prefetched.products.length);
      setHasMore(prefetched.hasMore);
      prefetchedRef.current = null;
    } else {
      setLoadingMore(true);
      try {
        const moreProductsData = await FetchMoreProducts(token, cursor);
        setProducts((prev) => [...prev, ...moreProductsData.products]);
        setCursor((prev) => prev + moreProductsData.products.length);
        setHasMore(moreProductsData.hasMore);
      } catch (err) {
        console.error("Error fetching more products:", err);
      } finally {
        setLoadingMore(false);
      }
    }
  };



  return (
    <div className="w-full bg-background text-foreground flex flex-col items-center">
      <div className="w-2/3 p-6 min-h-screen">
        {error && <p className="text-center mt-20 text-2xl font-bold text-red-500">{error}</p>}

        {loading ? (
          <LoadingDots/>
        ) : products === null ? (
          <div className="text-center mt-20 text-2xl font-bold">Nenhum resultado encontrado.</div>
        ) : <h1 className="text-2xl font-bold mb-4">Viagens</h1>}
        <div className="w-full flex flex-wrap gap-2 justify-between">
          {products?.map((product, i) => (
            <div key={i} className="w-[30%] min-w-[200px]">
              <_FadeIn key={i} delay={(i % 2) * 100}>
                <_Product product={product} />
              </_FadeIn>
            </div>
          ))}
        </div>

        {token && hasMore && (
          <div className="w-full text-center mt-6">
            <button
              onClick={handleSeeMore}
              onMouseEnter={prefetchMore}
              disabled={loadingMore}
              className="px-6 py-2 rounded bg-foreground text-background hover:opacity-80 transition disabled:opacity-50"
            >
              {loadingMore ? "A carregar..." : "Ver mais"}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
