import React, { useMemo, useState } from 'react';
import { Box, Button, Typography, Table, TableHead, TableRow, TableCell, TableBody, Select, MenuItem, Chip } from '@mui/material';

type Metrics = {
  url: string;
  strategy: 'mobile' | 'desktop';
  performanceScore: number | null;
  firstContentfulPaint?: number | null;
  largestContentfulPaint?: number | null;
  cumulativeLayoutShift?: number | null;
  totalBlockingTime?: number | null;
  speedIndex?: number | null;
  timeToInteractive?: number | null;
  fetchedAt?: string;
};

type BatchItem = {
  clientId: string;
  clientName: string;
  website: string;
  metrics?: Metrics;
  error?: { status?: number; message?: string } | string;
};

type Row = {
  clientId: string;
  clientName: string;
  website: string;
  mobile?: Metrics;
  desktop?: Metrics;
  errorMobile?: { status?: number; message?: string } | string;
  errorDesktop?: { status?: number; message?: string } | string;
};

function scoreColor(score?: number | null) {
  if (typeof score !== 'number') return '#9e9e9e'; // grey
  if (score >= 90) return '#2e7d32'; // success.main
  if (score >= 50) return '#ed6c02'; // warning.main
  return '#d32f2f'; // error.main
}

function ScoreRing({ score, label, size = 44 }: { score?: number | null; label?: string; size?: number }) {
  const radius = (size - 10) / 2; // padding for stroke
  const stroke = 6;
  const circumference = 2 * Math.PI * radius;
  const pct = typeof score === 'number' ? Math.max(0, Math.min(100, score)) : 0;
  const dash = (pct / 100) * circumference;
  const color = scoreColor(score);

  return (
    <Box position="relative" width={size} height={size} display="inline-flex" alignItems="center" justifyContent="center">
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#e0e0e0" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${dash} ${circumference - dash}`}
          strokeLinecap="round"
        />
      </svg>
      <Box position="absolute" textAlign="center">
        <Typography variant="caption" sx={{ lineHeight: 1 }}>{label}</Typography>
        <Typography variant="body2" sx={{ lineHeight: 1, fontWeight: 600 }}>
          {typeof score === 'number' ? score : '—'}
        </Typography>
      </Box>
    </Box>
  );
}

const fmtMs = (v?: number | null) => (typeof v === 'number' ? Math.round(v) : '—');
const fmtCLS = (v?: number | null) => (typeof v === 'number' ? v.toFixed(3) : '—');

export default function PerformancePage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [strategy, setStrategy] = useState<'mobile' | 'desktop' | 'both'>('mobile');

  const runBatch = async () => {
    setLoading(true);
    try {
      if (strategy === 'both') {
        const [respM, respD] = await Promise.all([
          fetch(`/api/pagespeed-local/batch?strategy=mobile`),
          fetch(`/api/pagespeed-local/batch?strategy=desktop`),
        ]);
        const [jsonM, jsonD] = await Promise.all([respM.json(), respD.json()]);
        const map = new Map<string, Row>();
        const add = (items: BatchItem[], kind: 'mobile' | 'desktop') => {
          for (const it of items || []) {
            const existing = map.get(it.clientId) || { clientId: it.clientId, clientName: it.clientName, website: it.website };
            if (it.metrics) {
              (existing as any)[kind] = it.metrics as Metrics;
            }
            if (it.error) {
              (existing as any)[`error${kind === 'mobile' ? 'Mobile' : 'Desktop'}`] = it.error;
            }
            map.set(it.clientId, existing as Row);
          }
        };
        add(jsonM.results || [], 'mobile');
        add(jsonD.results || [], 'desktop');
        setRows(Array.from(map.values()));
      } else {
        const resp = await fetch(`/api/pagespeed-local/batch?strategy=${strategy}`);
        const json = await resp.json();
        const items: Row[] = (json.results || []).map((it: BatchItem) => ({
          clientId: it.clientId,
          clientName: it.clientName,
          website: it.website,
          mobile: strategy === 'mobile' ? it.metrics : undefined,
          desktop: strategy === 'desktop' ? it.metrics : undefined,
          errorMobile: strategy === 'mobile' ? it.error : undefined,
          errorDesktop: strategy === 'desktop' ? it.error : undefined,
        }));
        setRows(items);
      }
    } catch (e) {
      console.error('Batch run failed', e);
    } finally {
      setLoading(false);
    }
  };

  const modeLabel = useMemo(() => (strategy === 'both' ? 'Mobile + Desktop' : strategy === 'mobile' ? 'Mobile' : 'Desktop'), [strategy]);

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Performance (Local Lighthouse)</Typography>
      <Box display="flex" alignItems="center" gap={2} mb={2}>
        <Select size="small" value={strategy} onChange={(e) => setStrategy(e.target.value as any)}>
          <MenuItem value="mobile">Mobile</MenuItem>
          <MenuItem value="desktop">Desktop</MenuItem>
          <MenuItem value="both">Both</MenuItem>
        </Select>
        <Button variant="contained" onClick={runBatch} disabled={loading}>
          {loading ? 'Running…' : `Run Lighthouse for all clients (${modeLabel})`}
        </Button>
      </Box>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Client</TableCell>
            <TableCell>Website</TableCell>
            <TableCell>Score{strategy === 'both' ? 's' : ''}</TableCell>
            <TableCell>FCP (ms)</TableCell>
            <TableCell>LCP (ms)</TableCell>
            <TableCell>CLS</TableCell>
            <TableCell>TBT (ms)</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((r) => {
            const status = (() => {
              const okM = !!r.mobile && !r.errorMobile;
              const okD = !!r.desktop && !r.errorDesktop;
              if (strategy === 'both') {
                if (okM && okD) return 'OK';
                if (okM || okD) return 'Partial';
                return 'Error';
              }
              return (strategy === 'mobile' ? okM : okD) ? 'OK' : 'Error';
            })();

            return (
              <TableRow key={r.clientId}>
                <TableCell>{r.clientName}</TableCell>
                <TableCell>{r.website}</TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    {strategy !== 'desktop' && <ScoreRing score={r.mobile?.performanceScore} label="M" />}
                    {strategy !== 'mobile' && <ScoreRing score={r.desktop?.performanceScore} label="D" />}
                  </Box>
                </TableCell>
                <TableCell>
                  {strategy === 'both' ? (
                    <Box display="flex" flexDirection="column">
                      <Typography variant="caption">M: {fmtMs(r.mobile?.firstContentfulPaint)}</Typography>
                      <Typography variant="caption">D: {fmtMs(r.desktop?.firstContentfulPaint)}</Typography>
                    </Box>
                  ) : (
                    fmtMs((strategy === 'mobile' ? r.mobile : r.desktop)?.firstContentfulPaint)
                  )}
                </TableCell>
                <TableCell>
                  {strategy === 'both' ? (
                    <Box display="flex" flexDirection="column">
                      <Typography variant="caption">M: {fmtMs(r.mobile?.largestContentfulPaint)}</Typography>
                      <Typography variant="caption">D: {fmtMs(r.desktop?.largestContentfulPaint)}</Typography>
                    </Box>
                  ) : (
                    fmtMs((strategy === 'mobile' ? r.mobile : r.desktop)?.largestContentfulPaint)
                  )}
                </TableCell>
                <TableCell>
                  {strategy === 'both' ? (
                    <Box display="flex" flexDirection="column">
                      <Typography variant="caption">M: {fmtCLS(r.mobile?.cumulativeLayoutShift)}</Typography>
                      <Typography variant="caption">D: {fmtCLS(r.desktop?.cumulativeLayoutShift)}</Typography>
                    </Box>
                  ) : (
                    fmtCLS((strategy === 'mobile' ? r.mobile : r.desktop)?.cumulativeLayoutShift)
                  )}
                </TableCell>
                <TableCell>
                  {strategy === 'both' ? (
                    <Box display="flex" flexDirection="column">
                      <Typography variant="caption">M: {fmtMs(r.mobile?.totalBlockingTime)}</Typography>
                      <Typography variant="caption">D: {fmtMs(r.desktop?.totalBlockingTime)}</Typography>
                    </Box>
                  ) : (
                    fmtMs((strategy === 'mobile' ? r.mobile : r.desktop)?.totalBlockingTime)
                  )}
                </TableCell>
                <TableCell>
                  {status === 'OK' ? (
                    <Chip size="small" color="success" label={status} />
                  ) : status === 'Partial' ? (
                    <Chip size="small" color="warning" label={status} />
                  ) : (
                    <Chip size="small" color="error" label={status} />
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Box>
  );
}
