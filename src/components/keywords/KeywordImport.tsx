import { useState, useRef } from 'react';

interface KeywordData {
  keyword: string;
  searchVolume?: number;
  difficulty?: number;
  intent?: 'informational' | 'transactional' | 'navigational' | 'local';
  source: 'csv' | 'gsc' | 'manual';
}

interface KeywordImportProps {
  onKeywordsImported: (keywords: KeywordData[]) => void;
  onCancel: () => void;
}

export default function KeywordImport({ onKeywordsImported, onCancel }: KeywordImportProps) {
  const [importMethod, setImportMethod] = useState<'csv' | 'gsc' | 'manual'>('csv');
  const [manualKeywords, setManualKeywords] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewKeywords, setPreviewKeywords] = useState<KeywordData[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const csvContent = e.target?.result as string;
          processCSVData(csvContent);
        } catch (error) {
          console.error('Error parsing CSV:', error);
          alert('Error parsing CSV file. Please check the format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const processCSVData = (csvContent: string) => {
    const lines = csvContent.split('\n').filter(line => line.trim());
    const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
    
    // Find column indices
    const keywordIndex = headers.findIndex(h => 
      h.includes('keyword') || h.includes('query') || h.includes('term')
    );
    const volumeIndex = headers.findIndex(h => 
      h.includes('volume') || h.includes('searches') || h.includes('impressions')
    );
    const difficultyIndex = headers.findIndex(h => 
      h.includes('difficulty') || h.includes('competition') || h.includes('kd')
    );

    if (keywordIndex === -1) {
      alert('Could not find keyword column. Please ensure your CSV has a column with "keyword", "query", or "term" in the header.');
      return;
    }

    const keywords: KeywordData[] = lines.slice(1).map(line => {
      const columns = line.split(',').map(col => col.trim().replace(/"/g, ''));
      return {
        keyword: columns[keywordIndex] || '',
        searchVolume: volumeIndex !== -1 ? parseInt(columns[volumeIndex]) || undefined : undefined,
        difficulty: difficultyIndex !== -1 ? parseFloat(columns[difficultyIndex]) || undefined : undefined,
        source: 'csv' as const
      };
    }).filter(k => k.keyword.length > 0);

    setPreviewKeywords(keywords);
    setShowPreview(true);
  };

  const processManualKeywords = () => {
    const keywords: KeywordData[] = manualKeywords
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(keyword => ({
        keyword,
        source: 'manual' as const
      }));

    setPreviewKeywords(keywords);
    setShowPreview(true);
  };

  const handleGSCImport = async () => {
    setIsProcessing(true);
    try {
      // This would integrate with Google Search Console API
      // For now, we'll show a placeholder
      alert('Google Search Console integration coming soon! Please use CSV import for now.');
    } catch (error) {
      console.error('GSC import error:', error);
      alert('Failed to import from Google Search Console');
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmImport = () => {
    onKeywordsImported(previewKeywords);
  };

  const renderImportMethod = () => {
    switch (importMethod) {
      case 'csv':
        return (
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem' }}>
              CSV File Upload
            </h4>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
              Upload a CSV file with your keywords. The file should have columns for keywords, 
              and optionally search volume and difficulty/competition data.
            </p>
            <div style={{ marginBottom: '1rem' }}>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                Choose CSV File
              </button>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
              <strong>Expected CSV format:</strong><br />
              Header row with columns like: keyword, search_volume, difficulty<br />
              Example: &quot;seo services&quot;, 1000, 45
            </div>
          </div>
        );

      case 'gsc':
        return (
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem' }}>
              Google Search Console Import
            </h4>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
              Import your existing search queries and performance data from Google Search Console.
            </p>
            <button
              type="button"
              onClick={handleGSCImport}
              disabled={isProcessing}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: isProcessing ? '#9ca3af' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem'
              }}
            >
              {isProcessing ? 'Connecting...' : 'Import from GSC'}
            </button>
          </div>
        );

      case 'manual':
        return (
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem' }}>
              Manual Entry
            </h4>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
              Enter keywords manually, one per line.
            </p>
            <textarea
              value={manualKeywords}
              onChange={(e) => setManualKeywords(e.target.value)}
              rows={10}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                marginBottom: '1rem'
              }}
              placeholder="Enter keywords, one per line:
seo services
digital marketing
website optimization"
            />
            <button
              type="button"
              onClick={processManualKeywords}
              disabled={!manualKeywords.trim()}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: manualKeywords.trim() ? '#10b981' : '#9ca3af',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: manualKeywords.trim() ? 'pointer' : 'not-allowed',
                fontSize: '0.875rem'
              }}
            >
              Process Keywords
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  if (showPreview) {
    return (
      <div style={{
        padding: '1.5rem',
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        border: '1px solid #d1d5db'
      }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
          Keyword Import Preview
        </h3>
        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
          Found {previewKeywords.length} keywords. Review and confirm the import.
        </p>
        
        <div style={{
          maxHeight: '300px',
          overflowY: 'auto',
          border: '1px solid #e5e7eb',
          borderRadius: '0.375rem',
          marginBottom: '1.5rem'
        }}>
          <table style={{ width: '100%', fontSize: '0.875rem' }}>
            <thead style={{ backgroundColor: '#f9fafb' }}>
              <tr>
                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                  Keyword
                </th>
                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                  Volume
                </th>
                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                  Difficulty
                </th>
                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                  Source
                </th>
              </tr>
            </thead>
            <tbody>
              {previewKeywords.slice(0, 50).map((keyword, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '0.75rem' }}>{keyword.keyword}</td>
                  <td style={{ padding: '0.75rem' }}>{keyword.searchVolume || '-'}</td>
                  <td style={{ padding: '0.75rem' }}>{keyword.difficulty || '-'}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      backgroundColor: keyword.source === 'csv' ? '#dbeafe' : '#d1fae5',
                      color: keyword.source === 'csv' ? '#1e40af' : '#166534',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem'
                    }}>
                      {keyword.source.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {previewKeywords.length > 50 && (
            <div style={{ padding: '0.75rem', textAlign: 'center', color: '#6b7280', fontSize: '0.875rem' }}>
              ... and {previewKeywords.length - 50} more keywords
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={() => setShowPreview(false)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#f3f4f6',
              color: '#374151',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            Back
          </button>
          <button
            type="button"
            onClick={confirmImport}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            Import {previewKeywords.length} Keywords
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      padding: '1.5rem',
      backgroundColor: 'white',
      borderRadius: '0.5rem',
      border: '1px solid #d1d5db'
    }}>
      <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
        Import Seed Keywords
      </h3>
      <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1.5rem' }}>
        Import your seed keywords to get started with keyword research and allocation.
      </p>

      {/* Import Method Selection */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          {[
            { value: 'csv', label: 'CSV Upload' },
            { value: 'gsc', label: 'Google Search Console' },
            { value: 'manual', label: 'Manual Entry' }
          ].map((method) => (
            <button
              key={method.value}
              type="button"
              onClick={() => setImportMethod(method.value as 'csv' | 'gsc' | 'manual')}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: importMethod === method.value ? '#3b82f6' : '#f3f4f6',
                color: importMethod === method.value ? 'white' : '#374151',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              {method.label}
            </button>
          ))}
        </div>

        {renderImportMethod()}
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#f3f4f6',
            color: '#374151',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontSize: '0.875rem'
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}