import config from '../../lib/config';

export async function listSuggestions(clientId: string) {
  const res = await fetch(`${config.apiBaseUrl.replace(/\/$/, '')}/api/keyword-map?clientId=${clientId}`, {
    headers: { 'Content-Type': 'application/json', 'Authorization': typeof window !== 'undefined' ? localStorage.getItem('auth_token') || '' : '' }
  });
  return res.json();
}

export async function generateSuggestions(clientId: string) {
  const res = await fetch(`${config.apiBaseUrl.replace(/\/$/, '')}/api/keyword-map/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': typeof window !== 'undefined' ? localStorage.getItem('auth_token') || '' : '' },
    body: JSON.stringify({ clientId })
  });
  return res.json();
}

export async function acceptSuggestion(id: string) {
  const res = await fetch(`${config.apiBaseUrl.replace(/\/$/, '')}/api/keyword-map/${id}/accept`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': typeof window !== 'undefined' ? localStorage.getItem('auth_token') || '' : '' }
  });
  return res.json();
}
