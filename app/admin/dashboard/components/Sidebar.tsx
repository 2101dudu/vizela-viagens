'use client';

import React from 'react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  {
    id: 'tag-highlight',
    name: 'Tag Highlight',
    icon: '🏷️',
    description: 'Manage highlighted tags'
  },
  {
    id: 'product-management',
    name: 'Product Management',
    icon: '📦',
    description: 'Manage products and filters'
  },
  {
    id: 'analytics',
    name: 'Analytics',
    icon: '📊',
    description: 'View analytics and reports'
  }
];

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <div className="bg-white shadow-lg rounded-lg p-6 h-fit sticky top-8">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Dashboard Navigation</h2>
      
      <nav className="space-y-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`w-full text-left p-4 rounded-lg transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-blue-100 text-blue-800 border-l-4 border-blue-600 shadow-sm'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'
            }`}
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{tab.icon}</span>
              <div className="flex-1">
                <div className="font-medium">{tab.name}</div>
                <div className="text-sm opacity-75 mt-1">{tab.description}</div>
              </div>
              {activeTab === tab.id && (
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              )}
            </div>
          </button>
        ))}
      </nav>

    </div>
  );
}
