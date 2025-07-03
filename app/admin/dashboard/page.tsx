'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Select from 'react-select';
import { _get_product_list, ProductWrapper } from '../admin_hooks/_get_product_list';
import Link from 'next/dist/client/link';
import { FixedSizeList as List } from 'react-window';

const optionChoices = [
  { value: "CHARTER", label: "CHARTER" },
  { value: "PRAIA", label: "PRAIA" },
  { value: "FIM DE ANO", label: "FIM DE ANO" },
  { value: "CITY BREAK", label: "CITY BREAK" },
];

const ProductCard = React.memo(({
  product,
  dropdownSelections,
  isSubmitting,
  onDropdownChange,
  onAddOptions,
  onRemoveOption,
  onToggleEnabled,
}: {
  product: ProductWrapper,
  dropdownSelections: { [key: string]: string[] },
  isSubmitting: { [key: string]: boolean },
  onDropdownChange: (code: string, selected: any) => void,
  onAddOptions: (code: string) => void,
  onRemoveOption: (code: string, tag: string) => void,
  onToggleEnabled: (code: string, newState: boolean) => void,
}) => {
  const code = product.product.Code || '';
  const tags = product.tags ?? [];
  const enabled = product.enabled;

  if (enabled === null || enabled === undefined) {
    throw new Error(`Product ${code} 'enabled' field is null or undefined!`);
  }

  const [isHovered, setIsHovered] = useState(false);

  const availableOptions = useMemo(() => {
    return optionChoices.filter(option => !tags.includes(option.value));
  }, [tags]);

  const selectedOptions = useMemo(() => {
    return availableOptions.filter(option => dropdownSelections[code]?.includes(option.value));
  }, [dropdownSelections, code, availableOptions]);

  return (
    <div className="w-full relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      >
      <div
        className={`w-[93%] bg-white rounded-lg shadow p-6 flex items-center justify-between space-x-4
          ${!enabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg cursor-pointer'}`}
        aria-disabled={!enabled}
      >
        <div className="flex w-32 items-center space-x-4">
          <img
            src={product.product.ImageUrl || '/fallback.png'}
            alt={product.product.Name || 'Product'}
            className="w-20 h-20 object-cover rounded-lg"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/fallback.png';
            }}
            style={{ pointerEvents: enabled ? 'auto' : 'none' }}
          />
        </div>

        <div className="flex flex-col w-2/3">
          {enabled ? (
            <Link href={`/product/${code}`} className="underline text-lg font-semibold text-gray-900">
              {product.product.Name || 'Produto sem nome'}
            </Link>
          ) : (
            <span className="text-lg font-semibold text-gray-400">{product.product.Name || 'Produto sem nome'}</span>
          )}
          <p className={`text-gray-600 ${!enabled ? 'italic' : ''}`}>
            {product.product.PriceFrom ? `Desde ${product.product.PriceFrom}€` : 'Preço não disponível'}
          </p>
        </div>

        <div className="w-full flex items-center space-x-3">
          <div className="w-full gap-1 flex flex-col">
            {tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {tags.map(option => (
                  <span
                    key={option}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    {option}
                    <button
                      onClick={() => onRemoveOption(code, option)}
                      disabled={!enabled || isSubmitting[code]}
                      className={`ml-2 ${enabled ? 'text-blue-600 hover:text-blue-800' : 'text-gray-400 cursor-not-allowed'}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            <Select
              isMulti
              options={availableOptions}
              value={selectedOptions}
              onChange={(selected) => onDropdownChange(code, selected)}
              placeholder={availableOptions.length === 0 ? "Todas as tags já estão adicionadas" : "Selecionar opções..."}
              className="text-sm"
              isDisabled={isSubmitting[code] || availableOptions.length === 0 || !enabled}
            />
          </div>
        </div>

        <div className="flex flex-col items-center space-y-2">
          <button
            onClick={() => onAddOptions(code)}
            disabled={!dropdownSelections[code]?.length || isSubmitting[code] || availableOptions.length === 0 || !enabled}
            className={`px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2`}
          >
            {isSubmitting[code] ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Enviando...</span>
              </>
            ) : (
              <span>Adicionar</span>
            )}
          </button>

        </div>
      </div>
      {isHovered && (
          <button
          onClick={() => onToggleEnabled(code, !enabled)}
          disabled={isSubmitting[code]}
          title={enabled ? 'Disable product' : 'Enable product'}
          className={`py-2 px-4 bg-gray-50 shadow-md text-blue-300 focus:outline-none absolute top-1/2 -translate-y-1/2 right-1 text-4xl z-10
            ${enabled
              ? "hover:text-red-600"
              : "hover:text-blue-700"}
          `}
          >
          {enabled ? '×' : '+'}
          </button>
      )}
    </div>
  );
});

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

        // Sanity check enabled field:
        productList.forEach(p => {
          if (p.enabled === null || p.enabled === undefined) {
            throw new Error(`Product ${p.product.Code || 'unknown'} enabled field is null or undefined!`);
          }
        });

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

  const handleDropdownChange = useCallback((productCode: string, selectedOptions: any) => {
    const values = selectedOptions ? selectedOptions.map((option: any) => option.value) : [];
    setDropdownSelections(prev => ({ ...prev, [productCode]: values }));
  }, []);

  const handleAddOptions = useCallback(async (productCode: string) => {
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

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          router.push('/admin');
          return;
        }
        throw new Error(`Failed to update tags: ${response.status}`);
      }

      await response.json();

      setProducts(prev => prev.map(p => {
        if (p.product.Code === productCode) {
          const uniqueOptions = [...new Set([...p.tags, ...newOptions])];
          return { ...p, tags: uniqueOptions };
        }
        return p;
      }));

      setDropdownSelections(prev => ({ ...prev, [productCode]: [] }));
    } catch (error) {
      console.error('Error updating tags:', error);
      setError('Failed to update tags');
    } finally {
      setIsSubmitting(prev => ({ ...prev, [productCode]: false }));
    }
  }, [dropdownSelections, router]);

  const handleRemoveOption = useCallback(async (productCode: string, optionToRemove: string) => {
    setIsSubmitting(prev => ({ ...prev, [productCode]: true }));
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

      setProducts(prev => prev.map(p => {
        if (p.product.Code === productCode) {
          return { ...p, tags: p.tags.filter(tag => tag !== optionToRemove) };
        }
        return p;
      }));
    } catch (error) {
      console.error('Error removing tag:', error);
      setError('Failed to remove tag');
    } finally {
      setIsSubmitting(prev => ({ ...prev, [productCode]: false }));
    }
  }, [router]);

  const handleToggleEnabled = useCallback(async (productCode: string, newState: boolean) => {
    setIsSubmitting(prev => ({ ...prev, [productCode]: true }));
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/admin');
        return;
      }

      const url = `http://localhost:8080/api/admin/products/${productCode}/${newState ? 'enable' : 'disable'}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          router.push('/admin');
          return;
        }
        throw new Error(`Failed to ${newState ? 'enable' : 'disable'} product: ${response.status}`);
      }

      // Confirm success, update local state:
      setProducts(prev => prev.map(p => {
        if (p.product.Code === productCode) {
          return { ...p, enabled: newState };
        }
        return p;
      }));
    } catch (error) {
      console.error('Error toggling product enabled:', error);
      setError(`Failed to ${newState ? 'enable' : 'disable'} product`);
    } finally {
      setIsSubmitting(prev => ({ ...prev, [productCode]: false }));
    }
  }, [router]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-xl">Loading products...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-xl text-red-600">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="w-4/5 mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Admin Dashboard</h1>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
            <button onClick={() => setError('')} className="ml-2 text-red-500 hover:text-red-700">×</button>
          </div>
        )}

        {products.length > 0 ? (
          <List
            height={800}
            itemCount={products.length}
            itemSize={200}
            width={"100%"}
          >
            {({ index, style }: { index: number; style: React.CSSProperties }) => (
              <div style={style}>
                <ProductCard
                  key={products[index].product.Code}
                  product={products[index]}
                  dropdownSelections={dropdownSelections}
                  isSubmitting={isSubmitting}
                  onDropdownChange={handleDropdownChange}
                  onAddOptions={handleAddOptions}
                  onRemoveOption={handleRemoveOption}
                  onToggleEnabled={handleToggleEnabled}
                />
              </div>
            )}
          </List>
        ) : (
          <div className="text-center text-gray-500 mt-8">Nenhum produto encontrado.</div>
        )}
      </div>
    </div>
  );
}
