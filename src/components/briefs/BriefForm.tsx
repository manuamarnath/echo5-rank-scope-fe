import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Select, MenuItem, IconButton, Chip, Divider, FormControl, InputLabel } from '@mui/material';

type Step = 1 | 2 | 3 | 4;

interface TargetKeyword {
  keyword: string;
  searchIntent: string;
  priority: number;
  notes?: string;
}

interface ContentSection {
  title: string;
  content: string;
  wordCount?: number;
}

interface BriefFormData {
  pageUrl: string;
  pageTitle: string;
  targetKeywords: TargetKeyword[];
  contentSections: ContentSection[];
  existingContent?: string;
  tone: 'professional' | 'casual' | 'authoritative' | 'conversational';
  targetAudience: string;
  additionalNotes: string;
}

const initialFormData: BriefFormData = {
  pageUrl: '',
  pageTitle: '',
  targetKeywords: [],
  contentSections: [],
  existingContent: '',
  tone: 'professional',
  targetAudience: '',
  additionalNotes: '',
};

interface BriefFormProps {
  onSubmit: (data: BriefFormData) => void;
  onCancel?: () => void;
}

const BriefForm: React.FC<BriefFormProps> = ({ onSubmit, onCancel }) => {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [formData, setFormData] = useState<BriefFormData>(initialFormData);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const updateFormData = (field: keyof BriefFormData, value: string | string[] | TargetKeyword[] | ContentSection[] | 'professional' | 'casual' | 'authoritative' | 'conversational') => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addTargetKeyword = () => {
    setFormData(prev => ({
      ...prev,
      targetKeywords: [...prev.targetKeywords, { keyword: '', searchIntent: '', priority: 5, notes: '' }],
    }));
  };

  const updateTargetKeyword = (index: number, field: keyof TargetKeyword, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      targetKeywords: prev.targetKeywords.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const removeTargetKeyword = (index: number) => {
    setFormData(prev => ({
      ...prev,
      targetKeywords: prev.targetKeywords.filter((_, i) => i !== index),
    }));
  };

  const addContentSection = () => {
    setFormData(prev => ({
      ...prev,
      contentSections: [...prev.contentSections, { title: '', content: '', wordCount: 0 }],
    }));
  };

  const updateContentSection = (index: number, field: keyof ContentSection, value: string | number) => {
    if (field === 'content' && typeof value === 'string') {
      const wordCount = value.trim().split(/\s+/).length;
      setFormData(prev => ({
        ...prev,
        contentSections: prev.contentSections.map((item, i) =>
          i === index ? { ...item, [field]: value, wordCount } : item
        ),
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        contentSections: prev.contentSections.map((item, i) =>
          i === index ? { ...item, [field]: value } : item
        ),
      }));
    }
  };

  const removeContentSection = (index: number) => {
    setFormData(prev => ({
      ...prev,
      contentSections: prev.contentSections.filter((_, i) => i !== index),
    }));
  };

  const validateStep = (step: Step) => {
    const newErrors: { [key: string]: string } = {};

    switch (step) {
      case 1:
        if (!formData.pageUrl.trim()) newErrors.pageUrl = 'Page URL is required';
        if (!formData.pageTitle.trim()) newErrors.pageTitle = 'Page Title is required';
        break;
      case 2:
        if (formData.targetKeywords.length === 0) newErrors.targetKeywords = 'At least one target keyword is required';
        formData.targetKeywords.forEach((kw, index) => {
          if (!kw.keyword.trim()) newErrors[`targetKeyword_${index}`] = 'Keyword is required';
        });
        break;
      case 3:
        if (formData.contentSections.length === 0) newErrors.contentSections = 'At least one content section is required';
        formData.contentSections.forEach((section, index) => {
          if (!section.title.trim()) newErrors[`sectionTitle_${index}`] = 'Section title is required';
          if (!section.content.trim()) newErrors[`sectionContent_${index}`] = 'Section content is required';
        });
        break;
      case 4:
        if (!formData.targetAudience.trim()) newErrors.targetAudience = 'Target audience is required';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => (prev < 4 ? (prev + 1) as Step : prev));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => (prev > 1 ? (prev - 1) as Step : prev));
  };

  const handleSubmit = () => {
    if (validateStep(4) && Object.keys(errors).length === 0) {
      onSubmit(formData);
    }
  };

  const renderStep1 = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Step 1: Page Information
      </Typography>
      <TextField
        fullWidth
        label="Page URL"
        value={formData.pageUrl}
        onChange={(e) => updateFormData('pageUrl', e.target.value)}
        error={!!errors.pageUrl}
        helperText={errors.pageUrl}
        margin="normal"
        required
      />
      <TextField
        fullWidth
        label="Page Title"
        value={formData.pageTitle}
        onChange={(e) => updateFormData('pageTitle', e.target.value)}
        error={!!errors.pageTitle}
        helperText={errors.pageTitle}
        margin="normal"
        required
      />
      <TextField
        fullWidth
        multiline
        rows={3}
        label="Existing Content (Optional)"
        value={formData.existingContent}
        onChange={(e) => updateFormData('existingContent', e.target.value)}
        margin="normal"
      />
    </Box>
  );

  const renderStep2 = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Step 2: Target Keywords
      </Typography>
      {errors.targetKeywords && (
        <Typography color="error" variant="body2" gutterBottom>
          {errors.targetKeywords}
        </Typography>
      )}
      {formData.targetKeywords.map((keyword, index) => (
        <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle1">Keyword {index + 1}</Typography>
            {formData.targetKeywords.length > 1 && (
              <IconButton onClick={() => removeTargetKeyword(index)} color="error">
                ×
              </IconButton>
            )}
          </Box>
          <TextField
            fullWidth
            label="Keyword"
            value={keyword.keyword}
            onChange={(e) => updateTargetKeyword(index, 'keyword', e.target.value)}
            error={!!errors[`targetKeyword_${index}`]}
            helperText={errors[`targetKeyword_${index}`]}
            margin="normal"
            required
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Search Intent</InputLabel>
            <Select
              value={keyword.searchIntent}
              label="Search Intent"
              onChange={(e) => updateTargetKeyword(index, 'searchIntent', e.target.value)}
            >
              <MenuItem value="informational">Informational</MenuItem>
              <MenuItem value="navigational">Navigational</MenuItem>
              <MenuItem value="transactional">Transactional</MenuItem>
              <MenuItem value="commercial">Commercial Investigation</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            type="number"
            label="Priority (1-10)"
            value={keyword.priority}
            onChange={(e) => updateTargetKeyword(index, 'priority', parseInt(e.target.value))}
            inputProps={{ min: 1, max: 10 }}
            margin="normal"
          />
          <TextField
            fullWidth
            multiline
            rows={2}
            label="Notes (Optional)"
            value={keyword.notes || ''}
            onChange={(e) => updateTargetKeyword(index, 'notes', e.target.value)}
            margin="normal"
          />
        </Box>
      ))}
      <Button
        variant="outlined"
        onClick={addTargetKeyword}
      >
        + Add Target Keyword
      </Button>
    </Box>
  );

  const renderStep3 = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Step 3: Content Outline
      </Typography>
      {errors.contentSections && (
        <Typography color="error" variant="body2" gutterBottom>
          {errors.contentSections}
        </Typography>
      )}
      {formData.contentSections.map((section, index) => (
        <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle1">Section {index + 1}</Typography>
            {formData.contentSections.length > 1 && (
              <IconButton onClick={() => removeContentSection(index)} color="error">
                ×
              </IconButton>
            )}
          </Box>
          <TextField
            fullWidth
            label="Section Title"
            value={section.title}
            onChange={(e) => updateContentSection(index, 'title', e.target.value)}
            error={!!errors[`sectionTitle_${index}`]}
            helperText={errors[`sectionTitle_${index}`]}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Content Outline"
            value={section.content}
            onChange={(e) => updateContentSection(index, 'content', e.target.value)}
            error={!!errors[`sectionContent_${index}`]}
            helperText={`${errors[`sectionContent_${index}`]} Approx. ${section.wordCount || 0} words`}
            margin="normal"
            required
          />
        </Box>
      ))}
      <Button
        variant="outlined"
        onClick={addContentSection}
      >
        + Add Content Section
      </Button>
    </Box>
  );

  const renderStep4 = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Step 4: Additional Details
      </Typography>
      <FormControl fullWidth margin="normal">
        <InputLabel>Tone of Voice</InputLabel>
        <Select
          value={formData.tone}
          label="Tone of Voice"
          onChange={(e) => updateFormData('tone', e.target.value)}
        >
          <MenuItem value="professional">Professional</MenuItem>
          <MenuItem value="casual">Casual</MenuItem>
          <MenuItem value="authoritative">Authoritative</MenuItem>
          <MenuItem value="conversational">Conversational</MenuItem>
        </Select>
      </FormControl>
      <TextField
        fullWidth
        label="Target Audience"
        value={formData.targetAudience}
        onChange={(e) => updateFormData('targetAudience', e.target.value)}
        error={!!errors.targetAudience}
        helperText={errors.targetAudience}
        margin="normal"
        required
      />
      <TextField
        fullWidth
        multiline
        rows={4}
        label="Additional Notes (Optional)"
        value={formData.additionalNotes}
        onChange={(e) => updateFormData('additionalNotes', e.target.value)}
        margin="normal"
      />
    </Box>
  );

  const renderSteps = {
    1: renderStep1,
    2: renderStep2,
    3: renderStep3,
    4: renderStep4,
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom align="center">
        Create SEO Brief
      </Typography>
      <Divider sx={{ my: 3 }} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        {[1, 2, 3, 4].map((step) => (
          <Box key={step}>
            <Chip
              label={step}
              color={currentStep >= step ? 'primary' : 'default'}
              sx={{ mr: 1 }}
            />
          </Box>
        ))}
      </Box>
      <Box sx={{ mb: 4 }}>{renderSteps[currentStep]()}</Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        {currentStep > 1 && (
          <Button variant="outlined" onClick={prevStep}>
            Previous
          </Button>
        )}
        <Box sx={{ flexGrow: 1 }} />
        {currentStep < 4 ? (
          <Button variant="contained" onClick={nextStep} disabled={Object.keys(errors).length > 0}>
            Next
          </Button>
        ) : (
          <>
            <Button variant="outlined" onClick={onCancel || (() => {})} sx={{ mr: 2 }}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSubmit}>
              Create Brief
            </Button>
          </>
        )}
      </Box>
    </Box>
  );
};

export default BriefForm;