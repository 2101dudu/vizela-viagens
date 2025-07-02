'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export interface Product {
  Code?: string;
  Name?: string;
  ImageUrl?: string;
  PriceFrom?: string;
}

interface ProductListState {
  products: Product[];
  loading: boolean;
  error: string | null;
  sessionExpired: boolean;
}

export const useProductList = () => {
  const [state, setState] = useState<ProductListState>({
    products: [],
    loading: false,
    error: null,
    sessionExpired: false,
  });
  const router = useRouter();

  const fetchProducts = async (): Promise<void> => {
    setState(prev => ({ ...prev, loading: true, error: null, sessionExpired: false }));
    
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setState(prev => ({ ...prev, loading: false, sessionExpired: true }));
        return;
      }

      const response = await fetch('http://localhost:8080/api/admin/products', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('adminToken');
          setState(prev => ({ ...prev, loading: false, sessionExpired: true }));
          return;
        }
        throw new Error(`Fetch failed with status ${response.status}`);
      }

      const json = await response.json();
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        products: json.list as Product[],
        error: null 
      }));
    } catch (err) {
      console.error('Failed to get product list:', err);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: err instanceof Error ? err.message : 'Failed to fetch products'
      }));
    }
  };

  const handleSessionExpired = () => {
    router.push('/admin');
  };

  const renderSessionExpiredButton = () => {
    if (!state.sessionExpired) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-sm mx-4 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Session Expired
          </h3>
          <p className="text-gray-600 mb-4">
            Your session has expired. Please log in again to continue.
          </p>
          <button
            onClick={handleSessionExpired}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  };

  return {
    ...state,
    fetchProducts,
    renderSessionExpiredButton,
  };
};

// Legacy function for backward compatibility
export const _get_product_list = async (): Promise<Product[]> => {
  try {
    const token = localStorage.getItem('adminToken');
    if (!token) throw new Error('No authentication token found');

    const response = await fetch('http://localhost:8080/api/admin/products', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('adminToken');
        throw new Error('Authentication failed or token expired');
      }
      throw new Error(`Fetch failed with status ${response.status}`);
    }

    const json = await response.json();
    return json.list as Product[];
  } catch (err) {
    console.error('Failed to get product list:', err);
    throw err;
  }
};
