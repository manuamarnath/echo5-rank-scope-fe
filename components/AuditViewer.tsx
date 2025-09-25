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
  const [selectedStatusCode, setSelectedStatusCode] = useState('');

  // PageSpeed (local Lighthouse)
  const [psiUrl, setPsiUrl] = useState('');
  const [psiLoading, setPsiLoading] = useState(false);
  const [psiMobile, setPsiMobile] = useState<any>(null);
  const [psiDesktop, setPsiDesktop] = useState<any>(null);

  // Fetch audit
  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError('');
        const token = localStorage.getItem('auth_token');
        const res = await fetch(`/api/audits/${auditId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Failed to fetch audit (${res.status})`);
        const data = await res.json();
        setAudit(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [auditId]);

  // Fetch pages list
  useEffect(() => {
    const run = async () => {
      if (!auditId) return;
      try {
        setPagesLoading(true);
        const token = localStorage.getItem('auth_token');
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (statusCodeFilter) params.set('status', statusCodeFilter);
        if (issueFilter) params.set('issue', issueFilter);
        if (sortBy) params.set('sortBy', sortBy);
        params.set('page', String(page + 1));
        params.set('limit', String(rowsPerPage));
        const res = await fetch(`/api/audits/${auditId}/pages?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Failed to fetch pages (${res.status})`);
        const data = await res.json();
        setPages(data.pages || []);
        setTotalCount(data.total || (data.pages?.length ?? 0));
      } catch (e) {
        // Keep UX resilient; show table empty and message on header
        setError((e as Error)?.message || 'Failed to load pages');
      } finally {
        setPagesLoading(false);
      }
    };
    run();
  }, [auditId, search, statusCodeFilter, issueFilter, sortBy, page, rowsPerPage]);

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
      </Box>
      {pagesLoading && <LinearProgress sx={{ mb: 2 }} />}
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
        <Button onClick={onClose}>Back to List</Button>
      </Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Overview" />
          <Tab label={`Pages (${audit?.summary?.crawledPages || 0})`} />
          <Tab label="Internal Links" />
          <Tab label="External Links" />
          <Tab label="Images" />
          <Tab label="Response Codes" />
          <Tab label="Page Titles" />
          <Tab label="Meta Descriptions" />
          <Tab label="H1" />
          <Tab label="PageSpeed" />
        </Tabs>
      </Box>
      {error && audit && (
        <Typography color="error" sx={{ px: 3, pt: 1 }}>{error}</Typography>
      )}
      {activeTab === 0 && renderOverviewTab()}
      {activeTab === 1 && renderPagesTab()}
      {activeTab === 2 && renderInternalLinksTab()}
      {activeTab === 3 && renderExternalLinksTab()}
      {activeTab === 4 && renderImagesTab()}
      {activeTab === 5 && renderResponseCodesTab()}
      {activeTab === 6 && renderTitlesTab()}
      {activeTab === 7 && renderMetaTab()}
      {activeTab === 8 && (
        <Box sx={{ p: 3 }}>
          <Typography>H1 analysis coming soon...</Typography>
        </Box>
      )}
      {activeTab === 9 && (
        <Box sx={{ p: 3 }}>
          <Typography sx={{ mb: 2 }}>Run Lighthouse (local) for a specific URL from this audit. This avoids PageSpeed Insights rate limits. We’ll run both Mobile and Desktop.</Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
            <TextField label="URL" placeholder={audit?.baseUrl} value={psiUrl} onChange={(e) => setPsiUrl(e.target.value)} size="small" sx={{ minWidth: 420 }} />
            <Button variant="contained" disabled={psiLoading} onClick={async () => {
              try {
                setPsiLoading(true); setError(''); setPsiMobile(null); setPsiDesktop(null);
                const token = localStorage.getItem('auth_token');
                const u = psiUrl || audit?.baseUrl || '';
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