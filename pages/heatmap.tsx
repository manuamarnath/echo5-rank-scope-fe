import React, { useEffect, useState } from 'react';
import MainLayout from '../src/components/layout/MainLayout';
import ClientSelector from '../components/ClientSelector';

type CoverageItem = { pageId: string; title?: string; slug?: string; type?: string; status?: string; counts: { primary:number; secondary:number; supporting:number }; rankHealth: { currentAvg:number|null; bestAvg:number|null } };

type Gaps = { unmappedKeywords: { _id:string; text:string; intent?:string; geo?:string }[]; pagesWithoutPrimary: { _id:string; title?:string; slug?:string; type?:string }[] };

export default function HeatmapPage() {
  const [clientId, setClientId] = useState('');
  const [coverage, setCoverage] = useState<CoverageItem[]>([]);
  const [gaps, setGaps] = useState<Gaps>({ unmappedKeywords: [], pagesWithoutPrimary: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|undefined>();

  const load = async () => {
    if (!clientId) return;
    setLoading(true); setError(undefined);
    try {
      const auth = { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` } as any;
      const [cRes, gRes] = await Promise.all([
        fetch(`/api/heatmap/coverage?clientId=${encodeURIComponent(clientId)}`, { headers: auth }),
        fetch(`/api/heatmap/gaps?clientId=${encodeURIComponent(clientId)}`, { headers: auth })
      ]);
      const [cData, gData] = await Promise.all([cRes.json(), gRes.json()]);
      if (!cRes.ok) throw new Error(cData.error || 'Failed to load coverage');
      if (!gRes.ok) throw new Error(gData.error || 'Failed to load gaps');
      setCoverage(cData.pages || []);
      setGaps(gData);
    } catch (e:any) { setError(e.message || 'Failed to load'); } finally { setLoading(false); }
  };

  useEffect(()=>{ if (clientId) load(); }, [clientId]);

  return (
    <MainLayout>
      <div style={{ padding: 16 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Coverage Heatmap</h1>
        <div style={{ display: 'flex', gap: 8, margin: '12px 0', alignItems: 'flex-end' }}>
          <ClientSelector value={clientId} onChange={setClientId} />
          <button onClick={load} disabled={!clientId || loading} style={{ padding: '8px 12px' }}>Load</button>
        </div>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        {loading && <div>Loading…</div>}

        <div style={{ marginTop: 12 }}>
          <h2 style={{ fontWeight: 700 }}>By Page</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: '8px 4px' }}>Page</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: '8px 4px' }}>Counts</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: '8px 4px' }}>Rank health</th>
              </tr>
            </thead>
            <tbody>
              {coverage.map(p => (
                <tr key={p.pageId}>
                  <td style={{ borderBottom: '1px solid #f5f5f5', padding: '6px 4px' }}>
                    <div style={{ fontWeight: 600 }}>{p.title || p.slug || p.pageId}</div>
                    <div style={{ color: '#666', fontSize: 12 }}>{p.type} · {p.status}</div>
                  </td>
                  <td style={{ borderBottom: '1px solid #f5f5f5', padding: '6px 4px' }}>
                    P:{p.counts.primary} · S:{p.counts.secondary} · Sup:{p.counts.supporting}
                  </td>
                  <td style={{ borderBottom: '1px solid #f5f5f5', padding: '6px 4px' }}>
                    current≈{p.rankHealth.currentAvg ?? '—'} · best≈{p.rankHealth.bestAvg ?? '—'}
                  </td>
                </tr>
              ))}
              {coverage.length === 0 && (
                <tr><td colSpan={3} style={{ padding: 8, color: '#999' }}>No data</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 16 }}>
          <h2 style={{ fontWeight: 700 }}>Gaps</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Unmapped Keywords</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {gaps.unmappedKeywords.map(k => <span key={k._id} style={{ background: '#fff7ed', border: '1px solid #fed7aa', padding: '2px 6px', borderRadius: 4 }}>{k.text}</span>)}
                {gaps.unmappedKeywords.length === 0 && <span style={{ color: '#999' }}>None</span>}
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Pages Without Primary</div>
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                {gaps.pagesWithoutPrimary.map(p => <li key={p._id}>{p.title || p.slug || p._id}</li>)}
                {gaps.pagesWithoutPrimary.length === 0 && <li style={{ color: '#999' }}>None</li>}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
