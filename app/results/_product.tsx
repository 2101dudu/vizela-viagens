import React from "react";


const _Product = ({ product }: { product: any }) => {
  return (
    <div className="bg-white shadow rounded w-2/3 max-w-xl mx-auto font-sans text-center">
      <h1 className="text-2xl font-bold mb-4">{product.Name}</h1>
      <img
        src={product.ImageUrl}
        alt={product.Name}
        className="w-full max-h-[300px] object-cover rounded-lg"
      />
      <p className="text-lg font-bold mt-3">
        Price From: €{product.PriceFrom}
      </p>
    </div>
  );
};

export default _Product;
