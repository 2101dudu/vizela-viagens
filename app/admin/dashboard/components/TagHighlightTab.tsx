'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import FetchHighlightedTag from '@/app/hooks/_fetch_highlighted_tag';

const optionChoices = [
  { value: "charter", label: "charter" },
  { value: "praia", label: "praia" },
  { value: "fim_de_ano", label: "fim_de_ano" },
  { value: "city_break", label: "city_break" },
];

export default function TagHighlightTab() {
  const [highlightedTag, setHighlightedTag] = useState<string>("");
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchHighlighted = async () => {
      try {
        const tagFromBackend: any = await FetchHighlightedTag();
        setHighlightedTag(tagFromBackend.tag || "");
      } catch (err) {
        console.error("Failed to fetch highlighted tag:", err);
        setError("Failed to fetch highlighted tag");
      }
    };

    fetchHighlighted();
  }, []);

  const requestHighlightedTagChange = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/admin');
        return;
      }
      
      const res = await fetch(`http://192.168.1.120:8080/api/admin/page/highlight/${highlightedTag}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!res.ok) {
        throw new Error('Failed to highlight tag');
      }
      
      setError('');
      // Show success message or update UI as needed
    } catch (err) {
      setError('Failed to highlight tag');
    } finally {
      setIsLoading(false);
    }
  }, [highlightedTag, router]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Tag Highlight Management</h2>
        
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
            <button onClick={() => setError('')} className="ml-2 text-red-500 hover:text-red-700">×</button>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Highlighted Tag
            </label>
            <div className="flex items-center space-x-4">
              <select
                value={highlightedTag}
                onChange={(e) => setHighlightedTag(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              >
                <option value="">Select a tag</option>
                {optionChoices.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              
              <button
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                onClick={requestHighlightedTagChange}
                disabled={isLoading || !highlightedTag}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Updating...</span>
                  </>
                ) : (
                  <span>Highlight Tag</span>
                )}
              </button>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-2">About Tag Highlighting</h3>
            <p className="text-gray-600">
              The highlighted tag will be featured prominently on the main website. 
              This affects which products are showcased to visitors and can influence 
              booking patterns.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
