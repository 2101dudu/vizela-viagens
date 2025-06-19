"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

interface Product {
  Code: string;
  ProdCode: string;
  Name: string;
  // add the other fields as needed
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
      const from = params.get("from");
      if (!from) {
        setError("Data de partida é obrigatória.");
        return;
      }

      setLoading(true);
      try {
        const body = {
          DepDate: from,
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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Resultados</h1>

      {error && <p className="text-red-500">{error}</p>}

      {loading ? (
        <p>A carregar...</p>
      ) : products?.ProductArray?.item?.length === 0 ? (
        <p>Nenhum resultado encontrado.</p>
      ) : (
        <p>{products?.TotalProducts} produtos encontrados.</p>
      )}
      <ul className="space-y-4">
        {products?.ProductArray?.item?.map((product, i) => (
          <li key={i} className="bg-white p-4 shadow rounded">
            <pre>{JSON.stringify(product, null, 2)}</pre>
          </li>
        ))}
      </ul>
    </div>
  );
}
