import { useState } from 'react';

interface Keyword {
  id: string;
  text: string;
  intent: 'informational' | 'navigational' | 'commercial' | 'transactional';
  searchVolume?: number;
  difficulty?: number;
  geo?: string;
  allocatedTo?: string;
  role?: 'owner' | 'employee' | 'client';
  status: 'pending' | 'allocated' | 'in-progress' | 'completed';
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'employee' | 'client';
}

interface KeywordAllocationProps {
  onClose?: () => void;
  clientId?: string;
}

export default function KeywordAllocationInterface({ onClose, clientId }: KeywordAllocationProps) {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [bulkText, setBulkText] = useState('');
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [allocationTarget, setAllocationTarget] = useState('');
  const [allocationRole, setAllocationRole] = useState<'owner' | 'employee' | 'client'>('employee');
  const [processing, setProcessing] = useState(false);
  const [view, setView] = useState<'upload' | 'allocate' | 'manage'>('upload');

  // Mock team members - in real app, this would come from API
  const teamMembers: TeamMember[] = [
    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'owner' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'employee' },
    { id: '3', name: 'Client User', email: 'client@example.com', role: 'client' },
  ];

  const processKeywords = () => {
    if (!bulkText.trim()) return;

    const keywordLines = bulkText.split('\n').filter(line => line.trim());
    const newKeywords: Keyword[] = keywordLines.map((line, index) => {
      // Parse potential CSV format: keyword, intent, volume, difficulty, geo
      const parts = line.split(',').map(part => part.trim());
      const keyword = parts[0];
      
      return {
        id: `kw-${Date.now()}-${index}`,
        text: keyword,
        intent: (parts[1] as any) || 'informational',
        searchVolume: parts[2] ? parseInt(parts[2]) : undefined,
        difficulty: parts[3] ? parseInt(parts[3]) : undefined,
        geo: parts[4] || undefined,
        status: 'pending' as const
      };
    });

    setKeywords(prev => [...prev, ...newKeywords]);
    setBulkText('');
  };

  const allocateSelectedKeywords = () => {
    if (!allocationTarget || selectedKeywords.length === 0) return;

    setProcessing(true);

    // Simulate processing with progress
    setTimeout(() => {
      setKeywords(prev => prev.map(kw => 
        selectedKeywords.includes(kw.id)
          ? { ...kw, allocatedTo: allocationTarget, role: allocationRole, status: 'allocated' as const }
          : kw
      ));
      
      setSelectedKeywords([]);
      setProcessing(false);
      
      // TODO: Call backend API to trigger BullMQ worker
      console.log('Keywords allocated and processing started');
    }, 2000);
  };

  const toggleKeywordSelection = (keywordId: string) => {
    setSelectedKeywords(prev => 
      prev.includes(keywordId)
        ? prev.filter(id => id !== keywordId)
        : [...prev, keywordId]
    );
  };

  const getIntentColor = (intent: string) => {
    switch (intent) {
      case 'informational': return '#3b82f6';
      case 'navigational': return '#10b981';
      case 'commercial': return '#f59e0b';
      case 'transactional': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#6b7280';
      case 'allocated': return '#3b82f6';
      case 'in-progress': return '#f59e0b';
      case 'completed': return '#10b981';
      default: return '#6b7280';
    }
  };

  const renderUploadView = () => (
    <div>
      <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
        Upload Keywords
      </h3>
      <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
        Add keywords one per line, or use CSV format: keyword, intent, volume, difficulty, geo
      </p>
      
      <textarea
        value={bulkText}
        onChange={(e) => setBulkText(e.target.value)}
        rows={10}
        style={{ 
          width: '100%', 
          padding: '0.75rem', 
          border: '1px solid #d1d5db', 
          borderRadius: '0.375rem',
          fontSize: '0.875rem',
          fontFamily: 'monospace'
        }}
        placeholder="SEO services
content marketing, commercial, 1200, 45, New York
digital marketing agency, commercial, 2300, 67, USA
how to improve SEO, informational, 890, 32"
      />
      
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
        <button
          onClick={processKeywords}
          disabled={!bulkText.trim()}
          style={{ 
            padding: '0.5rem 1rem', 
            backgroundColor: bulkText.trim() ? '#4f46e5' : '#9ca3af', 
            color: 'white', 
            border: 'none', 
            borderRadius: '0.375rem',
            cursor: bulkText.trim() ? 'pointer' : 'not-allowed'
          }}
        >
          Process Keywords
        </button>
        <button
          onClick={() => setView('allocate')}
          disabled={keywords.length === 0}
          style={{ 
            padding: '0.5rem 1rem', 
            backgroundColor: keywords.length > 0 ? '#10b981' : '#9ca3af', 
            color: 'white', 
            border: 'none', 
            borderRadius: '0.375rem',
            cursor: keywords.length > 0 ? 'pointer' : 'not-allowed'
          }}
        >
          Allocate Keywords ({keywords.length})
        </button>
      </div>
    </div>
  );

  const renderAllocationView = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>
          Allocate Keywords
        </h3>
        <button
          onClick={() => setView('upload')}
          style={{ 
            padding: '0.25rem 0.5rem', 
            backgroundColor: '#f3f4f6', 
            color: '#374151', 
            border: 'none', 
            borderRadius: '0.25rem',
            cursor: 'pointer',
            fontSize: '0.875rem'
          }}
        >
          ← Back to Upload
        </button>
      </div>

      <div style={{ 
        display: 'grid', 
        gap: '1rem', 
        gridTemplateColumns: '1fr 300px',
        marginBottom: '1rem'
      }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
            Assign to Team Member
          </label>
          <select
            value={allocationTarget}
            onChange={(e) => setAllocationTarget(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '0.5rem', 
              border: '1px solid #d1d5db', 
              borderRadius: '0.375rem' 
            }}
          >
            <option value="">Select team member...</option>
            {teamMembers.map(member => (
              <option key={member.id} value={member.id}>
                {member.name} ({member.role})
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
            Role
          </label>
          <select
            value={allocationRole}
            onChange={(e) => setAllocationRole(e.target.value as any)}
            style={{ 
              width: '100%', 
              padding: '0.5rem', 
              border: '1px solid #d1d5db', 
              borderRadius: '0.375rem' 
            }}
          >
            <option value="owner">Owner</option>
            <option value="employee">Employee</option>
            <option value="client">Client</option>
          </select>
        </div>
      </div>

      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
          {selectedKeywords.length} keywords selected
        </span>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setSelectedKeywords(keywords.map(kw => kw.id))}
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
            Select All
          </button>
          <button
            onClick={() => setSelectedKeywords([])}
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
            Clear
          </button>
          <button
            onClick={allocateSelectedKeywords}
            disabled={!allocationTarget || selectedKeywords.length === 0 || processing}
            style={{ 
              padding: '0.25rem 0.5rem', 
              backgroundColor: (!allocationTarget || selectedKeywords.length === 0 || processing) ? '#9ca3af' : '#4f46e5', 
              color: 'white', 
              border: 'none', 
              borderRadius: '0.25rem',
              cursor: (!allocationTarget || selectedKeywords.length === 0 || processing) ? 'not-allowed' : 'pointer',
              fontSize: '0.75rem'
            }}
          >
            {processing ? 'Processing...' : 'Allocate'}
          </button>
        </div>
      </div>

      <div style={{ 
        maxHeight: '400px', 
        overflowY: 'auto',
        border: '1px solid #e5e7eb',
        borderRadius: '0.375rem'
      }}>
        {keywords.map((keyword) => (
          <div
            key={keyword.id}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              padding: '0.75rem', 
              borderBottom: '1px solid #f3f4f6',
              backgroundColor: selectedKeywords.includes(keyword.id) ? '#eff6ff' : 'white',
              cursor: 'pointer'
            }}
            onClick={() => toggleKeywordSelection(keyword.id)}
          >
            <input
              type="checkbox"
              checked={selectedKeywords.includes(keyword.id)}
              onChange={() => {}}
              style={{ marginRight: '0.75rem' }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>
                {keyword.text}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ 
                  fontSize: '0.75rem', 
                  padding: '0.125rem 0.375rem', 
                  backgroundColor: getIntentColor(keyword.intent) + '20',
                  color: getIntentColor(keyword.intent),
                  borderRadius: '0.25rem'
                }}>
                  {keyword.intent}
                </span>
                <span style={{ 
                  fontSize: '0.75rem', 
                  padding: '0.125rem 0.375rem', 
                  backgroundColor: getStatusColor(keyword.status) + '20',
                  color: getStatusColor(keyword.status),
                  borderRadius: '0.25rem'
                }}>
                  {keyword.status}
                </span>
                {keyword.searchVolume && (
                  <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    Vol: {keyword.searchVolume.toLocaleString()}
                  </span>
                )}
                {keyword.difficulty && (
                  <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    KD: {keyword.difficulty}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ 
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{ 
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        padding: '2rem',
        maxWidth: '60rem',
        width: '90%',
        maxHeight: '80vh',
        overflowY: 'auto'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '2rem' 
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            Keyword Allocation System
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              style={{ 
                padding: '0.5rem', 
                backgroundColor: '#f3f4f6', 
                color: '#374151', 
                border: 'none', 
                borderRadius: '0.25rem',
                cursor: 'pointer'
              }}
            >
              ✕ Close
            </button>
          )}
        </div>

        {view === 'upload' && renderUploadView()}
        {view === 'allocate' && renderAllocationView()}
      </div>
    </div>
  );
}