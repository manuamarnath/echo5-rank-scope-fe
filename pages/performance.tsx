import React, { useState } from 'react';
import { Box, Button, Typography, Table, TableHead, TableRow, TableCell, TableBody, Select, MenuItem, Chip } from '@mui/material';

type BatchItem = {
  clientId: string;
  clientName: string;
  website: string;
  metrics?: {
    url: string;
    strategy: string;
    performanceScore: number | null;
    firstContentfulPaint?: number | null;
    largestContentfulPaint?: number | null;
    cumulativeLayoutShift?: number | null;
    totalBlockingTime?: number | null;
    speedIndex?: number | null;
    timeToInteractive?: number | null;
    fetchedAt?: string;
  };
  error?: { status?: number; message?: string } | string;
};

export default function PerformancePage() {
  const [rows, setRows] = useState<BatchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [strategy, setStrategy] = useState<'mobile'|'desktop'>('mobile');

  const runBatch = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`/api/pagespeed-local/batch?strategy=${strategy}`);
      const json = await resp.json();
      setRows(json.results || []);
    } catch (e) {
      console.error('Batch run failed', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Performance (Local Lighthouse)</Typography>
      <Box display="flex" alignItems="center" gap={2} mb={2}>
        <Select size="small" value={strategy} onChange={(e) => setStrategy(e.target.value as any)}>
          <MenuItem value="mobile">Mobile</MenuItem>
          <MenuItem value="desktop">Desktop</MenuItem>
        </Select>
        <Button variant="contained" onClick={runBatch} disabled={loading}>
          {loading ? 'Running…' : 'Run Lighthouse for all clients'}
        </Button>
      </Box>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Client</TableCell>
            <TableCell>Website</TableCell>
            <TableCell>Score</TableCell>
            <TableCell>FCP (ms)</TableCell>
            <TableCell>LCP (ms)</TableCell>
            <TableCell>CLS</TableCell>
            <TableCell>TBT (ms)</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((r) => {
            const score = r.metrics?.performanceScore;
            let color: 'default'|'success'|'warning'|'error' = 'default';
            if (typeof score === 'number') {
              if (score >= 90) color = 'success';
              else if (score >= 50) color = 'warning';
              else color = 'error';
            }
            return (
              <TableRow key={r.clientId}>
                <TableCell>{r.clientName}</TableCell>
                <TableCell>{r.website}</TableCell>
                <TableCell>
                  {typeof score === 'number' ? (
                    <Chip label={score} color={color} size="small" />
                  ) : '—'}
                </TableCell>
                <TableCell>{r.metrics?.firstContentfulPaint ?? '—'}</TableCell>
                <TableCell>{r.metrics?.largestContentfulPaint ?? '—'}</TableCell>
                <TableCell>{r.metrics?.cumulativeLayoutShift ?? '—'}</TableCell>
                <TableCell>{r.metrics?.totalBlockingTime ?? '—'}</TableCell>
                <TableCell>{r.error ? 'Error' : 'OK'}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Box>
  );
}
