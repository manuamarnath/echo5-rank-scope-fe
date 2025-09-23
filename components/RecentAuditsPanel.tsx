import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  Close as CloseIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

interface Audit {
  _id: string;
  name: string;
  baseUrl: string;
  status: string;
  createdAt: string;
  summary?: {
    crawledPages: number;
  };
  issues?: {
    missingTitles: number;
    missingDescriptions: number;
    brokenLinks: number;
  };
}

interface RecentAuditsPanelProps {
  clientId?: string;
  onSelectAudit: (auditId: string) => void;
  onClose: () => void;
}

const RecentAuditsPanel: React.FC<RecentAuditsPanelProps> = ({
  clientId,
  onSelectAudit,
  onClose
}) => {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentAudits();
  }, [clientId]);

  const fetchRecentAudits = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const params = new URLSearchParams({
        page: '1',
        limit: '10',
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      if (clientId) params.append('clientId', clientId);

      const response = await fetch(`/api/audits?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        let data;
        try {
          data = await response.json();
          setAudits(data.data || []);
        } catch (parseError) {
          console.error('Error parsing audits response:', parseError);
          setAudits([]);
        }
      } else {
        console.error('Error fetching audits:', response.status, response.statusText);
        setAudits([]);
      }
    } catch (err) {
      console.error('Error fetching recent audits:', err);
      setAudits([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'crawling': return 'info';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getTotalIssues = (issues?: Audit['issues']) => {
    if (!issues) return 0;
    return (issues.missingTitles || 0) + 
           (issues.missingDescriptions || 0) + 
           (issues.brokenLinks || 0);
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Recent Audits</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <List sx={{ maxHeight: 400, overflow: 'auto' }}>
          {audits.length === 0 ? (
            <ListItem>
              <ListItemText 
                primary="No recent audits"
                secondary="Start a new audit to see it here"
              />
            </ListItem>
          ) : (
            audits.map((audit, index) => (
              <React.Fragment key={audit._id}>
                {index > 0 && <Divider />}
                <ListItem disablePadding>
                  <ListItemButton onClick={() => onSelectAudit(audit._id)}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1">{audit.name}</Typography>
                          <Chip 
                            label={audit.status} 
                            size="small" 
                            color={getStatusColor(audit.status) as any}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="caption" display="block">
                            {audit.baseUrl}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(audit.createdAt).toLocaleString()} • 
                            {audit.summary?.crawledPages || 0} pages • 
                            {getTotalIssues(audit.issues)} issues
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" onClick={() => onSelectAudit(audit._id)}>
                        <ViewIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItemButton>
                </ListItem>
              </React.Fragment>
            ))
          )}
        </List>
      )}
    </Paper>
  );
};

export default RecentAuditsPanel;
