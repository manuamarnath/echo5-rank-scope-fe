import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Tabs, 
  Tab, 
  Typography, 
  Card, 
  CardContent, 
  TextField, 
  Button, 
  Grid,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import DownloadIcon from '@mui/icons-material/Download';
import MainLayout from '../src/components/layout/MainLayout';

interface CrawlSummary {
  totalPages: number;
  crawledPages: number;
  errorPages: number;
  redirectPages: number;
  averageResponseTime: number;
  totalWordCount: number;
  averageWordCount: number;
  totalImages: number;
  totalInternalLinks: number;
  totalExternalLinks: number;
}

interface CrawlIssues {
  missingTitles: number;
  missingDescriptions: number;
  duplicateTitles: number;
  duplicateDescriptions: number;
  missingH1: number;
  multipleH1: number;
  brokenLinks: number;
  redirectChains: number;
  slowPages: number;
  largePages: number;
}

interface Audit {
  _id: string;
  name: string;
  baseUrl: string;
  status: 'pending' | 'crawling' | 'completed' | 'failed';
  summary?: CrawlSummary;
  issues?: CrawlIssues;
  createdAt: string;
  endTime?: string;
  duration?: number;
}

interface CrawlResults {
  url: string;
  summary?: CrawlSummary;
  issues?: CrawlIssues;
}

export default function Audits() {
  const [activeTab, setActiveTab] = useState('list');
  const [url, setUrl] = useState('');
  const [isCrawling, setIsCrawling] = useState(false);
  const [crawlResults, setCrawlResults] = useState<CrawlResults | null>(null);
  const [error, setError] = useState('');
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };

  useEffect(() => {
    if (activeTab === 'list') {
      fetchAudits();
    }
  }, [activeTab]);

  const fetchAudits = async () => {
    setLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch('/api/audits', {
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        setAudits(data.data || []);
      } else {
        console.error('Failed to fetch audits');
      }
    } catch (error) {
      console.error('Error fetching audits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCrawl = async () => {
    if (!url) {
      setError('Please enter a valid URL');
      return;
    }

    setIsCrawling(true);
    setError('');
    
    try {
      // Add http:// if missing
      let targetUrl = url;
      if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
        targetUrl = `https://${targetUrl}`;
      }

      // Include authorization token if present
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch('/api/audits', {
        method: 'POST',
        headers,
        body: JSON.stringify({ 
          name: `Audit for ${targetUrl}`,
          baseUrl: targetUrl,
          crawlSettings: {
            maxPages: 100
          }
        }),
      });

      // Try to parse server response (even for non-OK) to show useful messages
      let data;
      try {
        data = await response.json();
      } catch (err) {
        data = null;
      }

      if (!response.ok) {
        // If server returned a message, surface it; otherwise use generic message
        const serverMessage = data?.message || data?.error || 'Crawl failed';
        // If auth error, give actionable message
        if (response.status === 401) {
          setError(serverMessage || 'Authentication required. Please sign in.');
        } else {
          setError(serverMessage || 'Failed to crawl website. Please check the URL and try again.');
        }
        return;
      }

      setCrawlResults(data);
    } catch {
      setError('Failed to crawl website. Please check the URL and try again.');
    } finally {
      setIsCrawling(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'crawling': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const formatDuration = (duration?: number) => {
    if (!duration) return 'N/A';
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const renderAuditsList = () => (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Site Audits
          </Typography>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>URL</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Pages</TableCell>
                    <TableCell>Issues</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Created</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {audits.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Typography variant="body2" color="text.secondary">
                          No audits found. Create your first audit in the "Crawl & Audit" tab.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    audits.map((audit) => (
                      <TableRow key={audit._id}>
                        <TableCell>{audit.name}</TableCell>
                        <TableCell>{audit.baseUrl}</TableCell>
                        <TableCell>
                          <Chip 
                            label={audit.status} 
                            color={getStatusColor(audit.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{audit.summary?.totalPages || 0}</TableCell>
                        <TableCell>
                          {audit.issues ? (
                            audit.issues.missingTitles + audit.issues.missingDescriptions + audit.issues.brokenLinks
                          ) : 0}
                        </TableCell>
                        <TableCell>{formatDuration(audit.duration)}</TableCell>
                        <TableCell>
                          {new Date(audit.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );

  const renderCrawlTab = () => (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Website Crawl & Audit
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Enter a website URL to perform a comprehensive SEO audit. The crawler will analyze meta tags, 
            headings, links, and other SEO factors.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            <TextField
              fullWidth
              label="Website URL"
              placeholder="example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              error={!!error}
              helperText={error}
              disabled={isCrawling}
            />
            <Button
              variant="contained"
              onClick={handleCrawl}
              disabled={isCrawling}
              startIcon={isCrawling ? <CircularProgress size={20} /> : <SearchIcon />}
              sx={{ minWidth: 120, height: 56 }}
            >
              {isCrawling ? 'Crawling...' : 'Start Audit'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {crawlResults && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Audit Results for {crawlResults.url}
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, bgcolor: 'success.light', color: 'success.dark' }}>
                  <Typography variant="h4">{crawlResults.summary?.totalPages || 0}</Typography>
                  <Typography variant="body2">Pages Crawled</Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, bgcolor: 'info.light', color: 'info.dark' }}>
                  <Typography variant="h4">
                    {(crawlResults.issues?.missingTitles || 0) + 
                     (crawlResults.issues?.missingDescriptions || 0) + 
                     (crawlResults.issues?.brokenLinks || 0)}
                  </Typography>
                  <Typography variant="body2">SEO Issues Found</Typography>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Quick Stats
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} md={3}>
                    <Typography variant="body2" color="text.secondary">Missing Titles</Typography>
                    <Typography variant="body1">{crawlResults.issues?.missingTitles || 0}</Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography variant="body2" color="text.secondary">Missing Descriptions</Typography>
                    <Typography variant="body1">{crawlResults.issues?.missingDescriptions || 0}</Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography variant="body2" color="text.secondary">Broken Links</Typography>
                    <Typography variant="body1">{crawlResults.issues?.brokenLinks || 0}</Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography variant="body2" color="text.secondary">Redirects</Typography>
                    <Typography variant="body1">{crawlResults.summary?.redirectPages || 0}</Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  );

  return (
    <MainLayout>
      <Box sx={{ px: { xs: 1, sm: 2, md: 4 }, py: 2, mt: 1 }}>
        <Tabs
          value={activeTab}
          onChange={handleChange}
          centered
          sx={{ mb: 3, '& .MuiTabs-indicator': { backgroundColor: 'primary.main' } }}
        >
          <Tab
            label="My Audits"
            value="list"
            icon={<AnalyticsIcon />}
            iconPosition="start"
          />
          <Tab
            label="Crawl & Audit"
            value="crawl"
            icon={<SearchIcon />}
            iconPosition="start"
          />
        </Tabs>

        <Box>
          {activeTab === 'list' && renderAuditsList()}
          {activeTab === 'crawl' && renderCrawlTab()}
        </Box>
      </Box>
    </MainLayout>
  );
}