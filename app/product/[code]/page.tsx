"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import BookingForm, { ApiData } from "./_booking_form";

export default function ProductPage() {
  const params = useParams();
  const code = params.code; // code from URL

  const [product, setProduct] = useState<ApiData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) return;

    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:8080/api/get/product/${code}`);
        if (!res.ok) throw new Error("Failed to fetch product");

        const data = await res.json();
        setProduct(data);
      } catch (err) {
        setError("Erro ao carregar produto.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [code]);

  if (loading) return <p>Loading product...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!product) return <p>No product found.</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <BookingForm data={product} />
    </div>
  );
}
