'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Select from 'react-select';
import { _get_product_list, Product } from '../admin_hooks/_get_product_list';
import Link from 'next/dist/client/link';

interface ProductWithOptions extends Product {
  selectedOptions: string[];
}

const optionChoices = [
  { value: "CHARTER", label: "CHARTER" },
  { value: "PRAIA", label: "PRAIA" },
  { value: "FIM DE ANO", label: "FIM DE ANO" },
  { value: "CITY BREAK", label: "CITY BREAK" },
];

export default function AdminDashboard() {
  const [products, setProducts] = useState<ProductWithOptions[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [dropdownSelections, setDropdownSelections] = useState<{ [key: string]: string[] }>({});
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
          router.push('/admin');
          return;
        }

        const productList = await _get_product_list();
        const productsWithOptions = productList.map(product => ({
          ...product,
          selectedOptions: []
        }));
        setProducts(productsWithOptions);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load products');
        if (error instanceof Error && error.message.includes('Authentication token expired')) {
          router.push('/admin');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [router]);

  const handleDropdownChange = (productCode: string, selectedOptions: any) => {
    const values = selectedOptions ? selectedOptions.map((option: any) => option.value) : [];
    setDropdownSelections(prev => ({
      ...prev,
      [productCode]: values
    }));
  };

  const handleAddOptions = (productCode: string) => {
    const newOptions = dropdownSelections[productCode] || [];
    setProducts(prev => prev.map(product => {
      if (product.Code === productCode) {
        const uniqueOptions = [...new Set([...product.selectedOptions, ...newOptions])];
        return { ...product, selectedOptions: uniqueOptions };
      }
      return product;
    }));
    // Clear dropdown selection after adding
    setDropdownSelections(prev => ({
      ...prev,
      [productCode]: []
    }));
  };

  const handleRemoveOption = (productCode: string, optionToRemove: string) => {
    setProducts(prev => prev.map(product => {
      if (product.Code === productCode) {
        return {
          ...product,
          selectedOptions: product.selectedOptions.filter(option => option !== optionToRemove)
        };
      }
      return product;
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading products...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="w-4/5 mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Admin Dashboard
        </h1>
        
        <div className="space-y-4">
          {products.map((product, index) => (
            <div
              key={product.Code || index}
              className="bg-white rounded-lg shadow p-6 flex items-center justify-between space-x-4"
            >
              {/* Product Image */}
              <div className="flex w-32 items-center space-x-4">
                <img
                  src={product.ImageUrl || '/fallback.png'}
                  alt={product.Name || 'Product'}
                  className="w-20 h-20 object-cover rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/fallback.png';
                  }}
                />
              </div>

              {/* Product Info */}
              <div className="flex flex-col w-2/3">
                <Link href={`/product/${product.Code}`} className="underline text-lg font-semibold text-gray-900">
                  {product.Name || 'Produto sem nome'}
                </Link>
                <p className="text-gray-600">
                  {product.PriceFrom ? `Desde ${product.PriceFrom}€` : 'Preço não disponível'}
                </p>
              </div>
                
              {/* Dropdown and Add Button */}
              <div className="w-4/5 flex items-center space-x-3">
                {/* Selected Options Tags */}
                <div className="w-full flex flex-col">
                  {product.selectedOptions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {product.selectedOptions.map((option) => (
                        <span
                          key={option}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                        >
                          {option}
                          <button
                            onClick={() => handleRemoveOption(product.Code || '', option)}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                <Select
                  isMulti
                  options={optionChoices}
                  value={optionChoices.filter(option => 
                    dropdownSelections[product.Code || '']?.includes(option.value)
                  )}
                  onChange={(selected) => handleDropdownChange(product.Code || '', selected)}
                  placeholder="Selecionar opções..."
                  className="text-sm"
                  />
                </div>
              </div>
              <button
                onClick={() => handleAddOptions(product.Code || '')}
                disabled={!dropdownSelections[product.Code || '']?.length}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Adicionar
              </button>
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            Nenhum produto encontrado.
          </div>
        )}
      </div>
    </div>
  );
}