'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { _get_product_list, ProductWrapper } from '../../admin_hooks/_get_product_list';

export default function AnalyticsTab() {
  const [products, setProducts] = useState<ProductWrapper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to adjust visit count: subtract 1 if count is 0
  const getAdjustedVisitCount = (visitCount: number | undefined): number => {
    const count = visitCount || 0;
    return count;
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const productList = await _get_product_list();
        // Sort by visitCount in descending order (using adjusted visit count)
        const sortedProducts = productList.sort((a, b) => getAdjustedVisitCount(b.visitCount) - getAdjustedVisitCount(a.visitCount));
        setProducts(sortedProducts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const topThreeProducts = products.slice(0, 3);
  const remainingProducts = products.slice(3);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Analytics Dashboard</h2>
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Analytics Dashboard</h2>
          <div className="text-center py-20">
            <div className="text-red-500 text-xl mb-2">⚠️</div>
            <p className="text-red-600">Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Analytics Dashboard</h2>
        
        {/* Top 3 Products Podium */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">🏆 Top 3 Most Visited Products</h3>
          <div className="flex justify-center items-end space-x-4">
            {/* Second Place */}
            {topThreeProducts[1] && (
              <div className="flex flex-col items-center">
                <div className="bg-gray-200 rounded-lg p-4 w-40 h-32 flex flex-col items-center justify-center mb-2">
                  <Image 
                    src={topThreeProducts[1].product.ImageUrl || '/fallback.png'} 
                    alt={topThreeProducts[1].product.Name || 'Product'} 
                    width={64}
                    height={64}
                    className="object-cover rounded-lg mb-2"
                  />
                  <div className="text-2xl font-bold text-gray-600">2nd</div>
                </div>
                <div className="text-center">
                  <p className="font-medium text-sm text-gray-800 truncate w-40">{topThreeProducts[1].product.Name}</p>
                  <p className="text-xs text-gray-600">{getAdjustedVisitCount(topThreeProducts[1].visitCount)} visits</p>
                </div>
              </div>
            )}

            {/* First Place */}
            {topThreeProducts[0] && (
              <div className="flex flex-col items-center">
                <div className="bg-yellow-300 rounded-lg p-4 w-44 h-40 flex flex-col items-center justify-center mb-2">
                  <Image 
                    src={topThreeProducts[0].product.ImageUrl || '/fallback.png'} 
                    alt={topThreeProducts[0].product.Name || 'Product'} 
                    width={80}
                    height={80}
                    className="object-cover rounded-lg mb-2"
                  />
                  <div className="text-3xl font-bold text-yellow-800">🥇</div>
                </div>
                <div className="text-center">
                  <p className="font-medium text-sm text-gray-800 truncate w-44">{topThreeProducts[0].product.Name}</p>
                  <p className="text-xs text-gray-600">{topThreeProducts[0].visitCount || 0} visits</p>
                </div>
              </div>
            )}

            {/* Third Place */}
            {topThreeProducts[2] && (
              <div className="flex flex-col items-center">
                <div className="bg-orange-200 rounded-lg p-4 w-40 h-28 flex flex-col items-center justify-center mb-2">
                  <Image 
                    src={topThreeProducts[2].product.ImageUrl || '/fallback.png'} 
                    alt={topThreeProducts[2].product.Name || 'Product'} 
                    width={56}
                    height={56}
                    className="object-cover rounded-lg mb-2"
                  />
                  <div className="text-xl font-bold text-orange-600">3rd</div>
                </div>
                <div className="text-center">
                  <p className="font-medium text-sm text-gray-800 truncate w-40">{topThreeProducts[2].product.Name}</p>
                  <p className="text-xs text-gray-600">{topThreeProducts[2].visitCount || 0} visits</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Remaining Products List */}
        {remainingProducts.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">📊 All Products by Visit Count</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {remainingProducts.map((productWrapper, index) => (
                <div key={productWrapper.product.Code || index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="text-sm font-medium text-gray-600 w-8">#{index + 4}</div>
                  <Image 
                    src={productWrapper.product.ImageUrl || '/fallback.png'} 
                    alt={productWrapper.product.Name || 'Product'} 
                    width={48}
                    height={48}
                    className="object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{productWrapper.product.Name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-600">{productWrapper.visitCount || 0}</p>
                    <p className="text-xs text-gray-500">visits</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {products.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No Data Available</h3>
            <p className="text-gray-500">No products found to display analytics.</p>
          </div>
        )}
      </div>
    </div>
  );
}
