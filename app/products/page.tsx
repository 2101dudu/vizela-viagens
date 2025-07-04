"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {_Product} from "@/app/components/";
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
  const depDate = params.get("from");
  const country = params.get("country");
  const location = params.get("location");
  const tag = params.get("tag");

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [cursor, setCursor] = useState<number>(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const prefetchedRef = useRef<{ products: Product[]; hasMore: boolean } | null>(null);

  const [error, setError] = useState<string | null>(null);

  // Dropdown state
  const [sortBy, setSortBy] = useState<string>("relevance");
  const [sortOrder, setSortOrder] = useState<string>("asc");

  // New filter states
  const [priceFrom, setPriceFrom] = useState<string>("");
  const [priceTo, setPriceTo] = useState<string>("");
  const [numDays, setNumDays] = useState<string>("");


  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const body: any = {};

        if (depDate) body.DepDate = depDate;
        if (country) body.Country = country;
        if (location) body.Location = location;
        if (tag) body.Tag = tag;

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

  // Prefetched sorted data
  const prefetchedSortRef = useRef<PaginatedResponse | null>(null);
  const [sortPrefetching, setSortPrefetching] = useState(false);

  // Prefetch sorted data on hover
  const handleSortPrefetch = async () => {
    if (sortPrefetching || prefetchedSortRef.current) return;
    try {
      const body: any = {};

      if (depDate) body.DepDate = depDate;
      if (country) body.Country = country;
      if (location) body.Location = location;
      if (tag) body.Tag = tag;
      body.SortBy = sortBy;
      body.SortOrder = sortOrder;
      if (priceFrom) body.PriceFrom = priceFrom;
      if (priceTo) body.PriceTo = priceTo;
      if (numDays) body.NumDays = numDays;
      const data: PaginatedResponse = await SearchProducts(body);
      prefetchedSortRef.current = data;
    } catch (err) {
      console.log("Erro ao pré-carregar dados ordenados:", err);
    } 
  };

  // Show prefetched data on click, fallback to API call if not prefetched
  const handleSortShow = async () => {
    const prefetched = prefetchedSortRef.current;

    if (prefetched) {
      setProducts(prefetched.products);
      setToken(prefetched.token);
      setCursor(prefetched.products?.length);
      setHasMore(prefetched.hasMore ?? true);
      prefetchedSortRef.current = null;
    } else {
      setSortPrefetching(true);
      try {
        const body: any = {};

        if (depDate) body.DepDate = depDate;
        if (country) body.Country = country;
        if (location) body.Location = location;
        if (tag) body.Tag = tag;
        body.SortBy = sortBy;
        body.SortOrder = sortOrder;
        if (priceFrom) body.PriceFrom = priceFrom;
        if (priceTo) body.PriceTo = priceTo;
        if (numDays) body.NumDays = numDays;
        const data: PaginatedResponse = await SearchProducts(body);
        setProducts(data.products);
        setToken(data.token);
        setCursor(data.products?.length);
        setHasMore(data.hasMore ?? true);
      } catch (err) {
        setError("Erro ao buscar resultados.");
        console.error(err);
      } finally {
        setSortPrefetching(false);
      }
    }
  };

  // Invalidate prefetched sort data when sort/filter changes
  useEffect(() => {
    prefetchedSortRef.current = null;
  }, [sortBy, sortOrder, priceFrom, priceTo, numDays, params]);

  // Invalidate prefetched 'see more' data when filters change
  useEffect(() => {
    prefetchedRef.current = null;
  }, [params]);

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
          {/* Sort/filter controls */}
          <div className="flex flex-col gap-2 w-1/5 min-w-[180px] mr-4">
            <label className="font-semibold">Ordenar por</label>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="border rounded p-1">
              <option value="relevance">Relevância</option>
              <option value="price">Preço</option>
              <option value="name">Nome</option>
            </select>
            <label className="font-semibold">Ordem</label>
            <select value={sortOrder} onChange={e => setSortOrder(e.target.value)} className="border rounded p-1">
              <option value="asc">Ascendente</option>
              <option value="desc">Descendente</option>
            </select>
            {/* New filter inputs */}
            <label className="font-semibold mt-2">Preço De</label>
            <input
              type="number"
              value={priceFrom}
              onChange={e => {
              const val = Number(e.target.value);
              setPriceFrom(val < 0 ? "0" : e.target.value);
              }}
              className="border rounded p-1"
              placeholder="Mínimo"
              min="0"
            />
            <label className="font-semibold">Preço Até</label>
            <input
              type="number"
              value={priceTo}
              onChange={e => {
              const val = Number(e.target.value);
              setPriceTo(val < 0 ? "0" : e.target.value);
              }}
              className="border rounded p-1"
              placeholder="Máximo"
              min="0"
            />
            <label className="font-semibold">Nº de Dias</label>
            <input
              type="number"
              value={numDays}
              onChange={e => {
              const val = Number(e.target.value);
              setNumDays(val < 0 ? "0" : e.target.value);
              }}
              className="border rounded p-1"
              placeholder="Ex: 7"
              min="0"
            />
            <button
              onMouseEnter={handleSortPrefetch}
              onClick={handleSortShow}
              disabled={sortPrefetching}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
            >
              {sortPrefetching ? "A carregar..." : "Ordenar"}
            </button>
          </div>
          {/* Product listings */}
          <div className="flex-1 flex flex-wrap gap-2 justify-between">
            {products?.map((product, i) => (
              <div key={i} className="w-[30%] min-w-[200px]">
                <_FadeIn key={i} delay={(i % 2) * 100}>
                  <_Product product={product} />
                </_FadeIn>
              </div>
            ))}

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

      </div>
    </div>
  );
}
