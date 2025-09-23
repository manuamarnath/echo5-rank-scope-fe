import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  Paper,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  ExpandMore as ExpandMoreIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Launch as LaunchIcon
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
  { value: 'broken-links', label: 'Broken Links', count: 0 },
  { value: 'slow-pages', label: 'Slow Pages (>3s)', count: 0 },
  { value: 'large-pages', label: 'Large Pages (>5MB)', count: 0 },
  { value: 'images-without-alt', label: 'Images Without Alt', count: 0 },
  { value: 'title-too-long', label: 'Title Too Long (>60)', count: 0 },
  { value: 'title-too-short', label: 'Title Too Short (<30)', count: 0 },
  { value: 'description-too-long', label: 'Description Too Long (>160)', count: 0 },
  { value: 'description-too-short', label: 'Description Too Short (<120)', count: 0 },
];

const AuditViewer: React.FC<AuditViewerProps> = ({ auditId, onClose }) => {
  const [audit, setAudit] = useState<AuditDetails | null>(null);
  const [pages, setPages] = useState<AuditPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagesLoading, setPagesLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Current tab
  const [activeTab, setActiveTab] = useState(0);
  
  // Pages pagination and filtering
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [statusCodeFilter, setStatusCodeFilter] = useState('');
  const [issueFilter, setIssueFilter] = useState('');
  const [sortBy, setSortBy] = useState('url');
  const [sortOrder, setSortOrder] = useState('asc');
  
  // Selected page details
  const [selectedPage, setSelectedPage] = useState<AuditPage | null>(null);
  const [pageDetailsOpen, setPageDetailsOpen] = useState(false);

  useEffect(() => {
    fetchAuditDetails();
  }, [auditId]);

  useEffect(() => {
    if (activeTab === 1) { // Pages tab
      fetchPages();
    }
  }, [activeTab, page, rowsPerPage, search, statusCodeFilter, issueFilter, sortBy, sortOrder]);

  const fetchAuditDetails = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/audits/${auditId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch audit details');
      }

      const data = await response.json();
      setAudit(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchPages = async () => {
    setPagesLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const params = new URLSearchParams({
        page: (page + 1).toString(),
        limit: rowsPerPage.toString(),
        sortBy,
        sortOrder
      });
      
      if (search) params.append('search', search);
      if (statusCodeFilter) params.append('statusCode', statusCodeFilter);
      if (issueFilter) params.append('issueType', issueFilter);

      const response = await fetch(`/api/audits/${auditId}/pages?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch pages');
      }

      const data = await response.json();
      setPages(data.data);
      setTotalCount(data.pagination.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pages');
    } finally {
      setPagesLoading(false);
    }
  };

  const getStatusColor = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) return 'success';
    if (statusCode >= 300 && statusCode < 400) return 'warning';
    if (statusCode >= 400) return 'error';
    return 'default';
  };

  const getIssueIcon = (hasIssue: boolean) => {
    return hasIssue ? <ErrorIcon color="error" fontSize="small" /> : <CheckCircleIcon color="success" fontSize="small" />;
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handlePageClick = (pageData: AuditPage) => {
    setSelectedPage(pageData);
    setPageDetailsOpen(true);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Loading audit details...</Typography>
      </Box>
    );
  }

  if (error || !audit) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error || 'Audit not found'}</Typography>
        <Button onClick={onClose} sx={{ mt: 2 }}>
          Back to List
        </Button>
      </Box>
    );
  }

  const renderOverviewTab = () => (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Summary Stats */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Crawl Summary
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="primary">
                  {audit.summary?.crawledPages || 0}
                </Typography>
                <Typography variant="body2">Pages Crawled</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="error">
                  {audit.summary?.errorPages || 0}
                </Typography>
                <Typography variant="body2">Error Pages</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="warning">
                  {((audit.issues?.missingTitles || 0) + 
                    (audit.issues?.missingDescriptions || 0) + 
                    (audit.issues?.brokenLinks || 0))}
                </Typography>
                <Typography variant="body2">Total Issues</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="info">
                  {audit.summary?.averageResponseTime || 0}ms
                </Typography>
                <Typography variant="body2">Avg Response Time</Typography>
              </Paper>
            </Grid>
          </Grid>
        </Grid>

        {/* Issues Breakdown */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                SEO Issues
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText 
                    primary="Missing Titles" 
                    secondary={`${audit.issues?.missingTitles || 0} pages`}
                  />
                  {getIssueIcon((audit.issues?.missingTitles || 0) > 0)}
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText 
                    primary="Missing Descriptions" 
                    secondary={`${audit.issues?.missingDescriptions || 0} pages`}
                  />
                  {getIssueIcon((audit.issues?.missingDescriptions || 0) > 0)}
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText 
                    primary="Broken Links" 
                    secondary={`${audit.issues?.brokenLinks || 0} pages`}
                  />
                  {getIssueIcon((audit.issues?.brokenLinks || 0) > 0)}
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText 
                    primary="Duplicate Titles" 
                    secondary={`${audit.issues?.duplicateTitles || 0} pages`}
                  />
                  {getIssueIcon((audit.issues?.duplicateTitles || 0) > 0)}
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Audit Info */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Audit Information
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText 
                    primary="Name" 
                    secondary={audit.name}
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText 
                    primary="Base URL" 
                    secondary={audit.baseUrl}
                  />
                  <IconButton 
                    size="small" 
                    onClick={() => window.open(audit.baseUrl, '_blank')}
                  >
                    <LaunchIcon />
                  </IconButton>
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText 
                    primary="Status" 
                    secondary={
                      <Chip 
                        label={audit.status} 
                        color={audit.status === 'completed' ? 'success' : 'info'} 
                        size="small" 
                      />
                    }
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  const renderPagesTab = () => (
    <Box sx={{ p: 3 }}>
      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="Search pages..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 250 }}
        />
        
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Status Code</InputLabel>
          <Select
            value={statusCodeFilter}
            label="Status Code"
            onChange={(e) => setStatusCodeFilter(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="200">200 (Success)</MenuItem>
            <MenuItem value="301,302">3xx (Redirects)</MenuItem>
            <MenuItem value="404">404 (Not Found)</MenuItem>
            <MenuItem value="500">5xx (Server Error)</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Issue Type</InputLabel>
          <Select
            value={issueFilter}
            label="Issue Type"
            onChange={(e) => setIssueFilter(e.target.value)}
          >
            <MenuItem value="">All Pages</MenuItem>
            {ISSUE_FILTERS.map((filter) => (
              <MenuItem key={filter.value} value={filter.value}>
                {filter.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={sortBy}
            label="Sort By"
            onChange={(e) => setSortBy(e.target.value)}
          >
            <MenuItem value="url">URL</MenuItem>
            <MenuItem value="statusCode">Status Code</MenuItem>
            <MenuItem value="responseTime">Response Time</MenuItem>
            <MenuItem value="wordCount">Word Count</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={() => {/* Handle CSV export */}}
        >
          Export CSV
        </Button>
      </Box>

      {/* Loading */}
      {pagesLoading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Pages Table */}
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
            {pages.map((pageData, index) => (
              <TableRow 
                key={index} 
                hover 
                sx={{ cursor: 'pointer' }}
                onClick={() => handlePageClick(pageData)}
              >
                <TableCell>
                  <Typography variant="body2" sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {pageData.url}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={pageData.statusCode}
                    color={getStatusColor(pageData.statusCode)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {pageData.title || 'No title'}
                  </Typography>
                  {!pageData.title && <WarningIcon color="warning" fontSize="small" />}
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {pageData.metaDescription || 'No description'}
                  </Typography>
                  {!pageData.metaDescription && <WarningIcon color="warning" fontSize="small" />}
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {pageData.h1?.length || 0}
                  </Typography>
                  {(pageData.h1?.length || 0) !== 1 && <WarningIcon color="warning" fontSize="small" />}
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {pageData.wordCount || 0}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color={pageData.responseTime > 3000 ? 'warning.main' : 'textSecondary'}>
                    {pageData.responseTime}ms
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {!pageData.title && <ErrorIcon color="error" fontSize="small" />}
                    {!pageData.metaDescription && <WarningIcon color="warning" fontSize="small" />}
                    {(pageData.h1?.length || 0) !== 1 && <InfoIcon color="info" fontSize="small" />}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        component="div"
        count={totalCount}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[25, 50, 100, 200]}
      />
    </Box>
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3, pb: 0 }}>
        <Typography variant="h4">
          {audit.name}
        </Typography>
        <Button onClick={onClose}>
          Back to List
        </Button>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Overview" />
          <Tab label={`Pages (${audit.summary?.crawledPages || 0})`} />
          <Tab label="Internal Links" />
          <Tab label="External Links" />
          <Tab label="Images" />
          <Tab label="Response Codes" />
          <Tab label="Page Titles" />
          <Tab label="Meta Descriptions" />
          <Tab label="H1" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 0 && renderOverviewTab()}
      {activeTab === 1 && renderPagesTab()}
      {activeTab === 2 && <Box sx={{ p: 3 }}><Typography>Internal Links analysis coming soon...</Typography></Box>}
      {activeTab === 3 && <Box sx={{ p: 3 }}><Typography>External Links analysis coming soon...</Typography></Box>}
      {activeTab === 4 && <Box sx={{ p: 3 }}><Typography>Images analysis coming soon...</Typography></Box>}
      {activeTab === 5 && <Box sx={{ p: 3 }}><Typography>Response Codes analysis coming soon...</Typography></Box>}
      {activeTab === 6 && <Box sx={{ p: 3 }}><Typography>Page Titles analysis coming soon...</Typography></Box>}
      {activeTab === 7 && <Box sx={{ p: 3 }}><Typography>Meta Descriptions analysis coming soon...</Typography></Box>}
      {activeTab === 8 && <Box sx={{ p: 3 }}><Typography>H1 analysis coming soon...</Typography></Box>}

      {/* Page Details Dialog */}
      <Dialog 
        open={pageDetailsOpen} 
        onClose={() => setPageDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Page Details
          <IconButton
            onClick={() => selectedPage && window.open(selectedPage.url, '_blank')}
            sx={{ float: 'right' }}
          >
            <LaunchIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedPage && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedPage.url}
              </Typography>
              
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Basic Information</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2">Status Code</Typography>
                      <Typography>{selectedPage.statusCode}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2">Response Time</Typography>
                      <Typography>{selectedPage.responseTime}ms</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2">Word Count</Typography>
                      <Typography>{selectedPage.wordCount}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2">Content Length</Typography>
                      <Typography>{selectedPage.contentLength} bytes</Typography>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>SEO Elements</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2">Title ({selectedPage.title?.length || 0} chars)</Typography>
                    <Typography>{selectedPage.title || 'No title'}</Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2">Meta Description ({selectedPage.metaDescription?.length || 0} chars)</Typography>
                    <Typography>{selectedPage.metaDescription || 'No meta description'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2">H1 Tags ({selectedPage.h1?.length || 0})</Typography>
                    {selectedPage.h1?.map((h1, index) => (
                      <Typography key={index} sx={{ ml: 2 }}>• {h1}</Typography>
                    ))}
                  </Box>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Links</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="subtitle2">
                    Internal Links ({selectedPage.internalLinks?.length || 0})
                  </Typography>
                  <Typography variant="subtitle2" sx={{ mt: 1 }}>
                    External Links ({selectedPage.externalLinks?.length || 0})
                  </Typography>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Images</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="subtitle2">
                    Total Images: {selectedPage.images?.length || 0}
                  </Typography>
                  <Typography variant="subtitle2" color="warning.main">
                    Images Without Alt: {selectedPage.images?.filter(img => !img.alt).length || 0}
                  </Typography>
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