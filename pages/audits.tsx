import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Paper,
  IconButton,
  InputAdornment,
  Chip,
  Stack,
  CircularProgress,
  Tooltip,
  Divider
} from '@mui/material';
import { 
  Search as SearchIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import MainLayout from '../src/components/layout/MainLayout';
import AuditViewer from '../components/AuditViewer';
import QuickAuditSettings from '../components/QuickAuditSettings';
import RecentAuditsPanel from '../components/RecentAuditsPanel';

interface Client {
  _id: string;
  name: string;
  website?: string;
}

const Audits: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [urlToAudit, setUrlToAudit] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showRecentAudits, setShowRecentAudits] = useState(false);
  const [activeAuditId, setActiveAuditId] = useState<string>('');
  const [crawlSettings, setCrawlSettings] = useState({
    maxPages: 500,
    maxDepth: 10,
    respectRobotsTxt: true,
    includeSubdomains: false,
    followRedirects: true,
    crawlImages: true,
    crawlCSS: false,
    crawlJS: false,
    userAgent: 'RankScopeBot/1.0',
    delay: 1000,
    timeout: 30000
  });

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    // Auto-populate URL when client is selected
    if (selectedClient?.website) {
      setUrlToAudit(selectedClient.website);
    }
  }, [selectedClient]);

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/clients', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setClients(data || []); // Backend returns clients array directly
      } else {
        console.error('Error fetching clients:', response.status, response.statusText);
      }
    } catch (err) {
      console.error('Error fetching clients:', err);
    }
  };

  const handleStartAudit = async () => {
    if (!urlToAudit) {
      setError('Please enter a URL to audit');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('auth_token');
      const auditName = selectedClient 
        ? `${selectedClient.name} - ${new Date().toLocaleDateString()}`
        : `Audit - ${urlToAudit} - ${new Date().toLocaleDateString()}`;

      const response = await fetch('/api/audits', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: auditName,
          baseUrl: urlToAudit.startsWith('http') ? urlToAudit : `https://${urlToAudit}`,
          clientId: selectedClient?._id || '',
          crawlSettings
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to start audit';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
          errorMessage = `Server error (${response.status})`;
        }
        throw new Error(errorMessage);
      }

      let newAudit;
      try {
        newAudit = await response.json();
      } catch (parseError) {
        console.error('Error parsing success response:', parseError);
        throw new Error('Audit may have started but response was invalid');
      }
      
      setSuccess('Audit started successfully!');
      setActiveAuditId(newAudit._id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start audit');
    } finally {
      setLoading(false);
    }
  };

  const handleClientChange = (event: any) => {
    const client = clients.find(c => c._id === event.target.value);
    setSelectedClient(client || null);
  };

  if (activeAuditId) {
    return (
      <MainLayout>
        <AuditViewer 
          auditId={activeAuditId} 
          onClose={() => setActiveAuditId('')}
        />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            SEO Site Audit
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Select a client and start crawling their website for SEO analysis
          </Typography>
        </Box>

        {/* Main Control Panel */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Stack spacing={3}>
            {/* Client Selection */}
            <FormControl fullWidth>
              <InputLabel id="client-select-label">
                <BusinessIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Select Client
              </InputLabel>
              <Select
                labelId="client-select-label"
                value={selectedClient?._id || ''}
                label="Select Client"
                onChange={handleClientChange}
              >
                <MenuItem value="">
                  <em>No Client (Quick Audit)</em>
                </MenuItem>
                {clients.map((client) => (
                  <MenuItem key={client._id} value={client._id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography>{client.name}</Typography>
                        {client.website && (
                          <Typography variant="caption" color="text.secondary">
                            {client.website}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* URL Input */}
            <TextField
              fullWidth
              label="URL to Audit"
              placeholder="https://example.com"
              value={urlToAudit}
              onChange={(e) => setUrlToAudit(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              helperText={selectedClient ? `Auditing for ${selectedClient.name}` : 'Enter the website URL to crawl'}
            />

            {/* Quick Settings Display */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip label={`Max ${crawlSettings.maxPages} pages`} size="small" />
              <Chip label={`Depth ${crawlSettings.maxDepth}`} size="small" />
              <Chip label={`${crawlSettings.delay}ms delay`} size="small" />
              {crawlSettings.respectRobotsTxt && <Chip label="Respects robots.txt" size="small" color="primary" />}
              {crawlSettings.crawlImages && <Chip label="Images" size="small" color="secondary" />}
            </Box>

            <Divider />

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PlayIcon />}
                onClick={handleStartAudit}
                disabled={loading || !urlToAudit}
                sx={{ minWidth: 150 }}
              >
                {loading ? 'Starting...' : 'Start Audit'}
              </Button>

              <Tooltip title="Audit Settings">
                <IconButton 
                  onClick={() => setShowSettings(!showSettings)}
                  color={showSettings ? 'primary' : 'default'}
                >
                  <SettingsIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title="Recent Audits">
                <IconButton 
                  onClick={() => setShowRecentAudits(!showRecentAudits)}
                  color={showRecentAudits ? 'primary' : 'default'}
                >
                  <HistoryIcon />
                </IconButton>
              </Tooltip>

              <Box sx={{ flexGrow: 1 }} />

              {selectedClient && (
                <Typography variant="body2" color="text.secondary">
                  Client: <strong>{selectedClient.name}</strong>
                </Typography>
              )}
            </Box>
          </Stack>
        </Paper>

        {/* Settings Panel */}
        {showSettings && (
          <QuickAuditSettings
            settings={crawlSettings}
            onChange={setCrawlSettings}
            onClose={() => setShowSettings(false)}
          />
        )}

        {/* Recent Audits Panel */}
        {showRecentAudits && (
          <RecentAuditsPanel
            clientId={selectedClient?._id}
            onSelectAudit={(auditId) => setActiveAuditId(auditId)}
            onClose={() => setShowRecentAudits(false)}
          />
        )}

        {/* Messages */}
        <Snackbar
          open={!!success}
          autoHideDuration={6000}
          onClose={() => setSuccess('')}
        >
          <Alert onClose={() => setSuccess('')} severity="success">
            {success}
          </Alert>
        </Snackbar>

        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError('')}
        >
          <Alert onClose={() => setError('')} severity="error">
            {error}
          </Alert>
        </Snackbar>
      </Box>
    </MainLayout>
  );
};

export default Audits;