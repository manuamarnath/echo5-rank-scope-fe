import React, { useEffect, useState } from 'react';
import MainLayout from '../src/components/layout/MainLayout';
import ClientSelector from '../components/ClientSelector';
import {
  Box,
  Stack,
  Typography,
  Button,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Chip,
  Tooltip,
  IconButton,
  LinearProgress,
  Divider,
  Paper,
  Snackbar,
  Alert
} from '@mui/material';
import {
  ArrowUpward,
  ArrowDownward,
  Build,
  CheckCircle,
  Close as CloseIcon,
  NoteAdd
} from '@mui/icons-material';

type Keyword = { _id: string; text: string; role: 'primary'|'secondary'|'supporting'|null; pageId?: string; intent?: string; geo?: string };
type PageBucket = { pageId: string; title?: string; slug?: string; type?: string; status?: string; primaryKeyword: Keyword|null; secondaryKeywords: Keyword[]; supportingKeywords: Keyword[] };

export default function KeywordsMapPage() {
  const [clientId, setClientId] = useState<string>('');
  const [pages, setPages] = useState<PageBucket[]>([]);
  const [unmapped, setUnmapped] = useState<Keyword[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|undefined>();
  const [toast, setToast] = useState<{open:boolean; message:string; severity:'success'|'error'|'info'|'warning'}>({open:false, message:'', severity:'success'});

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
      setToast({ open: true, message: 'Allocation updated', severity: 'success' });
      await fetchMap();
    } catch (e:any) {
      setToast({ open: true, message: e.message || 'Failed to allocate', severity: 'error' });
    }
  };

  const acceptSuggestion = async (id: string) => {
    try {
      const r = await fetch(`/api/keyword-map/${id}/accept`, { method: 'POST', headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` } });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Failed to accept');
      setToast({ open: true, message: 'Suggestion accepted', severity: 'success' });
      await fetchMap();
    } catch (e:any) { setToast({ open: true, message: e.message || 'Failed to accept', severity: 'error' }); }
  };

  const dismissSuggestion = async (id: string) => {
    try {
      const r = await fetch(`/api/keyword-map/${id}/dismiss`, { method: 'POST', headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` } });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Failed to dismiss');
      setToast({ open: true, message: 'Suggestion dismissed', severity: 'success' });
      await fetchMap();
    } catch (e:any) { setToast({ open: true, message: e.message || 'Failed to dismiss', severity: 'error' }); }
  };

  const createPageFromKeyword = async (keywordId: string) => {
    try {
      const r = await fetch(`/api/heatmap/pages/from-keyword/${keywordId}`, { method: 'POST', headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` } });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Failed to create page');
      setToast({ open: true, message: 'Page created from keyword', severity: 'success' });
      await fetchMap();
    } catch (e:any) { setToast({ open: true, message: e.message || 'Failed to create page', severity: 'error' }); }
  };

  const fixCannibalization = async (pageId: string) => {
    try {
      const r = await fetch(`/api/heatmap/pages/${pageId}/fix-cannibalization`, { method: 'POST', headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` } });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Failed to fix');
      setToast({ open: true, message: 'Cannibalization fixed', severity: 'success' });
      await fetchMap();
    } catch (e:any) { setToast({ open: true, message: e.message || 'Failed to fix', severity: 'error' }); }
  };

  const generateSupporting = async (pageId: string) => {
    try {
      const r = await fetch(`/api/keyword-map/generate-supporting`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` },
        body: JSON.stringify({ clientId, pageId })
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Failed to generate');
      setToast({ open: true, message: `Created ${data.created || 0} supporting suggestions`, severity: 'success' });
      await fetchMap();
    } catch (e:any) { setToast({ open: true, message: e.message || 'Failed to generate', severity: 'error' }); }
  };

  const generateLocalized = async (pageId: string) => {
    try {
      const r = await fetch(`/api/keyword-map/generate-localized`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` },
        body: JSON.stringify({ clientId, pageId })
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Failed to generate');
      setToast({ open: true, message: `Created ${data.created || 0} localized suggestions`, severity: 'success' });
      await fetchMap();
    } catch (e:any) { setToast({ open: true, message: e.message || 'Failed to generate', severity: 'error' }); }
  };

  const bulkBlogBriefs = async (pageId: string) => {
    try {
      // naive: plan from first 5 supporting keywords for now
      const page = pages.find(p => String(p.pageId) === String(pageId));
      const kwIds = (page?.supportingKeywords || []).slice(0,5).map(k => k._id);
      if (!kwIds.length) { setToast({ open: true, message: 'No supporting keywords to plan from', severity: 'info' }); return; }
      const r = await fetch('/api/blog-ideas/plan-from-keywords', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` },
        body: JSON.stringify({ clientId, keywordIds: kwIds, titleTemplate: 'Guide to {keyword}' })
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Failed to create ideas');
      setToast({ open: true, message: `Created ${data.data?.length || 0} ideas`, severity: 'success' });
    } catch (e:any) { setToast({ open: true, message: e.message || 'Failed to create ideas', severity: 'error' }); }
  };

  return (
    <MainLayout>
      <Box sx={{ p: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="h5" fontWeight={700}>Keyword Map</Typography>
          <Stack direction="row" spacing={1} alignItems="flex-end">
            <ClientSelector value={clientId} onChange={setClientId} />
            <Button variant="contained" onClick={fetchMap} disabled={!clientId || loading}>Load</Button>
          </Stack>
        </Stack>

        {loading && <LinearProgress sx={{ mb: 2 }} />}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        )}

        <Grid container spacing={2}>
          {pages.map(p => (
            <Grid item xs={12} key={p.pageId}>
              <Card variant="outlined">
                <CardHeader
                  title={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="h6" fontWeight={600}>{p.title || p.slug || p.pageId}</Typography>
                      <Chip size="small" label={p.type || '—'} variant="outlined" />
                      <Chip size="small" label={p.status || '—'} color={p.status === 'published' ? 'success' : 'default'} variant="outlined" />
                    </Stack>
                  }
                  action={p.primaryKeyword ? (
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Chip color="primary" label={`Primary: ${p.primaryKeyword.text}`} />
                      <Tooltip title="Demote to Secondary">
                        <span>
                          <IconButton aria-label="demote" onClick={()=> allocate(p.primaryKeyword!._id, String(p.pageId), 'secondary')}>
                            <ArrowDownward />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="Fix Cannibalization">
                        <IconButton aria-label="fix" onClick={()=> fixCannibalization(String(p.pageId))}>
                          <Build />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  ) : (
                    <Chip label="No primary keyword" size="small" />
                  )}
                />
                <CardContent>
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={1}>
                      <Button size="small" variant="outlined" onClick={()=>generateSupporting(String(p.pageId))}>Add Supporting (AI)</Button>
                      <Button size="small" variant="outlined" onClick={()=>generateLocalized(String(p.pageId))}>Generate Localized</Button>
                      <Button size="small" variant="contained" onClick={()=>bulkBlogBriefs(String(p.pageId))}>Create Blog Briefs</Button>
                    </Stack>
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>Secondary</Typography>
                      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                        {p.secondaryKeywords.map(k => (
                          <Chip
                            key={k._id}
                            label={k.text}
                            color="secondary"
                            variant="outlined"
                            onDelete={() => allocate(k._id, String(p.pageId), 'primary')}
                            deleteIcon={
                              <Tooltip title="Promote to Primary"><ArrowUpward /></Tooltip>
                            }
                          />
                        ))}
                        {p.secondaryKeywords.length === 0 && <Typography color="text.secondary">None</Typography>}
                      </Stack>
                    </Box>

                    <Divider />

                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>Supporting</Typography>
                      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                        {p.supportingKeywords.map(k => (
                          <Chip
                            key={k._id}
                            label={k.text}
                            color="success"
                            variant="outlined"
                            onDelete={() => allocate(k._id, String(p.pageId), 'secondary')}
                            deleteIcon={
                              <Tooltip title="Move to Secondary"><ArrowUpward /></Tooltip>
                            }
                          />
                        ))}
                        {p.supportingKeywords.length === 0 && <Typography color="text.secondary">None</Typography>}
                      </Stack>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h6" fontWeight={700}>Unmapped Keywords</Typography>
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 1 }}>
                {unmapped.map(k => (
                  <Chip
                    key={k._id}
                    label={k.text}
                    variant="outlined"
                    onDelete={() => createPageFromKeyword(k._id)}
                    deleteIcon={
                      <Tooltip title="Create Page"><NoteAdd /></Tooltip>
                    }
                  />
                ))}
                {unmapped.length === 0 && <Typography color="text.secondary">None</Typography>}
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h6" fontWeight={700}>Suggestions</Typography>
              <Stack spacing={1} sx={{ mt: 1 }}>
                {suggestions.map(s => (
                  <Paper key={s._id} variant="outlined" sx={{ p: 1.5 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
                      <Box>
                        <Typography fontWeight={600}>{s.text}</Typography>
                        <Typography variant="caption" color="text.secondary">{s.intent} {s.geo ? `· ${s.geo}` : ''}</Typography>
                      </Box>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="Accept">
                          <IconButton color="success" onClick={()=>acceptSuggestion(s._id)}>
                            <CheckCircle />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Dismiss">
                          <IconButton color="inherit" onClick={()=>dismissSuggestion(s._id)}>
                            <CloseIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Stack>
                  </Paper>
                ))}
                {suggestions.length === 0 && <Typography color="text.secondary">None</Typography>}
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        <Snackbar open={toast.open} autoHideDuration={3000} onClose={()=>setToast(prev=>({ ...prev, open:false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert onClose={()=>setToast(prev=>({ ...prev, open:false }))} severity={toast.severity} sx={{ width: '100%' }}>
            {toast.message}
          </Alert>
        </Snackbar>
      </Box>
    </MainLayout>
  );
}
