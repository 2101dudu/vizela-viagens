import React from "react";
import Image from "next/image";
import { _Button } from "@/app/components";


const _Product = ({ product }: { product: any }) => {
  return (
    <div className="mx-auto bg-white rounded-lg shadow-lg flex flex-col">
      <div className="w-full max-w-md aspect-[4/3] mb-1 relative">
        <Image
          src={product.ImageUrl}
          alt={product.Name}
          fill
          style={{ objectFit: "cover" }}
        />
        <p className="w-full absolute bottom-0 bg-black bg-opacity-70 text-white text-sm text-center py-2">
          {product.BaseDays} Noites
        </p>
      </div>
      <div className="p-2 flex flex-col items-center">
        <h1 className="text-xl w-full truncate">{product.Name}</h1>
        <p className="text-lg w-full mb-5">Desde <b className="text-2xl font-bold text-highlight">{product.PriceFrom}€</b></p>
        <_Button href={`/product/${product.Code}`} highlighted>Ver Detalhes</_Button>
      </div>
    </div>
  );
};

export default _Product;
