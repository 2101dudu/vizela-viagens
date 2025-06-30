"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import BookingForm, { ApiData } from "./_booking_form";
import FetchProduct, {PhotoContent, TextContent} from "@/app/hooks/_fetch_product";
import fallBackSrc from "@/public/fallback.png";

export default function ProductPage() {
  const params = useParams();
  const code = params.code; // code from URL

  const [product, setProduct] = useState<ApiData | null>(null);
  const [textArray, setTextArray] = useState<TextContent[]>([]);
  const [photoArray, setPhotoArray] = useState<PhotoContent[]>([]);
  const [price, setPrice] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openBar, setOpenBar] = useState<string>("");

  useEffect(() => {
    if (!code) return;

    const fetchProduct = async () => {
      setLoading(true);
      try {
        const product = await FetchProduct(code as string);
        setProduct(product.data);
        setTextArray(product.textArray || []);
        setPhotoArray(product.photoArray || []);
        setPrice(product.price || 0);
        // Set default open bar to first type if available
        if (product.textArray && product.textArray.length > 0) {
          setOpenBar(product.textArray[0].Type);
        }
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

  // Header image and product name overlay
  const headerImage = photoArray && photoArray.length > 0 ? photoArray[0].ImageUrl : null;
  console.log(headerImage !== "" ? headerImage : fallBackSrc.src)

  // Get all unique types for tabs
  const types = Array.from(new Set(textArray.map((item) => item.Type)));

  return (
    <div>
      {headerImage && (
        <div className="relative w-full h-64 md:h-96">
          <Image
            src={headerImage !== "" ? headerImage : fallBackSrc.src}
            alt={product.Name}
            width={800}
            height={400}
            className="object-cover w-full h-full"
            style={{ objectPosition: 'center' }}
            priority
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center">
            <h1 className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg text-center px-4">
              {product.Name}
            </h1>
            {price > 0 && (
              <p className="text-2xl md:text-4xl font-bold text-white drop-shadow-lg text-center px-4">
                A partir de {price} €
              </p>
            )}
          </div>
        </div>
      )}
      <div className="w-2/3 p-6 mx-auto">
        <div className="w-full flex justify-between">
          <BookingForm data={product} />
          <div className="w-4/5 ml-6 ">
            <h2 className="text-xl font-bold mb-4">Detalhes do Produto</h2>
            {/* Accordion Bars */}
            <div className="flex flex-col gap-2">
              {types.map((type) => {
                const isOpen = openBar === type;
                const sectionContent = textArray.filter((item) => item.Type === type);
                return (
                  <div key={type} className="border rounded-lg bg-white shadow">
                    <button
                      className="w-full flex items-center justify-between px-4 py-3 text-left font-semibold focus:outline-none transition-colors duration-400"
                      onClick={() => setOpenBar(isOpen ? "" : type)}
                      type="button"
                    >
                      <span>{type}</span>
                      <span className={`transform transition-transform ease-in-out duration-400 ${isOpen ? 'rotate-180' : ''}`}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </span>
                    </button>
                    <div
                      className={`transition-all duration-400 ease-in-out overflow-scroll ${isOpen ? 'max-h-96 opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-2'}`}
                      style={{
                        willChange: 'max-height, opacity, transform',
                      }}
                    >
                      <div className="p-4 border-t bg-gray-50">
                        {sectionContent.length > 0 ? (
                          sectionContent.map((item, idx) => (
                            <div key={idx} className="mb-2">
                              <div dangerouslySetInnerHTML={{ __html: item.Content }} />
                            </div>
                          ))
                        ) : (
                          <div className="text-gray-400">Não há conteúdo para esta secção</div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
