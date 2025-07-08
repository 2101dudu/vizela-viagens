'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar, TagHighlightTab, ProductManagementTab, AnalyticsTab } from './components';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<string>('tag-highlight');
  const router = useRouter();

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin');
      return;
    }
  }, [router]);

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'tag-highlight':
        return <TagHighlightTab />;
      case 'product-management':
        return <ProductManagementTab />;
      case 'analytics':
        return <AnalyticsTab />;
      default:
        return <TagHighlightTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Admin Dashboard</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-4">
            <div className="transition-all duration-300 ease-in-out">
              {renderActiveTab()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
