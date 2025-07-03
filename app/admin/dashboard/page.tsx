'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Select from 'react-select';
import { _get_product_list, Product, ProductWrapper } from '../admin_hooks/_get_product_list';
import Link from 'next/dist/client/link';

const optionChoices = [
  { value: "CHARTER", label: "CHARTER" },
  { value: "PRAIA", label: "PRAIA" },
  { value: "FIM DE ANO", label: "FIM DE ANO" },
  { value: "CITY BREAK", label: "CITY BREAK" },
];

export default function AdminDashboard() {
  const [products, setProducts] = useState<ProductWrapper[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [dropdownSelections, setDropdownSelections] = useState<{ [key: string]: string[] }>({});
  const [isSubmitting, setIsSubmitting] = useState<{ [key: string]: boolean }>({});
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
        setProducts(productList);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load products');
        router.push('/admin');
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

  const getAvailableOptions = (productTags: string[] | null) => {
    const safeTags = productTags ?? [];
    return optionChoices.filter(option => !safeTags.includes(option.value));
  };

  const handleAddOptions = async (productCode: string) => {
    const newOptions = dropdownSelections[productCode] || [];
    if (newOptions.length === 0) return;

    setIsSubmitting(prev => ({ ...prev, [productCode]: true }));

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/admin');
        return;
      }

      const response = await fetch(`http://localhost:8080/api/admin/products/${productCode}/tags`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tags: newOptions }),
      });

      console.log(JSON.stringify({ tags: newOptions }));

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          router.push('/admin');
          return;
        }
        throw new Error(`Failed to update tags: ${response.status}`);
      }

      // Wait for response and update local state only after success
      await response.json();
      
      setProducts(prev => prev.map(p => {
        if (p.product.Code === productCode) {
          const uniqueOptions = [...new Set([...p.tags, ...newOptions])];
          return { ...p, tags: uniqueOptions };
        }
        return p;
      }));

      // Clear dropdown selection after successful addition
      setDropdownSelections(prev => ({
        ...prev,
        [productCode]: []
      }));
    } catch (error) {
      console.error('Error updating tags:', error);
      setError('Failed to update tags');
    } finally {
      setIsSubmitting(prev => ({ ...prev, [productCode]: false }));
    }
  };

  const handleRemoveOption = async (productCode: string, optionToRemove: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/admin');
        return;
      }

      const response = await fetch(`http://localhost:8080/api/admin/products/${productCode}/tags/${optionToRemove}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          router.push('/admin');
          return;
        }
        throw new Error(`Failed to remove tag: ${response.status}`);
      }

      // Update local state only after successful API call
      setProducts(prev => prev.map(p => {
        if (p.product.Code === productCode) {
          return {
            ...p,
            tags: p.tags.filter(option => option !== optionToRemove)
          };
        }
        return p;
      }));
    } catch (error) {
      console.error('Error removing tag:', error);
      setError('Failed to remove tag');
    }
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
        
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
            <button 
              onClick={() => setError('')}
              className="ml-2 text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}
        
        <div className="space-y-4">
          {products.map((product, index) => (
            <div
              key={product.product.Code || index}
              className="bg-white rounded-lg shadow p-6 flex items-center justify-between space-x-4"
            >
              {/* Product Image */}
              <div className="flex w-32 items-center space-x-4">
                <img
                  src={product.product.ImageUrl || '/fallback.png'}
                  alt={product.product.Name || 'Product'}
                  className="w-20 h-20 object-cover rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/fallback.png';
                  }}
                />
              </div>

              {/* Product Info */}
              <div className="flex flex-col w-2/3">
                <Link href={`/product/${product.product.Code}`} className="underline text-lg font-semibold text-gray-900">
                  {product.product.Name || 'Produto sem nome'}
                </Link>
                <p className="text-gray-600">
                  {product.product.PriceFrom ? `Desde ${product.product.PriceFrom}€` : 'Preço não disponível'}
                </p>
              </div>
                
              {/* Dropdown and Add Button */}
              <div className="w-4/5 flex items-center space-x-3">
                {/* Selected Options Tags */}
                <div className="w-full flex flex-col">
                  {(product.tags ?? []).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(product.tags ?? []).map((option) => (
                        <span
                          key={option}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                        >
                          {option}
                          <button
                            onClick={() => handleRemoveOption(product.product.Code || '', option)}
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
                  options={getAvailableOptions(product.tags)}
                  value={getAvailableOptions(product.tags).filter(option => 
                    dropdownSelections[product.product.Code || '']?.includes(option.value)
                  )}
                  onChange={(selected) => handleDropdownChange(product.product.Code || '', selected)}
                  placeholder={getAvailableOptions(product.tags).length === 0 ? "Todas as tags já estão adicionadas" : "Selecionar opções..."}
                  className="text-sm"
                  isDisabled={isSubmitting[product.product.Code || ''] || getAvailableOptions(product.tags).length === 0}
                  />
                </div>
              </div>
              <button
                onClick={() => handleAddOptions(product.product.Code || '')}
                disabled={
                  !dropdownSelections[product.product.Code || '']?.length || 
                  isSubmitting[product.product.Code || ''] ||
                  getAvailableOptions(product.tags).length === 0
                }
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isSubmitting[product.product.Code || ''] ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Enviando...</span>
                  </>
                ) : (
                  <span>Adicionar</span>
                )}
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