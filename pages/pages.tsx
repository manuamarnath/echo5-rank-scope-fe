import React, { useState } from 'react';
import { useAuth } from '../src/components/auth/AuthContext';
import MainLayout from '../src/components/layout/MainLayout';
import KeywordAllocationInterface from '../src/components/keywords/KeywordAllocationInterface';

interface Page {
  id: string;
  slug: string;
  title?: string;
  primaryKeyword?: string;
  secondaryKeywords: string[];
  status: 'draft' | 'published' | 'needs-review';
  cannibalizationRisk?: boolean;
  clientId: string;
}

interface Keyword {
  id: string;
  text: string;
  intent: 'informational' | 'navigational' | 'commercial' | 'transactional';
  allocatedTo?: string;
  role?: 'owner' | 'employee' | 'client';
  status: 'pending' | 'allocated' | 'in-progress' | 'completed';
  pageId?: string;
}

export default function PagesManagement() {
  const { } = useAuth();
  const [showKeywordAllocation, setShowKeywordAllocation] = useState(false);
  const [pages, setPages] = useState<Page[]>([]);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [view, setView] = useState<'pages' | 'keywords' | 'heatmap'>('pages');

  // Mock data for demonstration
  const clients = [
    { id: '1', name: 'TechCorp Inc.' },
    { id: '2', name: 'Marketing Agency' },
    { id: '3', name: 'E-commerce Store' }
  ];

  const createPageFromKeyword = (keyword: Keyword) => {
    const newPage: Page = {
      id: `page-${Date.now()}`,
      slug: keyword.text.toLowerCase().replace(/\s+/g, '-'),
      title: `How to ${keyword.text}`,
      primaryKeyword: keyword.text,
      secondaryKeywords: [],
      status: 'draft',
      clientId: selectedClient || '1'
    };

    setPages(prev => [...prev, newPage]);
    
    // Update keyword to link to page
    setKeywords(prev => prev.map(kw => 
      kw.id === keyword.id 
        ? { ...kw, pageId: newPage.id, status: 'in-progress' as const }
        : kw
    ));
  };

  const detectCannibalization = () => {
    // Simulate cannibalization detection
    const keywordCounts: Record<string, number> = {};
    pages.forEach(page => {
      if (page.primaryKeyword) {
        keywordCounts[page.primaryKeyword] = (keywordCounts[page.primaryKeyword] || 0) + 1;
      }
      page.secondaryKeywords.forEach(kw => {
        keywordCounts[kw] = (keywordCounts[kw] || 0) + 1;
      });
    });

    setPages(prev => prev.map(page => ({
      ...page,
      cannibalizationRisk: page.primaryKeyword ? keywordCounts[page.primaryKeyword] > 1 : false
    })));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return '#6b7280';
      case 'published': return '#10b981';
      case 'needs-review': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const renderPagesView = () => (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem' 
      }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
          Pages Management
        </h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={detectCannibalization}
            style={{ 
              padding: '0.5rem 1rem', 
              backgroundColor: '#f59e0b', 
              color: 'white', 
              border: 'none', 
              borderRadius: '0.375rem',
              cursor: 'pointer'
            }}
          >
            Detect Cannibalization
          </button>
          <button
            onClick={() => setShowKeywordAllocation(true)}
            style={{ 
              padding: '0.5rem 1rem', 
              backgroundColor: '#4f46e5', 
              color: 'white', 
              border: 'none', 
              borderRadius: '0.375rem',
              cursor: 'pointer'
            }}
          >
            Manage Keywords
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <select
          value={selectedClient}
          onChange={(e) => setSelectedClient(e.target.value)}
          style={{ 
            padding: '0.5rem', 
            border: '1px solid #d1d5db', 
            borderRadius: '0.375rem',
            marginRight: '1rem'
          }}
        >
          <option value="">All Clients</option>
          {clients.map(client => (
            <option key={client.id} value={client.id}>{client.name}</option>
          ))}
        </select>
      </div>

      {pages.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem', 
          backgroundColor: 'white', 
          borderRadius: '0.5rem',
          border: '2px dashed #e5e7eb'
        }}>
          <h3 style={{ 
            fontSize: '1.25rem', 
            fontWeight: '600', 
            marginBottom: '0.5rem',
            color: '#374151'
          }}>
            No pages created yet
          </h3>
          <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
            Upload keywords and create pages to start managing your SEO content.
          </p>
          <button
            onClick={() => setShowKeywordAllocation(true)}
            style={{ 
              padding: '0.5rem 1rem', 
              backgroundColor: '#4f46e5', 
              color: 'white', 
              border: 'none', 
              borderRadius: '0.375rem',
              cursor: 'pointer'
            }}
          >
            Start with Keywords
          </button>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gap: '1rem',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))'
        }}>
          {pages.map((page) => (
            <div
              key={page.id}
              style={{ 
                backgroundColor: 'white', 
                padding: '1.5rem', 
                borderRadius: '0.5rem',
                border: page.cannibalizationRisk ? '2px solid #ef4444' : '1px solid #e5e7eb',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
              }}
            >
              {page.cannibalizationRisk && (
                <div style={{ 
                  backgroundColor: '#fef2f2', 
                  color: '#dc2626', 
                  padding: '0.5rem', 
                  borderRadius: '0.25rem',
                  fontSize: '0.875rem',
                  marginBottom: '1rem'
                }}>
                  ⚠️ Cannibalization risk detected
                </div>
              )}
              
              <h3 style={{ 
                fontSize: '1.125rem', 
                fontWeight: '600', 
                marginBottom: '0.5rem',
                color: '#111827'
              }}>
                {page.title || page.slug}
              </h3>
              
              <p style={{ 
                color: '#6b7280', 
                fontSize: '0.875rem',
                marginBottom: '0.5rem'
              }}>
                /{page.slug}
              </p>

              {page.primaryKeyword && (
                <div style={{ marginBottom: '1rem' }}>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: '500', 
                    color: '#374151',
                    display: 'block',
                    marginBottom: '0.25rem'
                  }}>
                    Primary Keyword:
                  </span>
                  <span style={{ 
                    fontSize: '0.875rem', 
                    padding: '0.25rem 0.5rem', 
                    backgroundColor: '#dbeafe',
                    color: '#1d4ed8',
                    borderRadius: '0.25rem'
                  }}>
                    {page.primaryKeyword}
                  </span>
                </div>
              )}

              {page.secondaryKeywords.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: '500', 
                    color: '#374151',
                    display: 'block',
                    marginBottom: '0.25rem'
                  }}>
                    Secondary Keywords:
                  </span>
                  <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                    {page.secondaryKeywords.map((kw, index) => (
                      <span key={index} style={{ 
                        fontSize: '0.75rem', 
                        padding: '0.125rem 0.375rem', 
                        backgroundColor: '#f3f4f6',
                        color: '#374151',
                        borderRadius: '0.25rem'
                      }}>
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '1rem'
              }}>
                <span style={{ 
                  fontSize: '0.75rem', 
                  padding: '0.25rem 0.5rem', 
                  backgroundColor: getStatusColor(page.status) + '20',
                  color: getStatusColor(page.status),
                  borderRadius: '0.25rem'
                }}>
                  {page.status}
                </span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    style={{ 
                      padding: '0.25rem 0.5rem', 
                      backgroundColor: '#f3f4f6', 
                      color: '#374151', 
                      border: 'none', 
                      borderRadius: '0.25rem',
                      cursor: 'pointer',
                      fontSize: '0.75rem'
                    }}
                  >
                    Edit
                  </button>
                  <button
                    style={{ 
                      padding: '0.25rem 0.5rem', 
                      backgroundColor: '#10b981', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '0.25rem',
                      cursor: 'pointer',
                      fontSize: '0.75rem'
                    }}
                  >
                    View
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderKeywordsView = () => (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem' 
      }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
          Keywords Overview
        </h2>
        <button
          onClick={() => setShowKeywordAllocation(true)}
          style={{ 
            padding: '0.5rem 1rem', 
            backgroundColor: '#4f46e5', 
            color: 'white', 
            border: 'none', 
            borderRadius: '0.375rem',
            cursor: 'pointer'
          }}
        >
          Add Keywords
        </button>
      </div>

      <div style={{ 
        display: 'grid', 
        gap: '1rem', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        marginBottom: '2rem'
      }}>
        {['pending', 'allocated', 'in-progress', 'completed'].map(status => {
          const statusKeywords = keywords.filter(kw => kw.status === status);
          return (
            <div key={status} style={{ 
              backgroundColor: 'white', 
              padding: '1.5rem', 
              borderRadius: '0.5rem',
              border: '1px solid #e5e7eb'
            }}>
              <h3 style={{ 
                fontSize: '1.125rem', 
                fontWeight: '600', 
                marginBottom: '1rem',
                textTransform: 'capitalize'
              }}>
                {status.replace('-', ' ')} ({statusKeywords.length})
              </h3>
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {statusKeywords.map(kw => (
                  <div key={kw.id} style={{ 
                    padding: '0.5rem', 
                    marginBottom: '0.5rem',
                    backgroundColor: '#f9fafb',
                    borderRadius: '0.25rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontSize: '0.875rem' }}>{kw.text}</span>
                    {kw.status === 'allocated' && !kw.pageId && (
                      <button
                        onClick={() => createPageFromKeyword(kw)}
                        style={{ 
                          padding: '0.25rem 0.5rem', 
                          backgroundColor: '#10b981', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '0.25rem',
                          cursor: 'pointer',
                          fontSize: '0.75rem'
                        }}
                      >
                        Create Page
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <MainLayout>
      <div style={{ padding: '1rem' }}>
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          marginBottom: '2rem',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <button
            onClick={() => setView('pages')}
            style={{ 
              padding: '0.5rem 1rem', 
              backgroundColor: 'transparent',
              color: view === 'pages' ? '#4f46e5' : '#6b7280', 
              border: 'none', 
              borderBottom: view === 'pages' ? '2px solid #4f46e5' : 'none',
              cursor: 'pointer',
              fontWeight: view === 'pages' ? '600' : '400'
            }}
          >
            Pages
          </button>
          <button
            onClick={() => setView('keywords')}
            style={{ 
              padding: '0.5rem 1rem', 
              backgroundColor: 'transparent',
              color: view === 'keywords' ? '#4f46e5' : '#6b7280', 
              border: 'none', 
              borderBottom: view === 'keywords' ? '2px solid #4f46e5' : 'none',
              cursor: 'pointer',
              fontWeight: view === 'keywords' ? '600' : '400'
            }}
          >
            Keywords
          </button>
          <button
            onClick={() => setView('heatmap')}
            style={{ 
              padding: '0.5rem 1rem', 
              backgroundColor: 'transparent',
              color: view === 'heatmap' ? '#4f46e5' : '#6b7280', 
              border: 'none', 
              borderBottom: view === 'heatmap' ? '2px solid #4f46e5' : 'none',
              cursor: 'pointer',
              fontWeight: view === 'heatmap' ? '600' : '400'
            }}
          >
            Heatmap
          </button>
        </div>

        {view === 'pages' && renderPagesView()}
        {view === 'keywords' && renderKeywordsView()}
        {view === 'heatmap' && (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <h3>Keyword Heatmap</h3>
            <p style={{ color: '#6b7280' }}>Visual heatmap of keyword conflicts coming soon...</p>
          </div>
        )}

        {showKeywordAllocation && (
          <KeywordAllocationInterface
            onClose={() => setShowKeywordAllocation(false)}
            clientId={selectedClient}
          />
        )}
      </div>
    </MainLayout>
  );
}
