import React, { useState } from 'react';
import MainLayout from '../src/components/layout/MainLayout';
import KeywordAllocationInterface from '../src/components/keywords/KeywordAllocationInterface';
import KeywordRankChecker from '../src/components/keywords/KeywordRankChecker';

export default function Keywords() {
  const [activeTab, setActiveTab] = useState<'allocation' | 'rank-checker'>('allocation');

  const tabs = [
    { id: 'allocation', label: 'Keyword Allocation', icon: '🎯' },
    { id: 'rank-checker', label: 'Rank Checker', icon: '📊' }
  ];

  return (
    <MainLayout>
      <div style={{ padding: '1.5rem' }}>
        {/* Tab Navigation */}
        <div style={{ 
          borderBottom: '1px solid #e5e7eb', 
          marginBottom: '2rem' 
        }}>
          <nav style={{ display: 'flex', gap: '2rem' }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '1rem 0',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
                  color: activeTab === tab.id ? '#3b82f6' : '#6b7280',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <span style={{ fontSize: '1.25rem' }}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'allocation' && <KeywordAllocationInterface />}
          {activeTab === 'rank-checker' && <KeywordRankChecker />}
        </div>
      </div>
    </MainLayout>
  );
}