import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Slider,
  Switch,
  FormControlLabel,
  Grid,
  IconButton,
  Divider,
  Button
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

interface CrawlSettings {
  maxPages: number;
  maxDepth: number;
  respectRobotsTxt: boolean;
  includeSubdomains: boolean;
  followRedirects: boolean;
  crawlImages: boolean;
  crawlCSS: boolean;
  crawlJS: boolean;
  userAgent: string;
  delay: number;
  timeout: number;
}

interface QuickAuditSettingsProps {
  settings: CrawlSettings;
  onChange: (settings: CrawlSettings) => void;
  onClose: () => void;
}

const QuickAuditSettings: React.FC<QuickAuditSettingsProps> = ({
  settings,
  onChange,
  onClose
}) => {
  const handleChange = (field: keyof CrawlSettings, value: any) => {
    onChange({
      ...settings,
      [field]: value
    });
  };

  const presets = {
    fast: {
      maxPages: 100,
      maxDepth: 3,
      delay: 200,
      crawlImages: false,
      crawlCSS: false,
      crawlJS: false
    },
    standard: {
      maxPages: 500,
      maxDepth: 10,
      delay: 1000,
      crawlImages: true,
      crawlCSS: false,
      crawlJS: false
    },
    comprehensive: {
      maxPages: 2000,
      maxDepth: 20,
      delay: 2000,
      crawlImages: true,
      crawlCSS: true,
      crawlJS: true
    }
  };

  const applyPreset = (preset: keyof typeof presets) => {
    onChange({
      ...settings,
      ...presets[preset]
    });
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Crawl Settings</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>Quick Presets</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button size="small" variant="outlined" onClick={() => applyPreset('fast')}>
            Fast Scan
          </Button>
          <Button size="small" variant="outlined" onClick={() => applyPreset('standard')}>
            Standard
          </Button>
          <Button size="small" variant="outlined" onClick={() => applyPreset('comprehensive')}>
            Comprehensive
          </Button>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Typography gutterBottom>
            Max Pages: {settings.maxPages}
          </Typography>
          <Slider
            value={settings.maxPages}
            onChange={(_, value) => handleChange('maxPages', value)}
            min={10}
            max={5000}
            step={10}
            marks={[
              { value: 10, label: '10' },
              { value: 1000, label: '1K' },
              { value: 5000, label: '5K' }
            ]}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography gutterBottom>
            Max Depth: {settings.maxDepth}
          </Typography>
          <Slider
            value={settings.maxDepth}
            onChange={(_, value) => handleChange('maxDepth', value)}
            min={1}
            max={20}
            marks={[
              { value: 1, label: '1' },
              { value: 10, label: '10' },
              { value: 20, label: '20' }
            ]}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography gutterBottom>
            Delay: {settings.delay}ms
          </Typography>
          <Slider
            value={settings.delay}
            onChange={(_, value) => handleChange('delay', value)}
            min={0}
            max={5000}
            step={100}
            marks={[
              { value: 0, label: '0' },
              { value: 2500, label: '2.5s' },
              { value: 5000, label: '5s' }
            ]}
          />
        </Grid>

        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={6} md={3}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.respectRobotsTxt}
                    onChange={(e) => handleChange('respectRobotsTxt', e.target.checked)}
                  />
                }
                label="Respect robots.txt"
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.includeSubdomains}
                    onChange={(e) => handleChange('includeSubdomains', e.target.checked)}
                  />
                }
                label="Include Subdomains"
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.crawlImages}
                    onChange={(e) => handleChange('crawlImages', e.target.checked)}
                  />
                }
                label="Crawl Images"
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.followRedirects}
                    onChange={(e) => handleChange('followRedirects', e.target.checked)}
                  />
                }
                label="Follow Redirects"
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default QuickAuditSettings;
