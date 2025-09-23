export async function listLocalOpportunities(clientId?: string) {
  const qs = clientId ? `?clientId=${clientId}` : '';
  const token = (typeof window !== 'undefined' && (localStorage as any).auth_token) || '';
  const res = await fetch(`/api/local-opportunities${qs}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  try { return await res.json(); } catch (e) { return { error: 'Invalid JSON response' }; }
}

export async function generateLocalOpportunities(clientId: string) {
  const token = (typeof window !== 'undefined' && (localStorage as any).auth_token) || '';
  const res = await fetch('/api/local-opportunities/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify({ clientId })
  });
  try { return await res.json(); } catch (e) { return { error: 'Invalid JSON response' }; }
}

export async function acceptOpportunity(id: string) {
  const token = (typeof window !== 'undefined' && (localStorage as any).auth_token) || '';
  const res = await fetch(`/api/local-opportunities/${id}/accept`, { method: 'POST', headers: token ? { Authorization: `Bearer ${token}` } : {} });
  try { return await res.json(); } catch (e) { return { error: 'Invalid JSON response' }; }
}

export async function dismissOpportunity(id: string) {
  const token = (typeof window !== 'undefined' && (localStorage as any).auth_token) || '';
  const res = await fetch(`/api/local-opportunities/${id}/dismiss`, { method: 'POST', headers: token ? { Authorization: `Bearer ${token}` } : {} });
  try { return await res.json(); } catch (e) { return { error: 'Invalid JSON response' }; }
}
