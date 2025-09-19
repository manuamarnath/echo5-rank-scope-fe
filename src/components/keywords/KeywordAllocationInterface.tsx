import React, { useState, useEffect } from 'react';

interface Keyword {
  id?: string;
  _id?: string;
  text: string;
  intent?: string;
  searchVolume?: number;
  difficulty?: number;
  geo?: string;
  allocatedTo?: string;
  role?: 'owner' | 'employee' | 'client';
  status?: 'pending' | 'allocated' | 'in-progress' | 'completed';
  isPrimary?: boolean;
}

interface Client {
  _id: string;
  name: string;
  industry: string;
  website?: string;
  locations?: Array<{
    city: string;
    state: string;
    country: string;
    radius?: number;
    radiusUnit?: string;
  }>;
  services?: string[];
  competitors?: string[];
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
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [clientKeywords, setClientKeywords] = useState<Keyword[]>([]);

  // Mock team members - in real app, this would come from API
  const teamMembers: TeamMember[] = [
    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'owner' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'employee' },
    { id: '3', name: 'Client User', email: 'client@example.com', role: 'client' },
  ];

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (selectedClientId) {
      fetchClientKeywords(selectedClientId);
    } else {
      setClientKeywords([]);
    }
  }, [selectedClientId]);

  const fetchClients = async () => {
    try {
      let response = await fetch('/api/clients/demo');
      if (!response.ok) {
        response = await fetch('http://localhost:5000/clients/demo');
      }
      if (response.ok) {
        const data = await response.json();
        setClients(data);
      } else {
        setClients([]);
      }
    } catch (error) {
      setClients([]);
    }
  };

  const fetchClientKeywords = async (clientId: string) => {
    try {
      const response = await fetch(`/api/keywords?clientId=${clientId}`);
      if (response.ok) {
        const data = await response.json();
        setClientKeywords(data);
      } else {
        setClientKeywords([]);
      }
    } catch (error) {
      setClientKeywords([]);
    }
  };

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

  const renderUploadView = () => (
    <div>
      <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
        Upload Keywords
      </h3>
      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
        Select Client
      </label>
      <select
        value={selectedClientId}
        onChange={e => setSelectedClientId(e.target.value)}
        style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', marginBottom: '1rem' }}
      >
        <option value="">Select client...</option>
        {clients.map(client => (
          <option key={client._id} value={client._id}>{client.name}</option>
        ))}
      </select>
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
        placeholder={"SEO services\ncontent marketing, commercial, 1200, 45, New York\ndigital marketing agency, commercial, 2300, 67, USA\nhow to improve SEO, informational, 890, 32"}
      />
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
        <button
          onClick={processKeywords}
          disabled={!bulkText.trim() || !selectedClientId}
          style={{ 
            padding: '0.5rem 1rem', 
            backgroundColor: bulkText.trim() && selectedClientId ? '#4f46e5' : '#9ca3af', 
            color: 'white', 
            border: 'none', 
            borderRadius: '0.375rem',
            cursor: bulkText.trim() && selectedClientId ? 'pointer' : 'not-allowed'
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
      <div style={{ marginBottom: '1rem' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>Onboarding Keywords for Selected Client</h4>
        {clientKeywords.length === 0 ? (
          <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>No onboarding keywords found for this client.</div>
        ) : (
          <div style={{ maxHeight: '120px', overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: '0.375rem', marginBottom: '1rem' }}>
            {clientKeywords.map((kw) => (
              <div key={kw.id || kw._id} style={{ padding: '0.5rem', borderBottom: '1px solid #f3f4f6' }}>
                <span style={{ fontWeight: '500' }}>{kw.text}</span>
                {kw.isPrimary ? (
                  <span style={{ marginLeft: '0.5rem', color: '#3b82f6', fontSize: '0.75rem' }}>Primary</span>
                ) : (
                  <span style={{ marginLeft: '0.5rem', color: '#10b981', fontSize: '0.75rem' }}>Seed</span>
                )}
                {kw.intent && (
                  <span style={{ marginLeft: '0.5rem', color: '#6b7280', fontSize: '0.75rem' }}>{kw.intent}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Allocation UI goes here */}
    </div>
  );

  return (
    <div style={{ 
      backgroundColor: '#F9FAFB',
      minHeight: '100vh',
      padding: onClose ? '0' : '24px' // Only add padding if not used as modal
    }}>
      <div style={{ 
        backgroundColor: 'white',
        borderRadius: onClose ? '0.5rem' : '12px',
        padding: '2rem',
        maxWidth: onClose ? '60rem' : '1200px',
        width: onClose ? '90%' : '100%',
        margin: onClose ? '0' : '0 auto',
        maxHeight: onClose ? '80vh' : 'none',
        overflowY: onClose ? 'auto' : 'visible',
        ...(onClose ? {
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1000,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        } : {
          border: '1px solid #E5E7EB'
        })
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
      {/* Modal backdrop only when used as modal */}
      {onClose && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 999
        }} onClick={onClose} />
      )}
    </div>
  );
}