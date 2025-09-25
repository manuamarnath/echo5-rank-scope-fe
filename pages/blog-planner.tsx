import React, { useEffect, useState } from 'react';
import MainLayout from '../src/components/layout/MainLayout';
import ClientSelector from '../components/ClientSelector';
import {
  Box,
  Stack,
  Typography,
  Button,
  TextField,
  LinearProgress,
  Paper,
  Checkbox,
  FormControlLabel,
  Snackbar,
  Alert
} from '@mui/material';

export default function BlogPlannerPage() {
  const [clientId, setClientId] = useState('');
  const [unmapped, setUnmapped] = useState<{ _id:string; text:string }[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [template, setTemplate] = useState('How to {keyword} in 2025');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string|undefined>();
  const [toast, setToast] = useState<{open:boolean; message:string; severity:'success'|'error'|'info'|'warning'}>({open:false, message:'', severity:'success'});

  const loadUnmapped = async () => {
    if (!clientId) return;
    setLoading(true); setMsg(undefined);
    try {
      const r = await fetch(`/api/heatmap/gaps?clientId=${encodeURIComponent(clientId)}`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` } });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Failed to load gaps');
      setUnmapped(data.unmappedKeywords || []);
      const count = (data.unmappedKeywords || []).length;
      setToast({ open: true, message: `Loaded ${count} unmapped keyword${count===1?'':'s'}` , severity: 'info' });
    } catch (e:any) {
      const message = e.message || 'Failed to load';
      setMsg(message);
      setToast({ open: true, message, severity: 'error' });
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
      const created = data.data?.length || 0;
      setMsg(`Created ${created} ideas`);
      setToast({ open: true, message: `Created ${created} ideas`, severity: 'success' });
      setSelected(new Set());
      // refresh gaps after creation
      loadUnmapped();
    } catch (e:any) {
      const message = e.message || 'Failed to create ideas';
      setMsg(message);
      setToast({ open: true, message, severity: 'error' });
    } finally { setLoading(false); }
  };

  return (
    <MainLayout>
      <Box sx={{ p: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="h5" fontWeight={700}>Blog Planner</Typography>
          <Stack direction="row" spacing={1} alignItems="flex-end">
            <ClientSelector value={clientId} onChange={setClientId} />
            <Button variant="contained" onClick={loadUnmapped} disabled={!clientId || loading}>Load</Button>
          </Stack>
        </Stack>

  {loading && <LinearProgress sx={{ mb: 2 }} />}

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Stack spacing={2}>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Title template</Typography>
              <TextField fullWidth size="small" value={template} onChange={(e)=>setTemplate(e.target.value)} helperText={'Use {keyword} placeholder.'} />
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Unmapped Keywords</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {unmapped.map(k => (
                  <FormControlLabel
                    key={k._id}
                    control={<Checkbox checked={selected.has(k._id)} onChange={()=>toggle(k._id)} />}
                    label={k.text}
                    sx={{ m: 0.5, border: '1px solid', borderColor: 'divider', borderRadius: 1, px: 1, py: 0.5 }}
                  />
                ))}
                {unmapped.length === 0 && <Typography color="text.secondary">No unmapped keywords</Typography>}
              </Box>
            </Box>

            <Stack direction="row" justifyContent="flex-end">
              <Button variant="contained" onClick={plan} disabled={selected.size === 0 || loading}>Create Blog Ideas</Button>
            </Stack>
          </Stack>
        </Paper>

        <Snackbar open={toast.open} autoHideDuration={3000} onClose={()=>setToast(prev=>({ ...prev, open:false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert onClose={()=>setToast(prev=>({ ...prev, open:false }))} severity={toast.severity} sx={{ width: '100%' }}>
            {toast.message}
          </Alert>
        </Snackbar>
      </Box>
    </MainLayout>
  );
}
