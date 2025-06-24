"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Product {
  Code: string;
  Name: string;
  Localization: string;
  Country: string;
  Zone: string;
  MinPaxReserve: string;
  MaxPaxReserve: string;
  // Add other fields you want to show
}

export default function ProductPage() {
  const params = useParams();
  const code = params.code; // code from URL

  const [product, setProduct] = useState<Product | null>(null);
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
      <h1 className="text-3xl font-bold mb-4">{product.Name}</h1>
      <p><strong>Code:</strong> {product.Code}</p>
      <p><strong>Localization:</strong> {product.Localization}</p>
      <p><strong>Country:</strong> {product.Country}</p>
      <p><strong>Zone:</strong> {product.Zone}</p>
      <p><strong>Min Pax Reserve:</strong> {product.MinPaxReserve}</p>
      <p><strong>Max Pax Reserve:</strong> {product.MaxPaxReserve}</p>
      {/* Add more fields here if needed */}
    </div>
  );
}
