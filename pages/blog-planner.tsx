import React, { useEffect, useState } from 'react';
import MainLayout from '../src/components/layout/MainLayout';
import ClientSelector from '../components/ClientSelector';

export default function BlogPlannerPage() {
  const [clientId, setClientId] = useState('');
  const [unmapped, setUnmapped] = useState<{ _id:string; text:string }[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [template, setTemplate] = useState('How to {keyword} in 2025');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string|undefined>();

  const loadUnmapped = async () => {
    if (!clientId) return;
    setLoading(true); setMsg(undefined);
    try {
      const r = await fetch(`/api/heatmap/gaps?clientId=${encodeURIComponent(clientId)}`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` } });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Failed to load gaps');
      setUnmapped(data.unmappedKeywords || []);
    } catch (e:any) {
      setMsg(e.message || 'Failed to load');
    } finally { setLoading(false); }
  };

  useEffect(()=>{ if (clientId) loadUnmapped(); }, [clientId]);

  const toggle = (id:string) => {
    setSelected(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  };

  const plan = async () => {
    if (!clientId || selected.size === 0) return;
    setLoading(true); setMsg(undefined);
    try {
      const body = { clientId, keywordIds: Array.from(selected), titleTemplate: template };
      const r = await fetch('/api/blog-ideas/plan-from-keywords', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` }, body: JSON.stringify(body)
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Failed to create ideas');
      setMsg(`Created ${data.data?.length || 0} ideas`);
      setSelected(new Set());
    } catch (e:any) { setMsg(e.message || 'Failed to create ideas'); } finally { setLoading(false); }
  };

  return (
    <MainLayout>
      <div style={{ padding: 16 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Blog Planner</h1>
        <div style={{ display: 'flex', gap: 8, margin: '12px 0', alignItems: 'flex-end' }}>
          <ClientSelector value={clientId} onChange={setClientId} />
          <button onClick={loadUnmapped} disabled={!clientId || loading} style={{ padding: '8px 12px' }}>Load</button>
        </div>
        {msg && <div>{msg}</div>}

        <div style={{ marginTop: 12 }}>
          <div style={{ marginBottom: 8 }}>
            <label style={{ fontWeight: 600, display: 'block', marginBottom: 4 }}>Title template</label>
            <input value={template} onChange={e=>setTemplate(e.target.value)} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 6 }} />
            <div style={{ fontSize: 12, color: '#666' }}>Use {'{keyword}'} placeholder.</div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {unmapped.map(k => (
              <label key={k._id} style={{ border: '1px solid #eee', borderRadius: 6, padding: '6px 8px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <input type="checkbox" checked={selected.has(k._id)} onChange={()=>toggle(k._id)} />
                {k.text}
              </label>
            ))}
            {unmapped.length === 0 && <div style={{ color: '#999' }}>No unmapped keywords</div>}
          </div>
          <div style={{ marginTop: 12 }}>
            <button onClick={plan} disabled={selected.size === 0 || loading} style={{ padding: '8px 12px' }}>Create Blog Ideas</button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
