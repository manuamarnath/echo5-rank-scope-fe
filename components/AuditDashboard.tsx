import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  LinearProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Assessment as AssessmentIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';

interface AuditStats {
  totalAudits: number;
  completedAudits: number;
  runningAudits: number;
  failedAudits: number;
  totalPagesCrawled: number;
  totalIssuesFound: number;
}

interface Audit {
  _id: string;
  name: string;
  baseUrl: string;
  status: 'pending' | 'crawling' | 'completed' | 'failed' | 'paused';
  clientId?: {
    _id: string;
    name: string;
    website?: string;
  };
  summary?: {
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
  createdAt: string;
  duration?: number;
  endTime?: string;
}

interface ClientBreakdown {
  _id: string;
  clientName: string;
  auditCount: number;
  totalPages: number;
  totalIssues: number;
}

interface DashboardData {
  stats: AuditStats;
  recentAudits: Audit[];
  clientBreakdown: ClientBreakdown[];
}

interface AuditDashboardProps {
  onCreateAudit: () => void;
  onViewAudit: (auditId: string) => void;
  selectedClientId?: string;
}

const AuditDashboard: React.FC<AuditDashboardProps> = ({
  onCreateAudit,
  onViewAudit,
  selectedClientId
}) => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, [selectedClientId]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const params = new URLSearchParams();
      if (selectedClientId) params.append('clientId', selectedClientId);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/audits/dashboard?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await response.json();
      setDashboardData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'crawling': return 'info';
      case 'failed': return 'error';
      case 'paused': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircleIcon />;
      case 'crawling': return <ScheduleIcon />;
      case 'failed': return <ErrorIcon />;
      case 'paused': return <PauseIcon />;
      default: return <ScheduleIcon />;
    }
  };

  const formatDuration = (duration?: number) => {
    if (!duration) return 'N/A';
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  const getTotalIssues = (issues?: Audit['issues']) => {
    if (!issues) return 0;
    return (issues.missingTitles || 0) + 
           (issues.missingDescriptions || 0) + 
           (issues.brokenLinks || 0) + 
           (issues.duplicateTitles || 0);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Loading dashboard...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
        <Button onClick={fetchDashboardData} sx={{ mt: 2 }}>
          Retry
        </Button>
      </Box>
    );
  }

  if (!dashboardData) return null;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Site Audit Dashboard
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onCreateAudit}
        >
          New Audit
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Audits
              </Typography>
              <Typography variant="h4">
                {dashboardData.stats.totalAudits}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Completed
              </Typography>
              <Typography variant="h4" color="success.main">
                {dashboardData.stats.completedAudits}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Running
              </Typography>
              <Typography variant="h4" color="info.main">
                {dashboardData.stats.runningAudits}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Failed
              </Typography>
              <Typography variant="h4" color="error.main">
                {dashboardData.stats.failedAudits}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Pages Crawled
              </Typography>
              <Typography variant="h4">
                {dashboardData.stats.totalPagesCrawled?.toLocaleString() || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Issues Found
              </Typography>
              <Typography variant="h4" color="warning.main">
                {dashboardData.stats.totalIssuesFound?.toLocaleString() || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Audits */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Audits
              </Typography>
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
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dashboardData.recentAudits.map((audit) => (
                      <TableRow key={audit._id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {audit.name}
                          </Typography>
                          {audit.clientId && (
                            <Typography variant="caption" color="textSecondary">
                              {audit.clientId.name}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {audit.baseUrl}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getStatusIcon(audit.status)}
                            label={audit.status}
                            color={getStatusColor(audit.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {audit.summary?.crawledPages || 0}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2">
                              {getTotalIssues(audit.issues)}
                            </Typography>
                            {getTotalIssues(audit.issues) > 0 && (
                              <WarningIcon color="warning" fontSize="small" />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          {formatDuration(audit.duration)}
                        </TableCell>
                        <TableCell>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => onViewAudit(audit._id)}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Client Breakdown */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Client Breakdown
              </Typography>
              {dashboardData.clientBreakdown.map((client) => (
                <Box key={client._id} sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="subtitle2" fontWeight="medium">
                    {client.clientName}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant="caption" color="textSecondary">
                      Audits: {client.auditCount}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Pages: {client.totalPages}
                    </Typography>
                    <Typography variant="caption" color="warning.main">
                      Issues: {client.totalIssues}
                    </Typography>
                  </Box>
                </Box>
              ))}
              {dashboardData.clientBreakdown.length === 0 && (
                <Typography variant="body2" color="textSecondary">
                  No client data available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AuditDashboard;