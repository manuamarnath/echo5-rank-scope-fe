import React, { useEffect, useMemo, useState } from 'react';
import { fetchClients } from '../services/briefService';

type Client = { _id: string; name: string };

interface ClientSelectorProps {
  value?: string;
  onChange: (clientId: string) => void;
  label?: string;
  placeholder?: string;
  autoLoad?: boolean;
  disabled?: boolean;
  allowClear?: boolean;
}

export default function ClientSelector({
  value,
  onChange,
  label = 'Select Client',
  placeholder = 'Choose a client…',
  autoLoad = true,
  disabled = false,
  allowClear = true,
}: ClientSelectorProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [search, setSearch] = useState('');

  const loadClients = async () => {
    setLoading(true); setError(undefined);
    try {
      const data = await fetchClients();
      const normalized: Client[] = (Array.isArray(data) ? data : []).map((c: any) => ({ _id: c._id, name: c.name || c.domain || c._id }));
      setClients(normalized);
    } catch (e: any) {
      setError(e?.message || 'Failed to load clients');
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (autoLoad) loadClients(); }, [autoLoad]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter(c => (c.name || '').toLowerCase().includes(q) || c._id.toLowerCase().includes(q));
  }, [clients, search]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 320 }}>
        {label && (
          <label style={{ fontSize: 12, color: '#374151' }}>{label}</label>
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled || loading}
            style={{
              flex: 1,
              padding: '10px',
              border: '1px solid #D1D5DB',
              borderRadius: 6,
              minWidth: 260,
              background: loading ? '#f9fafb' : 'white',
              opacity: disabled ? 0.6 : 1,
            }}
          >
            <option value="">{placeholder}</option>
            {filtered.map(c => (
              <option key={c._id} value={c._id}>{c.name} ({c._id.slice(0,6)}…)</option>
            ))}
          </select>
          {allowClear && (
            <button
              type="button"
              onClick={() => onChange('')}
              disabled={!value || disabled}
              style={{ padding: '10px 12px', border: '1px solid #E5E7EB', background: 'white', borderRadius: 6 }}
            >
              Clear
            </button>
          )}
        </div>
        {error && <span style={{ color: '#B91C1C', fontSize: 12 }}>{error}</span>}
      </div>
      <input
        type="text"
        value={search}
        placeholder="Search clients…"
        onChange={(e) => setSearch(e.target.value)}
        disabled={disabled || loading}
        style={{ padding: '10px', border: '1px solid #D1D5DB', borderRadius: 6, minWidth: 220 }}
      />
      <button
        type="button"
        onClick={loadClients}
        disabled={loading}
        style={{ padding: '10px 12px', border: '1px solid #E5E7EB', background: 'white', borderRadius: 6 }}
      >
        {loading ? 'Loading…' : 'Refresh'}
      </button>
    </div>
  );
}
