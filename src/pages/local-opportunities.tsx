import React, { useEffect, useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { listLocalOpportunities, generateLocalOpportunities, acceptOpportunity, dismissOpportunity } from '../../services/localOpportunitiesService';

export default function LocalOpportunities() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const token = (typeof window !== 'undefined' && (localStorage as any).auth_token) || '';
      const qs = '';
      const res = await fetch(`/api/local-opportunities${qs}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      const data = await res.json();
      setItems(data.data || []);
    } catch (err) {
      console.error('Failed to load opportunities', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <MainLayout>
      <div style={{ padding: 24 }}>
        <h1>Local Opportunities</h1>
        <p>Generate and review suggested local pages for clients.</p>

        <div style={{ marginBottom: 12 }}>
          <button onClick={async () => {
            const clientId = prompt('Enter clientId to generate for');
            if (!clientId) return;
            setGenerating(true);
            try {
              const result = await generateLocalOpportunities(clientId);
              if (result && result.jobId) {
                alert(`Generation enqueued (job ${result.jobId}) — refresh in a moment`);
              } else if (result && result.error) {
                alert(`Error: ${result.error}`);
              } else {
                alert('Generation enqueued — refresh in a moment');
              }
              load();
            } catch (err) {
              console.error(err);
              alert('Failed to enqueue generation');
            } finally {
              setGenerating(false);
            }
          }} disabled={generating}>{generating ? 'Generating…' : 'Generate for client'}</button>
        </div>

        {loading ? <div>Loading…</div> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Service</th>
                <th>City</th>
                <th>URL</th>
                <th>Primary KW</th>
                <th>Score</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it: any) => (
                <tr key={it._id}>
                  <td>{it.serviceName}</td>
                  <td>{it.locationSlug}</td>
                  <td>{it.suggestedUrl}</td>
                  <td>{it.primaryKeyword}</td>
                  <td>{Math.round((it.score || 0) * 100)}</td>
                  <td>
                    <button onClick={() => alert('Preview not implemented')}>Preview</button>
                    <button onClick={async () => {
                      const token = (typeof window !== 'undefined' && (localStorage as any).auth_token) || '';
                      await fetch(`/api/local-opportunities/${it._id}/accept`, { method: 'POST', headers: token ? { Authorization: `Bearer ${token}` } : {} });
                      alert('Accepted (skeleton)');
                      load();
                    }}>Accept</button>
                    <button onClick={async () => {
                      const token = (typeof window !== 'undefined' && (localStorage as any).auth_token) || '';
                      await fetch(`/api/local-opportunities/${it._id}/dismiss`, { method: 'POST', headers: token ? { Authorization: `Bearer ${token}` } : {} });
                      setItems(items.filter((x: any) => x._id !== it._id));
                    }}>Dismiss</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </MainLayout>
  );
}
