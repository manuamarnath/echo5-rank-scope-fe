import React, { useEffect, useState } from 'react';
import MainLayout from '../src/components/layout/MainLayout';
import ClientSelector from '../components/ClientSelector';
import {
  Box,
  Stack,
  Typography,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Tooltip,
  IconButton,
  LinearProgress,
  Paper,
  Snackbar,
  Alert
} from '@mui/material';
import { Build } from '@mui/icons-material';

type CoverageItem = { pageId: string; title?: string; slug?: string; type?: string; status?: string; counts: { primary:number; secondary:number; supporting:number }; rankHealth: { currentAvg:number|null; bestAvg:number|null } };

type Gaps = { unmappedKeywords: { _id:string; text:string; intent?:string; geo?:string }[]; pagesWithoutPrimary: { _id:string; title?:string; slug?:string; type?:string }[] };

export default function HeatmapPage() {
  const [clientId, setClientId] = useState('');
  const [coverage, setCoverage] = useState<CoverageItem[]>([]);
  const [gaps, setGaps] = useState<Gaps>({ unmappedKeywords: [], pagesWithoutPrimary: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|undefined>();
  const [toast, setToast] = useState<{open:boolean; message:string; severity:'success'|'error'|'info'|'warning'}>({open:false, message:'', severity:'success'});

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

  const fixCannibalization = async (pageId: string) => {
    try {
      const r = await fetch(`/api/heatmap/pages/${pageId}/fix-cannibalization`, { method: 'POST', headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` } });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Failed to fix');
      setToast({ open: true, message: 'Cannibalization fixed', severity: 'success' });
      await load();
    } catch (e:any) { setToast({ open: true, message: e.message || 'Failed to fix', severity: 'error' }); }
  };

  return (
    <MainLayout>
      <Box sx={{ p: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="h5" fontWeight={700}>Coverage Heatmap</Typography>
          <Stack direction="row" spacing={1} alignItems="flex-end">
            <ClientSelector value={clientId} onChange={setClientId} />
            <Button variant="contained" onClick={load} disabled={!clientId || loading}>Load</Button>
          </Stack>
        </Stack>

        {loading && <LinearProgress sx={{ mb: 2 }} />}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Paper variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Page</TableCell>
                <TableCell>Counts</TableCell>
                <TableCell>Rank health</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {coverage.map(p => (
                <TableRow key={p.pageId} hover>
                  <TableCell>
                    <Typography fontWeight={600}>{p.title || p.slug || p.pageId}</Typography>
                    <Typography variant="caption" color="text.secondary">{p.type} · {p.status}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip size="small" label={`P: ${p.counts.primary}`} sx={{ mr: 0.5 }} />
                    <Chip size="small" label={`S: ${p.counts.secondary}`} sx={{ mr: 0.5 }} />
                    <Chip size="small" label={`Sup: ${p.counts.supporting}`} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">current≈{p.rankHealth.currentAvg ?? '—'} · best≈{p.rankHealth.bestAvg ?? '—'}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Fix Cannibalization">
                      <span>
                        <IconButton onClick={()=>fixCannibalization(String(p.pageId))}>
                          <Build />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {coverage.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Typography color="text.secondary">No data</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>

        <GridLike />
      </Box>
      <Snackbar open={toast.open} autoHideDuration={3000} onClose={()=>setToast(prev=>({ ...prev, open:false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={()=>setToast(prev=>({ ...prev, open:false }))} severity={toast.severity} sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
}

// Placeholder for potential future grid/visualization section
function GridLike() { return null; }
