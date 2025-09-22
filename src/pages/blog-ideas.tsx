import React, { useEffect, useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { listBlogIdeas, generateBlogIdeas } from '../services/blogIdeasService';

function BlogIdeasPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const clientId = typeof window !== 'undefined' ? localStorage.getItem('client_id') || '' : '';

  async function load() {
    setLoading(true);
    try {
      const r = await listBlogIdeas(clientId);
      setItems(r.data || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Blog Ideas</h1>
      <button onClick={() => generateBlogIdeas(clientId).then(load)}>Generate Ideas</button>
      {loading && <div>Loading...</div>}
      <ul>
        {items.map(i => (
          <li key={i._id}>
            <strong>{i.title}</strong> — {i.summary}
          </li>
        ))}
      </ul>
    </div>
  );
}

BlogIdeasPage.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};

export default BlogIdeasPage;
