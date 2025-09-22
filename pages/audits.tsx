import React, { useState } from 'react';
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
  Paper
} from '@mui/material';

interface CrawlSummary {
  totalPages: number;
  missingTitles: number;
  missingDescriptions: number;
  brokenLinks: number;
  redirectPages: number;
}

interface CrawlIssues {
  missingTitles: number;
  missingDescriptions: number;
  brokenLinks: number;
}

interface CrawlResults {
  url: string;
  summary?: CrawlSummary;
  issues?: CrawlIssues;
}
import {
  Search as SearchIcon,
  Analytics as AnalyticsIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import MainLayout from '../src/components/layout/MainLayout';

export default function Audits() {
  const [activeTab, setActiveTab] = useState('crawl');
  const [url, setUrl] = useState('');
  const [isCrawling, setIsCrawling] = useState(false);
  const [crawlResults, setCrawlResults] = useState<CrawlResults | null>(null);
  const [error, setError] = useState('');

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
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

      const response = await fetch('/api/audits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name: `Audit for ${targetUrl}`,
          baseUrl: targetUrl,
          crawlSettings: {
            maxPages: 100
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Crawl failed');
      }

      const data = await response.json();
      setCrawlResults(data);
    } catch {
      setError('Failed to crawl website. Please check the URL and try again.');
    } finally {
      setIsCrawling(false);
    }
  };

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
                    <Typography variant="body1">{crawlResults.summary?.missingTitles || 0}</Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography variant="body2" color="text.secondary">Missing Descriptions</Typography>
                    <Typography variant="body1">{crawlResults.summary?.missingDescriptions || 0}</Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography variant="body2" color="text.secondary">Broken Links</Typography>
                    <Typography variant="body1">{crawlResults.summary?.brokenLinks || 0}</Typography>
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

  const renderAnalysisTab = () => (
    <Box sx={{ maxWidth: 800, mx: 'auto', textAlign: 'center', py: 8 }}>
      <AnalyticsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h6" gutterBottom>
        SEO Analysis
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Detailed SEO analysis and recommendations will be available here after crawling a website.
      </Typography>
    </Box>
  );

  const renderExportTab = () => (
    <Box sx={{ maxWidth: 800, mx: 'auto', textAlign: 'center', py: 8 }}>
      <DownloadIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h6" gutterBottom>
        Export Reports
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Export comprehensive audit reports in CSV, PDF, and other formats.
      </Typography>
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
            label="Crawl & Audit"
            value="crawl"
            icon={<SearchIcon />}
            iconPosition="start"
          />
          <Tab
            label="SEO Analysis"
            value="analysis"
            icon={<AnalyticsIcon />}
            iconPosition="start"
          />
          <Tab
            label="Export"
            value="export"
            icon={<DownloadIcon />}
            iconPosition="start"
          />
        </Tabs>

        <Box>
          {activeTab === 'crawl' && renderCrawlTab()}
          {activeTab === 'analysis' && renderAnalysisTab()}
          {activeTab === 'export' && renderExportTab()}
        </Box>
      </Box>
    </MainLayout>
  );
}