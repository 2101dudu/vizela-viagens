'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Select from 'react-select';
import { _get_product_list, ProductWrapper } from '../../admin_hooks/_get_product_list';
import Link from 'next/dist/client/link';
import { FixedSizeList as List } from 'react-window';

const optionChoices = [
  { value: "charter", label: "charter" },
  { value: "praia", label: "praia" },
  { value: "fim_de_ano", label: "fim_de_ano" },
  { value: "city_break", label: "city_break" },
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
  onToggleEnabled: (code: string) => void,
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

        <div className="flex flex-col w-4/5">
          {enabled ? (
            <Link href={`/products/${code}`} className="underline text-lg font-semibold text-gray-900">
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
          onClick={() => onToggleEnabled(code)}
          disabled={isSubmitting[code]}
          title={enabled ? 'Disable product' : 'Enable product'}
          className={`py-2 px-4 bg-gray-50 shadow-md focus:outline-none absolute top-1/2 -translate-y-1/2 right-1 text-4xl z-10
            ${enabled
              ? "hover:text-red-600"
              : "hover:text-green-400"}
          `}
          >
          {enabled ? '×' : '+'}
          </button>
      )}
    </div>
  );
});

export default function ProductManagementTab() {
  const [products, setProducts] = useState<ProductWrapper[]>([]);
  const [numProducts, setNumProducts] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [dropdownSelections, setDropdownSelections] = useState<{ [key: string]: string[] }>({});
  const [isSubmitting, setIsSubmitting] = useState<{ [key: string]: boolean }>({});
  
  // Filter and ordering states
  const [orderBy, setOrderBy] = useState<string>('name');
  const [orderDirection, setOrderDirection] = useState<string>('ascending');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [productStatus, setProductStatus] = useState<string[]>(['enabled', 'disabled']);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductWrapper[]>([]);
  const [nameFilter, setNameFilter] = useState<string>('');
  
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
        setNumProducts(productList.length);

        // Sanity check enabled field:
        productList.forEach(p => {
          if (p.enabled === null || p.enabled === undefined) {
            throw new Error(`Product ${p.product.Code || 'unknown'} enabled field is null or undefined!`);
          }
        });

        // Extract all unique tags from products
        const uniqueTags = optionChoices.map(option => option.value)
        setAvailableTags(uniqueTags);
        setProducts(productList);
        setFilteredProducts(productList);
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

  useEffect(() => {
    let filtered = [...products];

    // Filter by selected tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(product => 
        selectedTags.some(tag => product.tags?.includes(tag))
      );
    }

    // Filter by product status
    filtered = filtered.filter(product => 
      productStatus.includes(product.enabled ? 'enabled' : 'disabled') || productStatus.length === 0
    );

    // Filter by name
    if (nameFilter) {
      filtered = filtered.filter(product => 
        product.product.Name?.toLowerCase().includes(nameFilter.toLowerCase())
      );
    }

    // Sort products
    filtered.sort((a, b) => {
      const aValue:string | undefined = orderBy === 'name' ? a.product.Name : a.product.PriceFrom;
      const bValue:string | undefined = orderBy === 'name' ? b.product.Name : b.product.PriceFrom;

      if (aValue === undefined) return 1;
      if (bValue === undefined) return -1;

      if (orderDirection === 'ascending') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredProducts(filtered);
  }, [products, selectedTags, productStatus, orderBy, orderDirection, nameFilter]);

  const handleDropdownChange = useCallback((productCode: string, selectedOptions: any) => {
    const values = selectedOptions ? selectedOptions.map((option: any) => option.value) : [];
    setDropdownSelections(prev => ({ ...prev, [productCode]: values }));
  }, []);

  const handleAddOptions = useCallback(async (productCode: string) => {
    const newOptions = (dropdownSelections[productCode] || []).map(tag =>
      tag.toLowerCase().replace(/\s+/g, '_')
    );

    if (newOptions.length === 0) return;

    setIsSubmitting(prev => ({ ...prev, [productCode]: true }));

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/admin');
        return;
      }

      const response = await fetch(`http://localhost:8080/api/admin/products/${productCode}/tags/add`, {
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
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/admin');
        return;
      }

      const response = await fetch(`http://localhost:8080/api/admin/products/${productCode}/tags/remove/${optionToRemove}`, {
        method: 'GET',
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
          return { ...p, tags: p.tags.length === 0 ? [] : p.tags.filter(tag => tag !== optionToRemove) };
        }
        return p;
      }));
    } catch (error) {
      console.error('Error removing tag:', error);
      setError('Failed to remove tag');
    }
  }, [router]);

  const handleToggleEnabled = useCallback(async (productCode: string) => {
    setIsSubmitting(prev => ({ ...prev, [productCode]: true }));
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/admin');
        return;
      }

      const url = `http://localhost:8080/api/admin/products/${productCode}/toggle`;
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
        throw new Error(`Failed to toggle product: ${response.status}`);
      }

      // Confirm success, update local state:
      setProducts(prev => prev.map(p => {
        if (p.product.Code === productCode) {
          return { ...p, enabled: !p.enabled };
        }
        return p;
      }));
    } catch (error) {
      console.error('Error toggling product enabled:', error);
      setError(`Failed to toggle product`);
    } finally {
      setIsSubmitting(prev => ({ ...prev, [productCode]: false }));
    }
  }, [router]);

  if (isLoading) {
    return <div className="flex items-center justify-center text-xl h-96">Loading products...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center text-xl text-red-600 h-96">{error}</div>;
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
          <button onClick={() => setError('')} className="ml-2 text-red-500 hover:text-red-700">×</button>
        </div>
      )}

      {/* Filter and Order Controls */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Product Management</h2>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Ordering Options */}
          <div className="w-full md:w-1/2">
            <h3 className="font-medium text-gray-700 mb-3">Ordering Options</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="w-full sm:w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Order by</label>
                <select 
                  value={orderBy} 
                  onChange={(e) => setOrderBy(e.target.value)}
                  className="w-full border rounded p-2"
                >
                  <option value="price">Price</option>
                  <option value="name">Name</option>
                </select>
              </div>
              <div className="w-full sm:w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Order direction</label>
                <select 
                  value={orderDirection} 
                  onChange={(e) => setOrderDirection(e.target.value)}
                  className="w-full border rounded p-2"
                >
                  <option value="ascending">Ascending</option>
                  <option value="descending">Descending</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Filtering Options */}
          <div className="w-full md:w-1/2">
            <h3 className="font-medium text-gray-700 mb-3">Filtering Options</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
              <input
                type="text"
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
                placeholder="Filter by product name..."
                className="w-full border rounded p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map(tag => (
                  <label key={tag} className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedTags.includes(tag)}
                      onChange={() => {
                        if (selectedTags.includes(tag)) {
                          setSelectedTags(selectedTags.filter(t => t !== tag));
                        } else {
                          setSelectedTags([...selectedTags, tag]);
                        }
                      }}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 mr-1"
                    />
                    <span className="text-sm text-gray-700">{tag}</span>
                  </label>
                ))}
                {availableTags.length === 0 && (
                  <span className="text-sm text-gray-500">No tags available</span>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Status</label>
              <div className="flex gap-4">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={productStatus.includes('enabled')}
                    onChange={() => {
                      if (productStatus.includes('enabled')) {
                        setProductStatus(productStatus.filter(s => s !== 'enabled'));
                      } else {
                        setProductStatus([...productStatus, 'enabled']);
                      }
                    }}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 mr-1"
                  />
                  <span className="text-sm text-gray-700">Enabled</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={productStatus.includes('disabled')}
                    onChange={() => {
                      if (productStatus.includes('disabled')) {
                        setProductStatus(productStatus.filter(s => s !== 'disabled'));
                      } else {
                        setProductStatus([...productStatus, 'disabled']);
                      }
                    }}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 mr-1"
                  />
                  <span className="text-sm text-gray-700">Disabled</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="bg-gray-100 rounded-lg shadow p-6">
          <h3 className="text-xl text-center font-bold text-gray-900 mb-6">
            ({numProducts}) Produtos
          </h3>
          <List
            height={600}
            itemCount={filteredProducts.length}
            itemSize={200}
            width={"100%"}
          >
            {({ index, style }: { index: number; style: React.CSSProperties }) => (
              <div style={style}>
                <ProductCard
                  key={filteredProducts[index].product.Code}
                  product={filteredProducts[index]}
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
        </div>
      ) : (
        <div className="text-center text-gray-500 mt-8">Nenhum produto encontrado.</div>
      )}
    </div>
  );
}
