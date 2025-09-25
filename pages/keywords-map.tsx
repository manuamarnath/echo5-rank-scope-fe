import React, { useEffect, useState } from 'react';
import MainLayout from '../src/components/layout/MainLayout';
import ClientSelector from '../components/ClientSelector';

type Keyword = { _id: string; text: string; role: 'primary'|'secondary'|'supporting'|null; pageId?: string; intent?: string; geo?: string };
type PageBucket = { pageId: string; title?: string; slug?: string; type?: string; status?: string; primaryKeyword: Keyword|null; secondaryKeywords: Keyword[]; supportingKeywords: Keyword[] };

export default function KeywordsMapPage() {
  const [clientId, setClientId] = useState<string>('');
  const [pages, setPages] = useState<PageBucket[]>([]);
  const [unmapped, setUnmapped] = useState<Keyword[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|undefined>();

  const fetchMap = async () => {
    if (!clientId) return;
    setLoading(true); setError(undefined);
    try {
      const url = `/api/keywords/map?clientId=${encodeURIComponent(clientId)}`;
      const r = await fetch(url, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` } });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Failed to load map');
      setPages(data.pages || []);
      setUnmapped(data.unmapped || []);
      setSuggestions(data.suggestions || []);
    } catch (e:any) {
      setError(e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=>{ if (clientId) fetchMap(); }, [clientId]);

  const allocate = async (keywordId: string, pageId: string, role: 'primary'|'secondary'|'supporting') => {
    try {
      const r = await fetch(`/api/keywords/${keywordId}/allocate`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` },
        body: JSON.stringify({ pageId, role })
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Allocation failed');
      await fetchMap();
    } catch (e:any) {
      alert(e.message || 'Failed to allocate');
    }
  };

  return (
    <MainLayout>
      <div style={{ padding: 16 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Keyword Map</h1>
        <div style={{ display: 'flex', gap: 8, margin: '12px 0', alignItems: 'flex-end' }}>
          <ClientSelector value={clientId} onChange={setClientId} />
          <button onClick={fetchMap} disabled={!clientId || loading} style={{ padding: '8px 12px' }}>Load</button>
        </div>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        {loading && <div>Loading…</div>}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
          {pages.map(p => (
            <div key={p.pageId} style={{ border: '1px solid #eee', borderRadius: 8, padding: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{p.title || p.slug || p.pageId}</div>
                  <div style={{ fontSize: 12, color: '#666' }}>{p.type} · {p.status}</div>
                </div>
                {p.primaryKeyword ? (
                  <div>
                    <span style={{ fontWeight: 600 }}>Primary:</span> {p.primaryKeyword.text}
                    <button style={{ marginLeft: 8 }} onClick={()=> allocate(p.primaryKeyword!._id, String(p.pageId), 'secondary')}>Demote</button>
                  </div>
                ) : (
                  <div style={{ color: '#999' }}>No primary keyword</div>
                )}
              </div>
              <div style={{ marginTop: 8 }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>Secondary</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {p.secondaryKeywords.map(k => (
                    <span key={k._id} style={{ background: '#eef2ff', border: '1px solid #c7d2fe', padding: '2px 6px', borderRadius: 4 }}>
                      {k.text}
                      <button style={{ marginLeft: 6 }} onClick={()=> allocate(k._id, String(p.pageId), 'primary')}>Promote</button>
                    </span>
                  ))}
                  {p.secondaryKeywords.length === 0 && <span style={{ color: '#999' }}>None</span>}
                </div>
              </div>
              <div style={{ marginTop: 8 }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>Supporting</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {p.supportingKeywords.map(k => (
                    <span key={k._id} style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '2px 6px', borderRadius: 4 }}>
                      {k.text}
                      <button style={{ marginLeft: 6 }} onClick={()=> allocate(k._id, String(p.pageId), 'secondary')}>To Secondary</button>
                    </span>
                  ))}
                  {p.supportingKeywords.length === 0 && <span style={{ color: '#999' }}>None</span>}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 16 }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Unmapped Keywords</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            {unmapped.map(k => (
              <span key={k._id} style={{ background: '#fff7ed', border: '1px solid #fed7aa', padding: '2px 6px', borderRadius: 4 }}>
                {k.text}
              </span>
            ))}
            {unmapped.length === 0 && <div style={{ color: '#999' }}>None</div>}
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Suggestions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
            {suggestions.map(s => (
              <div key={s._id} style={{ display: 'flex', justifyContent: 'space-between', border: '1px dashed #ddd', padding: 8, borderRadius: 6 }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{s.text}</div>
                  <div style={{ fontSize: 12, color: '#666' }}>{s.intent} {s.geo ? `· ${s.geo}` : ''}</div>
                </div>
                <div>
                  <button disabled title="Accept via Keyword Suggestions page">Accept</button>
                </div>
              </div>
            ))}
            {suggestions.length === 0 && <div style={{ color: '#999' }}>None</div>}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
