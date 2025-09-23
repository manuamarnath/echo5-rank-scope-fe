import React, { useEffect, useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { listSuggestions, generateSuggestions, acceptSuggestion } from '../services/keywordMapService';

function KeywordMapPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const clientId = typeof window !== 'undefined' ? localStorage.getItem('client_id') || '' : '';

  async function load() {
    setLoading(true);
    try {
      const r = await listSuggestions(clientId);
      setItems(r.data || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Keyword Map</h1>
      <button onClick={() => generateSuggestions(clientId).then(load)}>Generate Suggestions</button>
      {loading && <div>Loading...</div>}
      <ul>
        {items.map(i => (
          <li key={i._id}>
            <strong>{i.text}</strong> — {i.intent} — score {i.score}
            <button onClick={() => acceptSuggestion(i._id).then(load)}>Accept</button>
            <button onClick={() => { /* TODO: dismiss */ }}>Dismiss</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

KeywordMapPage.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};

export default KeywordMapPage;
