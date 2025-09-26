import React, { useEffect, useMemo, useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  LinearProgress,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Download as DownloadIcon,
  Error as ErrorIcon,
  ExpandMore as ExpandMoreIcon,
  Info as InfoIcon,
  Launch as LaunchIcon,
  Search as SearchIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

interface AuditPage {
  url: string;
  statusCode: number;
  statusText?: string;
  title: string;
  titleLength?: number;
  metaDescription: string;
  metaDescriptionLength?: number;
  h1: string[];
  h2?: string[];
  h3?: string[];
  h4?: string[];
  h5?: string[];
  h6?: string[];
  wordCount: number;
  responseTime: number;
  contentLength: number;
  internalLinks: Array<{
    url: string;
    anchorText: string;
    nofollow: boolean;
  }>;
  externalLinks: Array<{
    url: string;
    anchorText: string;
    nofollow: boolean;
  }>;
  images: Array<{
    src: string;
    alt: string;
    width?: number;
    height?: number;
  }>;
  seoIssues?: {
    titleMissing: boolean;
    titleTooShort: boolean;
    titleTooLong: boolean;
    descriptionMissing: boolean;
    descriptionTooShort: boolean;
    descriptionTooLong: boolean;
    h1Missing: boolean;
    h1Multiple: boolean;
    imagesWithoutAlt: number;
  };
  socialMeta?: {
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
  };
  crawlDepth?: number;
}

interface AuditDetails {
  _id: string;
  name: string;
  baseUrl: string;
  status: string;
  summary?: {
    totalPages: number;
    crawledPages: number;
    errorPages: number;
    averageResponseTime: number;
  };
  issues?: {
    missingTitles: number;
    missingDescriptions: number;
    brokenLinks: number;
    duplicateTitles: number;
  };
  crawledUrls: AuditPage[];
}

interface AuditViewerProps {
  auditId: string;
  onClose: () => void;
}

const ISSUE_FILTERS = [
  { value: 'missing-title', label: 'Missing Title', count: 0 },
  { value: 'missing-description', label: 'Missing Description', count: 0 },
  { value: 'missing-h1', label: 'Missing H1', count: 0 },
  { value: 'multiple-h1', label: 'Multiple H1', count: 0 },
];

const AuditViewer: React.FC<AuditViewerProps> = ({ auditId, onClose }) => {
  // Core state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [audit, setAudit] = useState<AuditDetails | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  // Pages list state
  const [search, setSearch] = useState('');
  const [statusCodeFilter, setStatusCodeFilter] = useState('');
  const [issueFilter, setIssueFilter] = useState('');
  const [sortBy, setSortBy] = useState('url');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [pages, setPages] = useState<AuditPage[]>([]);
  const [pagesLoading, setPagesLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Detail dialog
  const [pageDetailsOpen, setPageDetailsOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState<AuditPage | null>(null);

  // Search states for tabs
  const [internalSearch, setInternalSearch] = useState('');
  const [externalSearch, setExternalSearch] = useState('');
  const [imagesSearch, setImagesSearch] = useState('');
  const [titleSearch, setTitleSearch] = useState('');
  const [metaSearch, setMetaSearch] = useState('');
  const [h1Search, setH1Search] = useState('');
  const [headingLevel, setHeadingLevel] = useState<'h1'|'h2'|'h3'|'h4'|'h5'|'h6'>('h1');
  const [selectedStatusCode, setSelectedStatusCode] = useState('');

  // PageSpeed (local Lighthouse)
  const [psiLoading, setPsiLoading] = useState(false);
  const [psiMobile, setPsiMobile] = useState<any>(null);
  const [psiDesktop, setPsiDesktop] = useState<any>(null);

  // Fetch audit
  const loadAudit = async () => {
    try {
      if (!auditId) return;
      setError('');
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`/api/audits/${auditId}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(`Failed to fetch audit (${res.status})`);
      const data = await res.json();
      setAudit(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadAudit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auditId]);

  // Fetch pages list
  const loadPages = async () => {
    if (!auditId) return;
    try {
      setPagesLoading(true);
      const token = localStorage.getItem('auth_token');
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusCodeFilter) {
        const parts = statusCodeFilter.split(',').map(s => s.trim()).filter(Boolean);
        if (parts.length > 1) {
          parts.forEach(c => params.append('statusCode', c));
        } else {
          params.set('statusCode', statusCodeFilter);
        }
      }
      if (issueFilter) params.set('issueType', issueFilter);
      if (sortBy) params.set('sortBy', sortBy);
      params.set('page', String(page + 1));
      params.set('limit', String(rowsPerPage));
      const res = await fetch(`/api/audits/${auditId}/pages?${params.toString()}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(`Failed to fetch pages (${res.status})`);
      const data = await res.json();
      // Backend returns { data: [...], pagination: { total } }
      const pagesData: AuditPage[] = data.pages || data.data || [];
      const total = (data.pagination?.total ?? data.total ?? pagesData.length) as number;
      setPages(pagesData);
      setTotalCount(total);
    } catch (e) {
      setError((e as Error)?.message || 'Failed to load pages');
    } finally {
      setPagesLoading(false);
    }
  };

  useEffect(() => {
    loadPages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auditId, search, statusCodeFilter, issueFilter, sortBy, page, rowsPerPage]);

  // Poll while crawling
  useEffect(() => {
    if (!audit || audit.status === 'completed') return;
    const id = setInterval(() => {
      loadAudit();
      loadPages();
    }, 5000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audit?.status, search, statusCodeFilter, issueFilter, sortBy, page, rowsPerPage]);

  const getStatusColor = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) return 'success' as const;
    if (statusCode >= 300 && statusCode < 400) return 'info' as const;
    if (statusCode >= 400 && statusCode < 500) return 'warning' as const;
    if (statusCode >= 500) return 'error' as const;
    return 'default' as const;
  };

  const getIssueIcon = (hasIssue: boolean) => (
    hasIssue ? <ErrorIcon color="error" fontSize="small" /> : <CheckCircleIcon color="success" fontSize="small" />
  );

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => setActiveTab(newValue);
  const handlePageClick = (p: AuditPage) => { setSelectedPage(p); setPageDetailsOpen(true); };
  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); };

  const handleExportCsv = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`/api/audits/${auditId}/export`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(`Export failed (${res.status})`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-${auditId}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      setError((e as Error)?.message || 'Export failed');
    }
  };

  // Derived data from full crawl for analysis tabs
  const allPages: AuditPage[] = useMemo(() => audit?.crawledUrls || [], [audit]);
  const internalLinksFlat = useMemo(() => allPages.flatMap(p => (p.internalLinks || []).map(l => ({ from: p.url, to: l.url, anchorText: l.anchorText, nofollow: l.nofollow }))), [allPages]);
  const externalLinksFlat = useMemo(() => allPages.flatMap(p => (p.externalLinks || []).map(l => ({ from: p.url, to: l.url, anchorText: l.anchorText, nofollow: l.nofollow }))), [allPages]);
  const imagesFlat = useMemo(() => allPages.flatMap(p => (p.images || []).map(img => ({ page: p.url, src: img.src, alt: img.alt, width: img.width, height: img.height, altMissing: !img.alt }))), [allPages]);
  const pageMap = useMemo(() => {
    const m = new Map<string, AuditPage>();
    allPages.forEach(p => m.set(p.url, p));
    return m;
  }, [allPages]);
  const errorUrlSet = useMemo(() => new Set(allPages.filter(p => (p.statusCode || 0) >= 400).map(p => p.url)), [allPages]);
  const brokenInternalRows = useMemo(() => {
    const rows: { from: string; to: string; anchorText: string; status: number }[] = [];
    for (const p of allPages) {
      for (const l of p.internalLinks || []) {
        if (errorUrlSet.has(l.url)) {
          rows.push({ from: p.url, to: l.url, anchorText: l.anchorText, status: pageMap.get(l.url)?.statusCode || 0 });
        }
      }
    }
    return rows;
  }, [allPages, errorUrlSet, pageMap]);
  const canonicalRobotsRows = useMemo(() => {
    let baseHost = '';
    try { baseHost = new URL(audit?.baseUrl || '').hostname; } catch {}
    return allPages.map(p => {
      let canonicalHost = '';
      let canonical = p as any;
      let canonUrl = (canonical.canonicalUrl || '').trim();
      try { if (canonUrl) canonicalHost = new URL(canonUrl, audit?.baseUrl || undefined).hostname; } catch {}
      const robots = (p as any).robotsMeta || '';
      const noindex = /noindex/i.test(robots);
      const nofollow = /nofollow/i.test(robots);
      const missingCanonical = !canonUrl;
      const crossDomainCanonical = canonUrl && baseHost && canonicalHost && canonicalHost !== baseHost;
      return { url: p.url, canonicalUrl: canonUrl, robots, noindex, nofollow, missingCanonical, crossDomainCanonical };
    });
  }, [allPages, audit?.baseUrl]);
  const canonicalCounts = useMemo(() => ({
    missing: canonicalRobotsRows.filter(r => r.missingCanonical).length,
    noindex: canonicalRobotsRows.filter(r => r.noindex).length,
    nofollow: canonicalRobotsRows.filter(r => r.nofollow).length,
    crossDomain: canonicalRobotsRows.filter(r => r.crossDomainCanonical).length,
  }), [canonicalRobotsRows]);
  const duplicateClusters = useMemo(() => {
    const group = (keyFn: (p: AuditPage) => string) => {
      const map = new Map<string, { key: string; pages: string[] }>();
      for (const p of allPages) {
        const k = keyFn(p).trim().toLowerCase();
        if (!k) continue;
        const item = map.get(k) || { key: k, pages: [] };
        item.pages.push(p.url);
        map.set(k, item);
      }
      return Array.from(map.values()).filter(c => c.pages.length > 1).sort((a,b)=>b.pages.length-a.pages.length);
    };
    return {
      title: group(p => p.title || ''),
      meta: group(p => p.metaDescription || ''),
      h1: (() => {
        const map = new Map<string, { key: string; pages: string[] }>();
        for (const p of allPages) {
          const first = (p.h1 && p.h1[0]) ? p.h1[0].trim().toLowerCase() : '';
          if (!first) continue;
          const item = map.get(first) || { key: first, pages: [] };
          item.pages.push(p.url);
          map.set(first, item);
        }
        return Array.from(map.values()).filter(c => c.pages.length > 1).sort((a,b)=>b.pages.length-a.pages.length);
      })(),
    };
  }, [allPages]);
  const statusCodeSummary = useMemo(() => {
    const counts: Record<string, number> = {};
    allPages.forEach(p => { const code = String(p.statusCode || 0); counts[code] = (counts[code] || 0) + 1; });
    return Object.entries(counts).map(([code, count]) => ({ code, count })).sort((a, b) => parseInt(a.code) - parseInt(b.code));
  }, [allPages]);
  const responseCodePages = useMemo(() => {
    if (!selectedStatusCode) return allPages;
    const set = new Set(selectedStatusCode.split(',').map(s => s.trim()));
    return allPages.filter(p => set.has(String(p.statusCode || 0)));
  }, [allPages, selectedStatusCode]);
  const titleRows = useMemo(() => allPages.map(p => { const len = (p.title || '').length; let issue = ''; if (!p.title) issue = 'Missing'; else if (len > 60) issue = 'Too Long'; else if (len < 30) issue = 'Too Short'; return { url: p.url, title: p.title || '', length: len, issue }; }), [allPages]);
  const metaRows = useMemo(() => allPages.map(p => { const len = (p.metaDescription || '').length; let issue = ''; if (!p.metaDescription) issue = 'Missing'; else if (len > 160) issue = 'Too Long'; else if (len < 120) issue = 'Too Short'; return { url: p.url, meta: p.metaDescription || '', length: len, issue }; }), [allPages]);
  const headingRows = useMemo(() => {
    const key = headingLevel;
    return allPages.map(p => {
      const arr = (p as any)[key] as string[] | undefined;
      const list = Array.isArray(arr) ? arr : [];
      const count = list.length;
      const issue = key === 'h1' ? (count === 0 ? 'Missing' : (count > 1 ? 'Multiple' : '')) : '';
      return { url: p.url, list, count, issue };
    });
  }, [allPages, headingLevel]);
  const headingNoneCount = useMemo(() => headingRows.filter(r => r.count === 0).length, [headingRows]);
  const headingMultiCount = useMemo(() => headingLevel === 'h1' ? headingRows.filter(r => r.count > 1).length : 0, [headingRows, headingLevel]);

  // Counts for tab labels
  const pagesCount = useMemo(() => (audit?.summary?.crawledPages ?? allPages.length ?? 0), [audit?.summary?.crawledPages, allPages.length]);
  const internalLinksCount = internalLinksFlat.length;
  const externalLinksCount = externalLinksFlat.length;
  const imagesCount = imagesFlat.length;
  const responseCodesCount = allPages.length;
  const titlesCount = titleRows.length;
  const metaCount = metaRows.length;
  const headingsCount = headingRows.length;
  const canonicalRobotsCount = canonicalRobotsRows.length;
  const brokenLinksCount = brokenInternalRows.length;
  const duplicatesCount = (duplicateClusters.title.length + duplicateClusters.meta.length + duplicateClusters.h1.length);
  const pageSpeedCount = (psiMobile ? 1 : 0) + (psiDesktop ? 1 : 0);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Loading audit details...</Typography>
      </Box>
    );
  }

  if (error && !audit) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
        <Button onClick={onClose} sx={{ mt: 2 }}>Back to List</Button>
      </Box>
    );
  }

  const renderOverviewTab = () => (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>Crawl Summary</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} md={3}><Paper sx={{ p: 2, textAlign: 'center' }}><Typography variant="h4" color="primary">{audit?.summary?.crawledPages || 0}</Typography><Typography variant="body2">Pages Crawled</Typography></Paper></Grid>
            <Grid item xs={6} md={3}><Paper sx={{ p: 2, textAlign: 'center' }}><Typography variant="h4" color="error">{audit?.summary?.errorPages || 0}</Typography><Typography variant="body2">Error Pages</Typography></Paper></Grid>
            <Grid item xs={6} md={3}><Paper sx={{ p: 2, textAlign: 'center' }}><Typography variant="h4" color="warning">{((audit?.issues?.missingTitles || 0) + (audit?.issues?.missingDescriptions || 0) + (audit?.issues?.brokenLinks || 0))}</Typography><Typography variant="body2">Total Issues</Typography></Paper></Grid>
            <Grid item xs={6} md={3}><Paper sx={{ p: 2, textAlign: 'center' }}><Typography variant="h4" color="info">{audit?.summary?.averageResponseTime || 0}ms</Typography><Typography variant="body2">Avg Response Time</Typography></Paper></Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card><CardContent>
            <Typography variant="h6" gutterBottom>SEO Issues</Typography>
            <List dense>
              <ListItem><ListItemText primary="Missing Titles" secondary={`${audit?.issues?.missingTitles || 0} pages`} />{getIssueIcon((audit?.issues?.missingTitles || 0) > 0)}</ListItem>
              <Divider />
              <ListItem><ListItemText primary="Missing Descriptions" secondary={`${audit?.issues?.missingDescriptions || 0} pages`} />{getIssueIcon((audit?.issues?.missingDescriptions || 0) > 0)}</ListItem>
              <Divider />
              <ListItem><ListItemText primary="Broken Links" secondary={`${audit?.issues?.brokenLinks || 0} pages`} />{getIssueIcon((audit?.issues?.brokenLinks || 0) > 0)}</ListItem>
              <Divider />
              <ListItem><ListItemText primary="Duplicate Titles" secondary={`${audit?.issues?.duplicateTitles || 0} pages`} />{getIssueIcon((audit?.issues?.duplicateTitles || 0) > 0)}</ListItem>
            </List>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card><CardContent>
            <Typography variant="h6" gutterBottom>Audit Information</Typography>
            <List dense>
              <ListItem><ListItemText primary="Name" secondary={audit?.name} /></ListItem>
              <Divider />
              <ListItem>
                <ListItemText primary="Base URL" secondary={audit?.baseUrl} />
                <IconButton size="small" onClick={() => audit?.baseUrl && window.open(audit.baseUrl, '_blank')}><LaunchIcon /></IconButton>
              </ListItem>
              <Divider />
              <ListItem><ListItemText primary="Status" secondary={<Chip label={audit?.status} color={audit?.status === 'completed' ? 'success' : 'info'} size="small" />} /></ListItem>
            </List>
          </CardContent></Card>
        </Grid>
      </Grid>
    </Box>
  );

  const renderPagesTab = () => (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField size="small" placeholder="Search pages..." value={search} onChange={(e) => setSearch(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }} sx={{ minWidth: 250 }} />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Status Code</InputLabel>
          <Select value={statusCodeFilter} label="Status Code" onChange={(e) => setStatusCodeFilter(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="200">200 (Success)</MenuItem>
            <MenuItem value="301,302">3xx (Redirects)</MenuItem>
            <MenuItem value="404">404 (Not Found)</MenuItem>
            <MenuItem value="500">5xx (Server Error)</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Issue Type</InputLabel>
          <Select value={issueFilter} label="Issue Type" onChange={(e) => setIssueFilter(e.target.value)}>
            <MenuItem value="">All Pages</MenuItem>
            {ISSUE_FILTERS.map(f => (<MenuItem key={f.value} value={f.value}>{f.label}</MenuItem>))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Sort By</InputLabel>
          <Select value={sortBy} label="Sort By" onChange={(e) => setSortBy(e.target.value)}>
            <MenuItem value="url">URL</MenuItem>
            <MenuItem value="statusCode">Status Code</MenuItem>
            <MenuItem value="responseTime">Response Time</MenuItem>
            <MenuItem value="wordCount">Word Count</MenuItem>
          </Select>
        </FormControl>
        <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExportCsv}>Export CSV</Button>
        <Button variant="text" onClick={() => { setSearch(''); setStatusCodeFilter(''); setIssueFilter(''); setSortBy('url'); setPage(0); }}>Reset Filters</Button>
      </Box>
      {pagesLoading && <LinearProgress sx={{ mb: 2 }} />}
      {!pagesLoading && pages.length === 0 && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography>No pages found.</Typography>
          <Typography variant="body2" color="text.secondary">Try Reset Filters, or wait while the crawl completes.</Typography>
        </Paper>
      )}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>URL</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Meta Description</TableCell>
              <TableCell>H1</TableCell>
              <TableCell>Word Count</TableCell>
              <TableCell>Response Time</TableCell>
              <TableCell>Issues</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pages.map((p, i) => (
              <TableRow key={i} hover sx={{ cursor: 'pointer' }} onClick={() => handlePageClick(p)}>
                <TableCell><Typography variant="body2" sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.url}</Typography></TableCell>
                <TableCell><Chip label={p.statusCode} color={getStatusColor(p.statusCode)} size="small" /></TableCell>
                <TableCell><Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title || 'No title'}</Typography>{!p.title && <WarningIcon color="warning" fontSize="small" />}</TableCell>
                <TableCell><Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.metaDescription || 'No description'}</Typography>{!p.metaDescription && <WarningIcon color="warning" fontSize="small" />}</TableCell>
                <TableCell><Typography variant="body2">{p.h1?.length || 0}</Typography>{(p.h1?.length || 0) !== 1 && <WarningIcon color="warning" fontSize="small" />}</TableCell>
                <TableCell><Typography variant="body2">{p.wordCount || 0}</Typography></TableCell>
                <TableCell><Typography variant="body2" color={p.responseTime > 3000 ? 'warning.main' : 'textSecondary'}>{p.responseTime}ms</Typography></TableCell>
                <TableCell><Box sx={{ display: 'flex', gap: 0.5 }}>{!p.title && <ErrorIcon color="error" fontSize="small" />}{!p.metaDescription && <WarningIcon color="warning" fontSize="small" />}{(p.h1?.length || 0) !== 1 && <InfoIcon color="info" fontSize="small" />}</Box></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination component="div" count={totalCount} page={page} onPageChange={handleChangePage} rowsPerPage={rowsPerPage} onRowsPerPageChange={handleChangeRowsPerPage} rowsPerPageOptions={[25, 50, 100, 200]} />
    </Box>
  );

  const filterBySearch = (text: string, ...fields: (string | undefined)[]) => {
    if (!text) return true; const q = text.toLowerCase(); return fields.some(f => (f || '').toLowerCase().includes(q));
  };

  const renderInternalLinksTab = () => {
    const rows = internalLinksFlat.filter(r => filterBySearch(internalSearch, r.from, r.to, r.anchorText));
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
          <TextField size="small" label="Search links" value={internalSearch} onChange={(e) => setInternalSearch(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }} sx={{ minWidth: 300 }} />
          <Chip label={`Total: ${internalLinksFlat.length}`} size="small" />
          <Chip label={`Filtered: ${rows.length}`} size="small" />
        </Box>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead><TableRow><TableCell>From Page</TableCell><TableCell>To URL</TableCell><TableCell>Anchor</TableCell><TableCell>Nofollow</TableCell></TableRow></TableHead>
            <TableBody>
              {rows.slice(0, 500).map((r, i) => (
                <TableRow key={i}>
                  <TableCell><Typography variant="body2" sx={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.from}</Typography></TableCell>
                  <TableCell><Typography variant="body2" sx={{ maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.to}</Typography></TableCell>
                  <TableCell><Typography variant="body2" sx={{ maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.anchorText || '-'}</Typography></TableCell>
                  <TableCell>{r.nofollow ? 'Yes' : 'No'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {rows.length > 500 && (<Typography variant="caption" sx={{ mt: 1, display: 'block' }}>Showing first 500 rows. Refine your search to see more.</Typography>)}
      </Box>
    );
  };

  const renderExternalLinksTab = () => {
    const rows = externalLinksFlat.filter(r => filterBySearch(externalSearch, r.from, r.to, r.anchorText));
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
          <TextField size="small" label="Search links" value={externalSearch} onChange={(e) => setExternalSearch(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }} sx={{ minWidth: 300 }} />
          <Chip label={`Total: ${externalLinksFlat.length}`} size="small" />
          <Chip label={`Filtered: ${rows.length}`} size="small" />
        </Box>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead><TableRow><TableCell>From Page</TableCell><TableCell>To URL</TableCell><TableCell>Anchor</TableCell><TableCell>Nofollow</TableCell></TableRow></TableHead>
            <TableBody>
              {rows.slice(0, 500).map((r, i) => (
                <TableRow key={i}>
                  <TableCell><Typography variant="body2" sx={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.from}</Typography></TableCell>
                  <TableCell><Typography variant="body2" sx={{ maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.to}</Typography></TableCell>
                  <TableCell><Typography variant="body2" sx={{ maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.anchorText || '-'}</Typography></TableCell>
                  <TableCell>{r.nofollow ? 'Yes' : 'No'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {rows.length > 500 && (<Typography variant="caption" sx={{ mt: 1, display: 'block' }}>Showing first 500 rows. Refine your search to see more.</Typography>)}
      </Box>
    );
  };

  const renderImagesTab = () => {
    const rows = imagesFlat.filter(r => filterBySearch(imagesSearch, r.page, r.src, r.alt));
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField size="small" label="Search images" value={imagesSearch} onChange={(e) => setImagesSearch(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }} sx={{ minWidth: 300 }} />
          <Chip label={`Total: ${imagesFlat.length}`} size="small" />
          <Chip label={`Filtered: ${rows.length}`} size="small" />
        </Box>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead><TableRow><TableCell>Page</TableCell><TableCell>Src</TableCell><TableCell>Alt</TableCell><TableCell>Size</TableCell><TableCell>Alt Missing</TableCell></TableRow></TableHead>
            <TableBody>
              {rows.slice(0, 500).map((img, i) => (
                <TableRow key={i}>
                  <TableCell><Typography variant="body2" sx={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis' }}>{img.page}</Typography></TableCell>
                  <TableCell><Typography variant="body2" sx={{ maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis' }}>{img.src}</Typography></TableCell>
                  <TableCell><Typography variant="body2" sx={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis' }}>{img.alt || '-'}</Typography></TableCell>
                  <TableCell>{img.width || '-'} x {img.height || '-'}</TableCell>
                  <TableCell>{img.altMissing ? 'Yes' : 'No'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {rows.length > 500 && (<Typography variant="caption" sx={{ mt: 1, display: 'block' }}>Showing first 500 rows. Refine your search to see more.</Typography>)}
      </Box>
    );
  };

  const renderResponseCodesTab = () => (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card><CardContent>
            <Typography variant="h6" gutterBottom>Response Codes</Typography>
            <Table size="small">
              <TableHead><TableRow><TableCell>Code</TableCell><TableCell align="right">Count</TableCell></TableRow></TableHead>
              <TableBody>
                {statusCodeSummary.map(row => (
                  <TableRow key={row.code} hover selected={selectedStatusCode === row.code} onClick={() => setSelectedStatusCode(row.code)} sx={{ cursor: 'pointer' }}>
                    <TableCell>{row.code}</TableCell>
                    <TableCell align="right">{row.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button size="small" sx={{ mt: 1 }} onClick={() => setSelectedStatusCode('')}>Clear Filter</Button>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <Card><CardContent>
            <Typography variant="h6" gutterBottom>Pages {selectedStatusCode ? `(Code ${selectedStatusCode})` : ''}</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead><TableRow><TableCell>URL</TableCell><TableCell>Status</TableCell><TableCell>Response Time</TableCell></TableRow></TableHead>
                <TableBody>
                  {responseCodePages.slice(0, 500).map((p, i) => (
                    <TableRow key={i}>
                      <TableCell><Typography variant="body2" sx={{ maxWidth: 420, overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.url}</Typography></TableCell>
                      <TableCell>{p.statusCode}</TableCell>
                      <TableCell>{p.responseTime}ms</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {responseCodePages.length > 500 && (<Typography variant="caption" sx={{ mt: 1, display: 'block' }}>Showing first 500 rows.</Typography>)}
          </CardContent></Card>
        </Grid>
      </Grid>
    </Box>
  );

  const renderTitlesTab = () => {
    const rows = titleRows.filter(r => filterBySearch(titleSearch, r.url, r.title));
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField size="small" label="Search titles" value={titleSearch} onChange={(e) => setTitleSearch(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }} sx={{ minWidth: 300 }} />
          <Chip label={`Missing: ${titleRows.filter(r => r.issue === 'Missing').length}`} size="small" />
          <Chip label={`Too Short: ${titleRows.filter(r => r.issue === 'Too Short').length}`} size="small" />
          <Chip label={`Too Long: ${titleRows.filter(r => r.issue === 'Too Long').length}`} size="small" />
        </Box>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead><TableRow><TableCell>URL</TableCell><TableCell>Title</TableCell><TableCell>Length</TableCell><TableCell>Issue</TableCell></TableRow></TableHead>
            <TableBody>
              {rows.slice(0, 500).map((r, i) => (
                <TableRow key={i}>
                  <TableCell><Typography variant="body2" sx={{ maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.url}</Typography></TableCell>
                  <TableCell><Typography variant="body2" sx={{ maxWidth: 420, overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.title || '-'}</Typography></TableCell>
                  <TableCell>{r.length}</TableCell>
                  <TableCell>{r.issue || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {rows.length > 500 && (<Typography variant="caption" sx={{ mt: 1, display: 'block' }}>Showing first 500 rows.</Typography>)}
      </Box>
    );
  };

  const renderMetaTab = () => {
    const rows = metaRows.filter(r => filterBySearch(metaSearch, r.url, r.meta));
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField size="small" label="Search descriptions" value={metaSearch} onChange={(e) => setMetaSearch(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }} sx={{ minWidth: 300 }} />
          <Chip label={`Missing: ${metaRows.filter(r => r.issue === 'Missing').length}`} size="small" />
          <Chip label={`Too Short: ${metaRows.filter(r => r.issue === 'Too Short').length}`} size="small" />
          <Chip label={`Too Long: ${metaRows.filter(r => r.issue === 'Too Long').length}`} size="small" />
        </Box>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead><TableRow><TableCell>URL</TableCell><TableCell>Meta Description</TableCell><TableCell>Length</TableCell><TableCell>Issue</TableCell></TableRow></TableHead>
            <TableBody>
              {rows.slice(0, 500).map((r, i) => (
                <TableRow key={i}>
                  <TableCell><Typography variant="body2" sx={{ maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.url}</Typography></TableCell>
                  <TableCell><Typography variant="body2" sx={{ maxWidth: 420, overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.meta || '-'}</Typography></TableCell>
                  <TableCell>{r.length}</TableCell>
                  <TableCell>{r.issue || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {rows.length > 500 && (<Typography variant="caption" sx={{ mt: 1, display: 'block' }}>Showing first 500 rows.</Typography>)}
      </Box>
    );
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3, pb: 0 }}>
        <Typography variant="h4">{audit?.name}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {audit?.status && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip size="small" label={audit.status} color={audit.status === 'completed' ? 'success' : 'info'} />
              {audit.status !== 'completed' && (
                <>
                  <CircularProgress size={16} />
                  <Typography variant="caption" color="text.secondary">Crawling… auto-refreshing</Typography>
                </>
              )}
            </Box>
          )}
          <Button onClick={onClose}>Back to List</Button>
        </Box>
      </Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label={`Overview`} />
          <Tab label={`Page Titles (${titlesCount})`} />
          <Tab label={`Meta Descriptions (${metaCount})`} />
          <Tab label={`Headings (${headingsCount})`} />
          <Tab label={`Pages (${pagesCount})`} />
          <Tab label={`Internal Links (${internalLinksCount})`} />
          <Tab label={`External Links (${externalLinksCount})`} />
          <Tab label={`Images (${imagesCount})`} />
          <Tab label={`Response Codes (${responseCodesCount})`} />
          <Tab label={`Canonical & Robots (${canonicalRobotsCount})`} />
          <Tab label={`Broken Links (${brokenLinksCount})`} />
          <Tab label={`Duplicates (${duplicatesCount})`} />
          <Tab label={`PageSpeed (${pageSpeedCount})`} />
        </Tabs>
      </Box>
      {error && audit && (
        <Typography color="error" sx={{ px: 3, pt: 1 }}>{error}</Typography>
      )}
      {activeTab === 0 && renderOverviewTab()}
      {activeTab === 1 && renderTitlesTab()}
      {activeTab === 2 && renderMetaTab()}
      {activeTab === 3 && (() => {
        const rows = headingRows.filter(r => {
          if (!h1Search) return true;
          const q = h1Search.toLowerCase();
          const txt = r.list.join(' | ').toLowerCase();
          return r.url.toLowerCase().includes(q) || txt.includes(q);
        });
        return (
          <Box sx={{ p: 3 }}>
            <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Heading</InputLabel>
                <Select label="Heading" value={headingLevel} onChange={(e) => setHeadingLevel(e.target.value as any)}>
                  <MenuItem value="h1">H1</MenuItem>
                  <MenuItem value="h2">H2</MenuItem>
                  <MenuItem value="h3">H3</MenuItem>
                  <MenuItem value="h4">H4</MenuItem>
                  <MenuItem value="h5">H5</MenuItem>
                  <MenuItem value="h6">H6</MenuItem>
                </Select>
              </FormControl>
              <TextField size="small" label={`Search ${headingLevel.toUpperCase()}`} value={h1Search} onChange={(e) => setH1Search(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }} sx={{ minWidth: 300 }} />
              <Chip label={`No ${headingLevel.toUpperCase()}: ${headingNoneCount}`} size="small" color={headingNoneCount > 0 ? 'warning' : 'default'} />
              {headingLevel === 'h1' && <Chip label={`Multiple H1: ${headingMultiCount}`} size="small" color={headingMultiCount > 0 ? 'warning' : 'default'} />}
              <Chip label={`Total Pages: ${headingRows.length}`} size="small" />
            </Box>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>URL</TableCell>
                    <TableCell>{headingLevel.toUpperCase()} Count</TableCell>
                    <TableCell>{headingLevel.toUpperCase()} Preview</TableCell>
                    <TableCell>Issue</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.slice(0, 500).map((r, i) => (
                    <TableRow key={i} hover>
                      <TableCell><Typography variant="body2" sx={{ maxWidth: 420, overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.url}</Typography></TableCell>
                      <TableCell>{r.count}</TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 520, overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.list.join(' | ') || '-'}</Typography>
                      </TableCell>
                      <TableCell>{r.issue || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {rows.length > 500 && (<Typography variant="caption" sx={{ mt: 1, display: 'block' }}>Showing first 500 rows. Refine your search to see more.</Typography>)}
          </Box>
        );
      })()}
      {activeTab === 4 && renderPagesTab()}
      {activeTab === 5 && renderInternalLinksTab()}
      {activeTab === 6 && renderExternalLinksTab()}
      {activeTab === 7 && renderImagesTab()}
      {activeTab === 8 && renderResponseCodesTab()}
      {activeTab === 9 && (() => {
        const rows = canonicalRobotsRows;
        return (
          <Box sx={{ p: 3 }}>
            <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <Chip label={`Missing Canonical: ${canonicalCounts.missing}`} size="small" color={canonicalCounts.missing ? 'warning' : 'default'} />
              <Chip label={`Cross-domain Canonical: ${canonicalCounts.crossDomain}`} size="small" color={canonicalCounts.crossDomain ? 'warning' : 'default'} />
              <Chip label={`noindex: ${canonicalCounts.noindex}`} size="small" color={canonicalCounts.noindex ? 'warning' : 'default'} />
              <Chip label={`nofollow: ${canonicalCounts.nofollow}`} size="small" color={canonicalCounts.nofollow ? 'warning' : 'default'} />
              <Chip label={`Total Pages: ${rows.length}`} size="small" />
            </Box>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead><TableRow><TableCell>URL</TableCell><TableCell>Canonical URL</TableCell><TableCell>Robots</TableCell><TableCell>Issues</TableCell></TableRow></TableHead>
                <TableBody>
                  {rows.slice(0, 500).map((r, i) => (
                    <TableRow key={i}>
                      <TableCell><Typography variant="body2" sx={{ maxWidth: 420, overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.url}</Typography></TableCell>
                      <TableCell><Typography variant="body2" sx={{ maxWidth: 420, overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.canonicalUrl || '-'}</Typography></TableCell>
                      <TableCell><Typography variant="body2" sx={{ maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.robots || '-'}</Typography></TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {r.missingCanonical && <Chip size="small" color="warning" label="Missing canonical" />}
                          {r.crossDomainCanonical && <Chip size="small" color="warning" label="Cross-domain" />}
                          {r.noindex && <Chip size="small" color="warning" label="noindex" />}
                          {r.nofollow && <Chip size="small" color="warning" label="nofollow" />}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        );
      })()}
      {activeTab === 10 && (() => {
        const rows = brokenInternalRows;
        return (
          <Box sx={{ p: 3 }}>
            <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
              <Chip label={`Broken internal links: ${rows.length}`} size="small" color={rows.length ? 'error' : 'default'} />
            </Box>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead><TableRow><TableCell>From Page</TableCell><TableCell>To URL</TableCell><TableCell>Anchor</TableCell><TableCell>Target Status</TableCell></TableRow></TableHead>
                <TableBody>
                  {rows.slice(0, 1000).map((r, i) => (
                    <TableRow key={i}>
                      <TableCell><Typography variant="body2" sx={{ maxWidth: 360, overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.from}</Typography></TableCell>
                      <TableCell><Typography variant="body2" sx={{ maxWidth: 420, overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.to}</Typography></TableCell>
                      <TableCell><Typography variant="body2" sx={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.anchorText || '-'}</Typography></TableCell>
                      <TableCell>{r.status || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {rows.length > 1000 && (<Typography variant="caption" sx={{ mt: 1, display: 'block' }}>Showing first 1000 rows. Refine your crawl or export for full list.</Typography>)}
          </Box>
        );
      })()}
      {activeTab === 11 && (() => (
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Duplicate Clusters</Typography>
          <Grid container spacing={2}>
            {[{label:'Titles', data: duplicateClusters.title}, {label:'Meta Descriptions', data: duplicateClusters.meta}, {label:'H1 (first)', data: duplicateClusters.h1}].map(section => (
              <Grid item xs={12} md={4} key={section.label}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>{section.label}</Typography>
                    <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>Clusters: {section.data.length}</Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead><TableRow><TableCell>Value</TableCell><TableCell>Pages</TableCell></TableRow></TableHead>
                        <TableBody>
                          {section.data.slice(0, 50).map((c, i) => (
                            <TableRow key={i}>
                              <TableCell><Typography variant="body2" sx={{ maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.key}</Typography></TableCell>
                              <TableCell>
                                <Typography variant="caption" sx={{ display: 'block' }}>{c.pages.length}</Typography>
                                <Typography variant="caption" sx={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.pages.join(' | ')}</Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    {section.data.length > 50 && (<Typography variant="caption" sx={{ mt: 1, display: 'block' }}>Showing first 50 clusters.</Typography>)}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}
      {activeTab === 12 && (
        <Box sx={{ p: 3 }}>
          <Typography sx={{ mb: 1 }}>Run Lighthouse (local) for this audit’s site. We’ll run both Mobile and Desktop.</Typography>
          <Typography variant="body2" color={audit?.baseUrl ? 'text.secondary' : 'error.main'} sx={{ mb: 2 }}>
            {audit?.baseUrl ? `Using base URL: ${audit.baseUrl}` : 'No base URL found for this audit. Set a base URL to run Lighthouse.'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
            <Button variant="contained" disabled={psiLoading || !audit?.baseUrl} onClick={async () => {
              try {
                setPsiLoading(true); setError(''); setPsiMobile(null); setPsiDesktop(null);
                const token = localStorage.getItem('auth_token');
                const u = audit?.baseUrl || '';
                if (!u) throw new Error('Missing URL');
                const respMob = await fetch(`/api/pagespeed-local/lighthouse?url=${encodeURIComponent(u)}&strategy=mobile`, { headers: { Authorization: `Bearer ${token}` } });
                if (!respMob.ok) throw new Error(`Lighthouse mobile failed (${respMob.status})`);
                const dataMob = await respMob.json(); setPsiMobile(dataMob.metrics || dataMob);
                const respDesk = await fetch(`/api/pagespeed-local/lighthouse?url=${encodeURIComponent(u)}&strategy=desktop`, { headers: { Authorization: `Bearer ${token}` } });
                if (!respDesk.ok) throw new Error(`Lighthouse desktop failed (${respDesk.status})`);
                const dataDesk = await respDesk.json(); setPsiDesktop(dataDesk.metrics || dataDesk);
              } catch (e) {
                setError((e as Error)?.message || 'Failed to fetch Lighthouse');
              } finally {
                setPsiLoading(false);
              }
            }}>{psiLoading ? 'Running...' : 'Run Lighthouse (Mobile + Desktop)'}</Button>
          </Box>
          {(psiMobile || psiDesktop) && (
            <Grid container spacing={2}>
              {[{ label: 'Mobile', data: psiMobile }, { label: 'Desktop', data: psiDesktop }].map(({ label, data }) => (
                <Grid key={label} item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Box position="relative" display="inline-flex">
                        <Box sx={{ position: 'relative', width: 96, height: 96, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg viewBox="22 22 44 44" style={{ width: 96, height: 96 }}>
                            <circle cx="44" cy="44" r="20.2" fill="none" stroke="#eee" strokeWidth="3.6" />
                            <circle cx="44" cy="44" r="20.2" fill="none" stroke={data?.performanceScore >= 90 ? '#2e7d32' : data?.performanceScore >= 50 ? '#ed6c02' : '#d32f2f'} strokeWidth="3.6" strokeDasharray={`${(Math.max(0, Math.min(100, data?.performanceScore || 0))) * 1.27}, 999`} transform="rotate(-90 44 44)" />
                          </svg>
                          <Box sx={{ position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Typography variant="h5">{typeof data?.performanceScore === 'number' ? data.performanceScore : '—'}</Typography>
                          </Box>
                        </Box>
                      </Box>
                      <Box>
                        <Typography variant="subtitle1">{label}</Typography>
                        <Typography variant="body2" color="text.secondary">{data?.url || '-'}</Typography>
                      </Box>
                    </Box>
                    {data && (
                      <TableContainer component={Paper} sx={{ mt: 2 }}>
                        <Table size="small">
                          <TableHead><TableRow><TableCell>Metric</TableCell><TableCell>Value</TableCell></TableRow></TableHead>
                          <TableBody>
                            <TableRow><TableCell>FCP</TableCell><TableCell>{data.firstContentfulPaint ?? '-'}</TableCell></TableRow>
                            <TableRow><TableCell>LCP</TableCell><TableCell>{data.largestContentfulPaint ?? '-'}</TableCell></TableRow>
                            <TableRow><TableCell>CLS</TableCell><TableCell>{data.cumulativeLayoutShift ?? '-'}</TableCell></TableRow>
                            <TableRow><TableCell>TBT</TableCell><TableCell>{data.totalBlockingTime ?? '-'}</TableCell></TableRow>
                            <TableRow><TableCell>Speed Index</TableCell><TableCell>{data.speedIndex ?? '-'}</TableCell></TableRow>
                            <TableRow><TableCell>TTI</TableCell><TableCell>{data.timeToInteractive ?? '-'}</TableCell></TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {/* Page Details Dialog */}
      <Dialog open={pageDetailsOpen} onClose={() => setPageDetailsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Page Details</DialogTitle>
        <DialogContent>
          {selectedPage && (
            <Box>
              <Typography variant="h6" gutterBottom>{selectedPage.url}</Typography>
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography>Basic Information</Typography></AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={6}><Typography variant="subtitle2">Status Code</Typography><Typography>{selectedPage.statusCode}</Typography></Grid>
                    <Grid item xs={6}><Typography variant="subtitle2">Response Time</Typography><Typography>{selectedPage.responseTime}ms</Typography></Grid>
                    <Grid item xs={6}><Typography variant="subtitle2">Word Count</Typography><Typography>{selectedPage.wordCount}</Typography></Grid>
                    <Grid item xs={6}><Typography variant="subtitle2">Content Length</Typography><Typography>{selectedPage.contentLength} bytes</Typography></Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography>SEO Elements</Typography></AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ mb: 2 }}><Typography variant="subtitle2">Title ({selectedPage.title?.length || 0} chars)</Typography><Typography>{selectedPage.title || 'No title'}</Typography></Box>
                  <Box sx={{ mb: 2 }}><Typography variant="subtitle2">Meta Description ({selectedPage.metaDescription?.length || 0} chars)</Typography><Typography>{selectedPage.metaDescription || 'No meta description'}</Typography></Box>
                  <Box><Typography variant="subtitle2">H1 Tags ({selectedPage.h1?.length || 0})</Typography>{selectedPage.h1?.map((h1, i) => (<Typography key={i} sx={{ ml: 2 }}>• {h1}</Typography>))}</Box>
                </AccordionDetails>
              </Accordion>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography>Links</Typography></AccordionSummary>
                <AccordionDetails>
                  <Typography variant="subtitle2">Internal Links ({selectedPage.internalLinks?.length || 0})</Typography>
                  <Typography variant="subtitle2" sx={{ mt: 1 }}>External Links ({selectedPage.externalLinks?.length || 0})</Typography>
                </AccordionDetails>
              </Accordion>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography>Images</Typography></AccordionSummary>
                <AccordionDetails>
                  <Typography variant="subtitle2">Total Images: {selectedPage.images?.length || 0}</Typography>
                  <Typography variant="subtitle2" color="warning.main">Images Without Alt: {selectedPage.images?.filter(img => !img.alt).length || 0}</Typography>
                </AccordionDetails>
              </Accordion>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default AuditViewer;