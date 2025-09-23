import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Button,
  Menu,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

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

interface Client {
  _id: string;
  name: string;
  website?: string;
}

interface AuditListProps {
  onViewAudit: (auditId: string) => void;
  selectedClientId?: string;
}

const AuditList: React.FC<AuditListProps> = ({ onViewAudit, selectedClientId }) => {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalCount, setTotalCount] = useState(0);
  
  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [clientFilter, setClientFilter] = useState(selectedClientId || '');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // UI State
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedAudit, setSelectedAudit] = useState<Audit | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchAudits();
  }, [page, rowsPerPage, search, statusFilter, clientFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (selectedClientId) {
      setClientFilter(selectedClientId);
    }
  }, [selectedClientId]);

  const fetchAudits = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const params = new URLSearchParams({
        page: (page + 1).toString(),
        limit: rowsPerPage.toString(),
        sortBy,
        sortOrder
      });
      
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      if (clientFilter) params.append('clientId', clientFilter);

      const response = await fetch(`/api/audits?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch audits');
      }

      const data = await response.json();
      setAudits(data.data);
      setTotalCount(data.pagination.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setClients(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching clients:', err);
    }
  };

  const handleActionClick = (event: React.MouseEvent<HTMLElement>, audit: Audit) => {
    setAnchorEl(event.currentTarget);
    setSelectedAudit(audit);
  };

  const handleActionClose = () => {
    setAnchorEl(null);
    setSelectedAudit(null);
  };

  const handleDeleteAudit = async () => {
    if (!selectedAudit) return;
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/audits/${selectedAudit._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchAudits();
      } else {
        throw new Error('Failed to delete audit');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete audit');
    }
    
    setDeleteDialogOpen(false);
    handleActionClose();
  };

  const handleDownloadReport = async (auditId: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/audits/${auditId}/export`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-report-${auditId}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      setError('Failed to download report');
    }
    handleActionClose();
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

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box>
      <Card>
        <CardContent>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              Site Audits
            </Typography>
            <Button
              startIcon={<RefreshIcon />}
              onClick={fetchAudits}
              disabled={loading}
            >
              Refresh
            </Button>
          </Box>

          {/* Filters */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder="Search audits..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 200 }}
            />
            
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="crawling">Crawling</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
                <MenuItem value="paused">Paused</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Client</InputLabel>
              <Select
                value={clientFilter}
                label="Client"
                onChange={(e) => setClientFilter(e.target.value)}
              >
                <MenuItem value="">All Clients</MenuItem>
                {clients.map((client) => (
                  <MenuItem key={client._id} value={client._id}>
                    {client.name}
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
                <MenuItem value="createdAt">Date Created</MenuItem>
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="baseUrl">URL</MenuItem>
                <MenuItem value="status">Status</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 100 }}>
              <InputLabel>Order</InputLabel>
              <Select
                value={sortOrder}
                label="Order"
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <MenuItem value="desc">Desc</MenuItem>
                <MenuItem value="asc">Asc</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Loading */}
          {loading && <LinearProgress sx={{ mb: 2 }} />}

          {/* Error */}
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          {/* Table */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>URL</TableCell>
                  <TableCell>Client</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Pages</TableCell>
                  <TableCell>Issues</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {audits.map((audit) => (
                  <TableRow key={audit._id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {audit.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {audit.baseUrl}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {audit.clientId ? (
                        <Typography variant="body2">
                          {audit.clientId.name}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="textSecondary">
                          No client
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={audit.status}
                        color={getStatusColor(audit.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {audit.summary?.crawledPages || 0}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color={getTotalIssues(audit.issues) > 0 ? 'warning.main' : 'textSecondary'}>
                        {getTotalIssues(audit.issues)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDuration(audit.duration)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(audit.createdAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => onViewAudit(audit._id)}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <IconButton
                          size="small"
                          onClick={(e) => handleActionClick(e, audit)}
                        >
                          <MoreVertIcon />
                        </IconButton>
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
            rowsPerPageOptions={[10, 25, 50, 100]}
          />
        </CardContent>
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleActionClose}
      >
        <MenuItem onClick={() => selectedAudit && onViewAudit(selectedAudit._id)}>
          <ListItemIcon>
            <ViewIcon />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => selectedAudit && handleDownloadReport(selectedAudit._id)}>
          <ListItemIcon>
            <DownloadIcon />
          </ListItemIcon>
          <ListItemText>Download Report</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => setDeleteDialogOpen(true)}>
          <ListItemIcon>
            <DeleteIcon />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Audit</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the audit "{selectedAudit?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteAudit} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AuditList;