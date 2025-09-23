import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Grid,
  Divider,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Slider,
  InputAdornment
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Language as LanguageIcon,
  Settings as SettingsIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';

interface Client {
  _id: string;
  name: string;
  website?: string;
}

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

interface AuditFormData {
  name: string;
  baseUrl: string;
  clientId: string;
  crawlSettings: CrawlSettings;
}

interface CreateAuditFormProps {
  onSubmit: (data: AuditFormData) => void;
  onCancel: () => void;
  loading?: boolean;
  error?: string;
}

const CreateAuditForm: React.FC<CreateAuditFormProps> = ({
  onSubmit,
  onCancel,
  loading = false,
  error
}) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<AuditFormData>({
    name: '',
    baseUrl: '',
    clientId: '',
    crawlSettings: {
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
    }
  });
  
  const [urlValidation, setUrlValidation] = useState({ isValid: false, message: '' });

  const steps = ['Basic Information', 'Crawl Settings', 'Review & Start'];

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    validateUrl(formData.baseUrl);
  }, [formData.baseUrl]);

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

  const validateUrl = (url: string) => {
    if (!url) {
      setUrlValidation({ isValid: false, message: '' });
      return;
    }

    try {
      // Add protocol if missing
      const urlToTest = url.startsWith('http') ? url : `https://${url}`;
      new URL(urlToTest);
      setUrlValidation({ isValid: true, message: 'Valid URL' });
    } catch {
      setUrlValidation({ isValid: false, message: 'Invalid URL format' });
    }
  };

  const handleInputChange = (field: keyof AuditFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCrawlSettingChange = (field: keyof CrawlSettings, value: any) => {
    setFormData(prev => ({
      ...prev,
      crawlSettings: {
        ...prev.crawlSettings,
        [field]: value
      }
    }));
  };

  const handleNext = () => {
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = () => {
    // Ensure URL has protocol
    const finalData = {
      ...formData,
      baseUrl: formData.baseUrl.startsWith('http') ? formData.baseUrl : `https://${formData.baseUrl}`
    };
    onSubmit(finalData);
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 0:
        return formData.name.trim() !== '' && formData.baseUrl.trim() !== '' && urlValidation.isValid;
      case 1:
        return true; // Settings are always valid with defaults
      case 2:
        return true; // Review step
      default:
        return false;
    }
  };

  const renderBasicInformation = () => (
    <Box sx={{ mt: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Audit Name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="e.g., Monthly SEO Audit - January 2024"
            required
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Website URL"
            value={formData.baseUrl}
            onChange={(e) => handleInputChange('baseUrl', e.target.value)}
            placeholder="example.com or https://example.com"
            required
            error={formData.baseUrl !== '' && !urlValidation.isValid}
            helperText={formData.baseUrl !== '' ? urlValidation.message : 'Enter the website URL to crawl'}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LanguageIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Client</InputLabel>
            <Select
              value={formData.clientId}
              label="Client"
              onChange={(e) => handleInputChange('clientId', e.target.value)}
            >
              <MenuItem value="">
                <em>No client (Personal audit)</em>
              </MenuItem>
              {clients.map((client) => (
                <MenuItem key={client._id} value={client._id}>
                  {client.name}
                  {client.website && (
                    <Typography variant="caption" color="textSecondary" sx={{ ml: 1 }}>
                      ({client.website})
                    </Typography>
                  )}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Box>
  );

  const renderCrawlSettings = () => (
    <Box sx={{ mt: 2 }}>
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Basic Crawl Settings</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography gutterBottom>
                Maximum Pages to Crawl: {formData.crawlSettings.maxPages}
              </Typography>
              <Slider
                value={formData.crawlSettings.maxPages}
                onChange={(_, value) => handleCrawlSettingChange('maxPages', value)}
                min={10}
                max={5000}
                step={10}
                marks={[
                  { value: 10, label: '10' },
                  { value: 500, label: '500' },
                  { value: 1000, label: '1K' },
                  { value: 5000, label: '5K' }
                ]}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography gutterBottom>
                Maximum Crawl Depth: {formData.crawlSettings.maxDepth}
              </Typography>
              <Slider
                value={formData.crawlSettings.maxDepth}
                onChange={(_, value) => handleCrawlSettingChange('maxDepth', value)}
                min={1}
                max={20}
                step={1}
                marks={[
                  { value: 1, label: '1' },
                  { value: 5, label: '5' },
                  { value: 10, label: '10' },
                  { value: 20, label: '20' }
                ]}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography gutterBottom>
                Delay Between Requests: {formData.crawlSettings.delay}ms
              </Typography>
              <Slider
                value={formData.crawlSettings.delay}
                onChange={(_, value) => handleCrawlSettingChange('delay', value)}
                min={0}
                max={5000}
                step={100}
                marks={[
                  { value: 0, label: '0ms' },
                  { value: 1000, label: '1s' },
                  { value: 2000, label: '2s' },
                  { value: 5000, label: '5s' }
                ]}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography gutterBottom>
                Request Timeout: {formData.crawlSettings.timeout / 1000}s
              </Typography>
              <Slider
                value={formData.crawlSettings.timeout}
                onChange={(_, value) => handleCrawlSettingChange('timeout', value)}
                min={5000}
                max={120000}
                step={5000}
                marks={[
                  { value: 5000, label: '5s' },
                  { value: 30000, label: '30s' },
                  { value: 60000, label: '60s' },
                  { value: 120000, label: '120s' }
                ]}
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Crawl Behavior</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.crawlSettings.respectRobotsTxt}
                    onChange={(e) => handleCrawlSettingChange('respectRobotsTxt', e.target.checked)}
                  />
                }
                label="Respect robots.txt"
              />
              <Typography variant="caption" color="textSecondary" display="block">
                Follow robots.txt directives
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.crawlSettings.includeSubdomains}
                    onChange={(e) => handleCrawlSettingChange('includeSubdomains', e.target.checked)}
                  />
                }
                label="Include Subdomains"
              />
              <Typography variant="caption" color="textSecondary" display="block">
                Crawl subdomains of the main domain
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.crawlSettings.followRedirects}
                    onChange={(e) => handleCrawlSettingChange('followRedirects', e.target.checked)}
                  />
                }
                label="Follow Redirects"
              />
              <Typography variant="caption" color="textSecondary" display="block">
                Follow 301/302 redirects
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.crawlSettings.crawlImages}
                    onChange={(e) => handleCrawlSettingChange('crawlImages', e.target.checked)}
                  />
                }
                label="Crawl Images"
              />
              <Typography variant="caption" color="textSecondary" display="block">
                Analyze images and their alt text
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.crawlSettings.crawlCSS}
                    onChange={(e) => handleCrawlSettingChange('crawlCSS', e.target.checked)}
                  />
                }
                label="Crawl CSS Files"
              />
              <Typography variant="caption" color="textSecondary" display="block">
                Discover and analyze CSS files
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.crawlSettings.crawlJS}
                    onChange={(e) => handleCrawlSettingChange('crawlJS', e.target.checked)}
                  />
                }
                label="Crawl JavaScript Files"
              />
              <Typography variant="caption" color="textSecondary" display="block">
                Discover and analyze JavaScript files
              </Typography>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Advanced Settings</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="User Agent"
                value={formData.crawlSettings.userAgent}
                onChange={(e) => handleCrawlSettingChange('userAgent', e.target.value)}
                helperText="The User-Agent string to use for requests"
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
    </Box>
  );

  const renderReview = () => (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Review Audit Configuration
      </Typography>
      
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Basic Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2" color="textSecondary">Name:</Typography>
              <Typography variant="body2">{formData.name}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="textSecondary">URL:</Typography>
              <Typography variant="body2">{formData.baseUrl}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="textSecondary">Client:</Typography>
              <Typography variant="body2">
                {formData.clientId ? 
                  clients.find(c => c._id === formData.clientId)?.name || 'Unknown' : 
                  'Personal Audit'
                }
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Crawl Settings
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} md={3}>
              <Typography variant="body2" color="textSecondary">Max Pages:</Typography>
              <Typography variant="body2">{formData.crawlSettings.maxPages}</Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="body2" color="textSecondary">Max Depth:</Typography>
              <Typography variant="body2">{formData.crawlSettings.maxDepth}</Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="body2" color="textSecondary">Delay:</Typography>
              <Typography variant="body2">{formData.crawlSettings.delay}ms</Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="body2" color="textSecondary">Timeout:</Typography>
              <Typography variant="body2">{formData.crawlSettings.timeout / 1000}s</Typography>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Options:
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {formData.crawlSettings.respectRobotsTxt && (
              <Typography variant="caption" sx={{ bgcolor: 'success.light', px: 1, borderRadius: 1 }}>
                Respect robots.txt
              </Typography>
            )}
            {formData.crawlSettings.includeSubdomains && (
              <Typography variant="caption" sx={{ bgcolor: 'info.light', px: 1, borderRadius: 1 }}>
                Include subdomains
              </Typography>
            )}
            {formData.crawlSettings.followRedirects && (
              <Typography variant="caption" sx={{ bgcolor: 'primary.light', px: 1, borderRadius: 1 }}>
                Follow redirects
              </Typography>
            )}
            {formData.crawlSettings.crawlImages && (
              <Typography variant="caption" sx={{ bgcolor: 'secondary.light', px: 1, borderRadius: 1 }}>
                Crawl images
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );

  return (
    <Box>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Create New Site Audit
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {activeStep === 0 && renderBasicInformation()}
          {activeStep === 1 && renderCrawlSettings()}
          {activeStep === 2 && renderReview()}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button onClick={onCancel}>
              Cancel
            </Button>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              {activeStep > 0 && (
                <Button onClick={handleBack}>
                  Back
                </Button>
              )}
              
              {activeStep < steps.length - 1 ? (
                <Button 
                  variant="contained" 
                  onClick={handleNext}
                  disabled={!isStepValid(activeStep)}
                >
                  Next
                </Button>
              ) : (
                <Button 
                  variant="contained" 
                  onClick={handleSubmit}
                  disabled={loading || !isStepValid(activeStep)}
                  startIcon={loading ? <ScheduleIcon /> : <SettingsIcon />}
                >
                  {loading ? 'Starting Audit...' : 'Start Audit'}
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CreateAuditForm;