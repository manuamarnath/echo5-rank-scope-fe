import React, { useState } from 'react';

interface Keyword {
  keyword: string;
  searchVolume?: number;
  difficulty?: number;
  intent?: 'informational' | 'transactional' | 'navigational' | 'local';
}

interface KeywordSelectorProps {
  availableKeywords: Keyword[];
  selectedKeywords: Keyword[];
  onKeywordSelectionChange: (keywords: Keyword[]) => void;
  maxSelections?: number;
  pageName?: string;
  service?: string;
}

export default function KeywordSelector({
  availableKeywords,
  selectedKeywords,
  onKeywordSelectionChange,
  maxSelections = 8,
  pageName = '',
  service = ''
}: KeywordSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterByRelevance, setFilterByRelevance] = useState(false);
  const [sortBy, setSortBy] = useState<'relevance' | 'volume' | 'difficulty' | 'alphabetical'>('relevance');

  const getRelevanceScore = (keyword: string, pageName: string, service: string): number => {
    const keywordLower = keyword.toLowerCase();
    const pageNameLower = pageName.toLowerCase();
    const serviceLower = service.toLowerCase();
    let score = 0;
    
    // Exact matches get highest score
    if (keywordLower.includes(pageNameLower)) score += 10;
    if (keywordLower.includes(serviceLower)) score += 10;
    
    // Partial matches
    const pageWords = pageNameLower.split(' ');
    const serviceWords = serviceLower.split(' ');
    
    pageWords.forEach(word => {
      if (word.length > 2 && keywordLower.includes(word)) score += 3;
    });
    
    serviceWords.forEach(word => {
      if (word.length > 2 && keywordLower.includes(word)) score += 3;
    });
    
    return score;
  };

  // Filter and sort keywords
  const filteredKeywords = availableKeywords
    .filter(keyword => {
      const matchesSearch = keyword.keyword.toLowerCase().includes(searchTerm.toLowerCase());
      if (!filterByRelevance) return matchesSearch;
      
      // Check relevance to page name and service
      const keywordLower = keyword.keyword.toLowerCase();
      const pageNameLower = pageName.toLowerCase();
      const serviceLower = service.toLowerCase();
      
      return matchesSearch && (
        keywordLower.includes(pageNameLower) ||
        keywordLower.includes(serviceLower) ||
        pageNameLower.includes(keywordLower.split(' ')[0]) ||
        serviceLower.includes(keywordLower.split(' ')[0])
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'volume':
          return (b.searchVolume || 0) - (a.searchVolume || 0);
        case 'difficulty':
          return (a.difficulty || 0) - (b.difficulty || 0);
        case 'alphabetical':
          return a.keyword.localeCompare(b.keyword);
        case 'relevance':
        default:
          const scoreA = getRelevanceScore(a.keyword, pageName, service);
          const scoreB = getRelevanceScore(b.keyword, pageName, service);
          return scoreB - scoreA;
      }
    });

  const handleKeywordToggle = (keyword: Keyword) => {
    const isSelected = selectedKeywords.some(k => k.keyword === keyword.keyword);
    
    if (isSelected) {
      // Remove keyword
      const newSelection = selectedKeywords.filter(k => k.keyword !== keyword.keyword);
      onKeywordSelectionChange(newSelection);
    } else if (selectedKeywords.length < maxSelections) {
      // Add keyword
      const newSelection = [...selectedKeywords, keyword];
      onKeywordSelectionChange(newSelection);
    }
  };

  const getDifficultyStyles = (difficulty: number) => {
    if (difficulty <= 30) return { backgroundColor: '#D1FAE5', color: '#065F46' };
    if (difficulty <= 60) return { backgroundColor: '#FEF3C7', color: '#92400E' };
    return { backgroundColor: '#FEE2E2', color: '#991B1B' };
  };

  return (
    <div style={{
      border: '1px solid #E5E7EB',
      borderRadius: '8px',
      padding: '20px',
      backgroundColor: 'white',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '8px'
        }}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            🎯 Select Target Keywords
            <span style={{
              backgroundColor: '#F3F4F6',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 'normal'
            }}>
              {selectedKeywords.length}/{maxSelections} selected
            </span>
          </h3>
        </div>
        <div style={{ fontSize: '14px', color: '#6B7280' }}>
          Choose up to {maxSelections} keywords to target for <strong>{pageName}</strong> ({service})
        </div>
      </div>
      
      {/* Search and Filter Controls */}
      <div style={{ 
        display: 'flex', 
        gap: '12px', 
        alignItems: 'center',
        marginBottom: '16px',
        flexWrap: 'wrap'
      }}>
        <input
          type="text"
          placeholder="Search keywords..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            padding: '8px 12px',
            border: '1px solid #D1D5DB',
            borderRadius: '6px',
            fontSize: '14px',
            minWidth: '200px'
          }}
        />
        
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px' }}>
          <input
            type="checkbox"
            checked={filterByRelevance}
            onChange={(e) => setFilterByRelevance(e.target.checked)}
          />
          Show relevant only
        </label>
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          style={{
            padding: '8px 12px',
            border: '1px solid #D1D5DB',
            borderRadius: '6px',
            fontSize: '14px'
          }}
        >
          <option value="relevance">Sort by Relevance</option>
          <option value="volume">Sort by Volume</option>
          <option value="difficulty">Sort by Difficulty</option>
          <option value="alphabetical">Sort A-Z</option>
        </select>
      </div>

      {/* Selected Keywords */}
      {selectedKeywords.length > 0 && (
        <div style={{
          padding: '12px',
          backgroundColor: '#EBF8FF',
          borderRadius: '6px',
          marginBottom: '16px'
        }}>
          <h4 style={{ 
            fontSize: '14px', 
            fontWeight: '500', 
            color: '#1E40AF',
            margin: '0 0 8px 0'
          }}>
            Selected Keywords:
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
            {selectedKeywords.map((keyword, index) => (
              <span
                key={keyword.keyword}
                onClick={() => handleKeywordToggle(keyword)}
                style={{
                  backgroundColor: index === 0 ? '#3B82F6' : '#9CA3AF',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {index === 0 && '🎯 '}
                {keyword.keyword}
                {index === 0 && ' (Primary)'}
                <span style={{ marginLeft: '4px' }}>×</span>
              </span>
            ))}
          </div>
          <div style={{ fontSize: '12px', color: '#1E40AF' }}>
            <strong>Primary:</strong> {selectedKeywords[0]?.keyword || 'None'} • 
            <strong> Secondary:</strong> {selectedKeywords.slice(1, 4).map(k => k.keyword).join(', ') || 'None'}
          </div>
        </div>
      )}

      {/* Keyword List */}
      <div style={{ 
        maxHeight: '400px', 
        overflowY: 'auto',
        border: '1px solid #E5E7EB',
        borderRadius: '6px'
      }}>
        {filteredKeywords.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px', 
            color: '#9CA3AF' 
          }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔍</div>
            <p>No keywords found</p>
            <p style={{ fontSize: '14px' }}>Try adjusting your search or filters</p>
          </div>
        ) : (
          filteredKeywords.map((keyword) => {
            const isSelected = selectedKeywords.some(k => k.keyword === keyword.keyword);
            const canSelect = !isSelected && selectedKeywords.length < maxSelections;
            const relevanceScore = getRelevanceScore(keyword.keyword, pageName, service);
            
            return (
              <div
                key={keyword.keyword}
                onClick={() => (isSelected || canSelect) && handleKeywordToggle(keyword)}
                style={{
                  padding: '12px',
                  borderBottom: '1px solid #F3F4F6',
                  cursor: (isSelected || canSelect) ? 'pointer' : 'not-allowed',
                  backgroundColor: isSelected 
                    ? '#EBF8FF' 
                    : canSelect 
                      ? 'white'
                      : '#F9FAFB',
                  opacity: (isSelected || canSelect) ? 1 : 0.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (isSelected || canSelect) {
                    e.currentTarget.style.backgroundColor = isSelected ? '#DBEAFE' : '#F9FAFB';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = isSelected 
                    ? '#EBF8FF' 
                    : canSelect 
                      ? 'white'
                      : '#F9FAFB';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    disabled={!isSelected && !canSelect}
                    readOnly
                    style={{ margin: 0 }}
                  />
                  
                  <div>
                    <div style={{ 
                      fontWeight: '500', 
                      color: '#111827',
                      marginBottom: '4px'
                    }}>
                      {keyword.keyword}
                      {keyword.intent && (
                        <span style={{ 
                          marginLeft: '8px', 
                          fontSize: '12px',
                          color: '#6B7280'
                        }}>
                          {keyword.intent === 'transactional' && '🎯'}
                          {keyword.intent === 'local' && '📍'}
                          {keyword.intent === 'informational' && '❓'}
                          {keyword.intent === 'navigational' && '🧭'}
                        </span>
                      )}
                    </div>
                    
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px',
                      fontSize: '12px',
                      color: '#6B7280'
                    }}>
                      {keyword.searchVolume && (
                        <span>📊 {keyword.searchVolume.toLocaleString()}</span>
                      )}
                      
                      {keyword.difficulty && (
                        <span style={{
                          padding: '2px 6px',
                          borderRadius: '3px',
                          fontSize: '11px',
                          ...getDifficultyStyles(keyword.difficulty)
                        }}>
                          KD: {keyword.difficulty}
                        </span>
                      )}
                      
                      {relevanceScore > 0 && (
                        <span style={{
                          padding: '2px 6px',
                          borderRadius: '3px',
                          fontSize: '11px',
                          backgroundColor: '#F3E8FF',
                          color: '#7C3AED'
                        }}>
                          Relevance: {relevanceScore}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      
      {/* Quick Actions */}
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        paddingTop: '16px',
        borderTop: '1px solid #E5E7EB'
      }}>
        <button
          onClick={() => {
            // Auto-select most relevant keywords
            const relevant = filteredKeywords
              .filter(k => getRelevanceScore(k.keyword, pageName, service) > 0)
              .slice(0, maxSelections);
            onKeywordSelectionChange(relevant);
          }}
          style={{
            padding: '6px 12px',
            border: '1px solid #D1D5DB',
            borderRadius: '4px',
            backgroundColor: 'white',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          Auto-select Relevant
        </button>
        
        <button
          onClick={() => {
            // Select high-volume, low-difficulty keywords
            const optimal = filteredKeywords
              .filter(k => (k.searchVolume || 0) > 100 && (k.difficulty || 100) < 50)
              .slice(0, maxSelections);
            onKeywordSelectionChange(optimal);
          }}
          style={{
            padding: '6px 12px',
            border: '1px solid #D1D5DB',
            borderRadius: '4px',
            backgroundColor: 'white',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          High-Volume/Low-Difficulty
        </button>
        
        <button
          onClick={() => onKeywordSelectionChange([])}
          style={{
            padding: '6px 12px',
            border: '1px solid #D1D5DB',
            borderRadius: '4px',
            backgroundColor: 'white',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          Clear All
        </button>
      </div>
    </div>
  );
}