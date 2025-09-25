import React, { useState } from 'react';

interface ComprehensiveClientData {
  // Basic business info
  name: string;
  website: string;
  phone: string;
  industry: string;
  
  // Address information
  address: {
    full: string;
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  
  // Services
  services: string[];
  
  // Content generation data
  contentData: {
    businessType: string;
    locationDescription: string;
    serviceAreas: string[];
    primaryServiceArea: string;
    usps: string[];
    targetAudience: string;
    tone: 'professional' | 'casual' | 'technical' | 'conversational';
    seoGoals: string;
    primaryGeoKeyword: string;
    driveTimesDescription: string;
    googleMapsEmbedURL: string;
    socialLinks: string[];
    shortcodes: {
      contactForm: string;
      reviews: string;
      partners: string;
    };
    businessHours: string;
    businessDescription: string;
  };
  
  // Website structure
  websiteStructure: string[];
  
  // Keywords
  seedKeywords: Array<{
    keyword: string;
    searchVolume?: number;
    difficulty?: number;
  }>;
}

interface ComprehensiveClientOnboardingProps {
  onSubmit: (clientData: ComprehensiveClientData) => void;
  onCancel: () => void;
  initialData?: Partial<ComprehensiveClientData>;
}

export default function ComprehensiveClientOnboarding({ 
  onSubmit, 
  onCancel, 
  initialData 
}: ComprehensiveClientOnboardingProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<ComprehensiveClientData>({
    name: '',
    website: '',
    phone: '',
    industry: '',
    address: {
      full: '',
      street: '',
      city: '',
      state: '',
      zip: ''
    },
    services: [''],
    contentData: {
      businessType: '',
      locationDescription: '',
      serviceAreas: [''],
      primaryServiceArea: '',
      usps: ['', '', '', '', ''],
      targetAudience: '',
      tone: 'professional',
      seoGoals: '',
      primaryGeoKeyword: '',
      driveTimesDescription: '',
      googleMapsEmbedURL: '',
      socialLinks: [''],
      shortcodes: {
        contactForm: '',
        reviews: '',
        partners: ''
      },
      businessHours: '',
      businessDescription: ''
    },
    websiteStructure: [''],
    seedKeywords: [{ keyword: '' }],
    ...initialData
  });

  const updateFormData = (path: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current: any = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      
      return newData;
    });
  };

  const addArrayItem = (path: string) => {
    const current = path.split('.').reduce((obj, key) => obj[key], formData) as any[];
    updateFormData(path, [...current, typeof current[0] === 'object' ? { keyword: '' } : '']);
  };

  const removeArrayItem = (path: string, index: number) => {
    const current = path.split('.').reduce((obj, key) => obj[key], formData) as any[];
    if (current.length > 1) {
      updateFormData(path, current.filter((_, i) => i !== index));
    }
  };

  const renderStep1 = () => (
    <div style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', color: '#1F2937' }}>
        Step 1: Basic Business Information
      </h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
            Business Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => updateFormData('name', e.target.value)}
            placeholder="Enter business name"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #D1D5DB',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
        </div>
        
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
            Website URL *
          </label>
          <input
            type="url"
            value={formData.website}
            onChange={(e) => updateFormData('website', e.target.value)}
            placeholder="https://example.com"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #D1D5DB',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
            Phone Number
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => updateFormData('phone', e.target.value)}
            placeholder="+1-555-123-4567"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #D1D5DB',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
        </div>
        
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
            Industry
          </label>
          <input
            type="text"
            value={formData.industry}
            onChange={(e) => updateFormData('industry', e.target.value)}
            placeholder="e.g., Home Improvement, Professional Services"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #D1D5DB',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
          Full Business Address *
        </label>
        <input
          type="text"
          value={formData.address.full}
          onChange={(e) => updateFormData('address.full', e.target.value)}
          placeholder="123 Main St, Anytown, ST 12345"
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #D1D5DB',
            borderRadius: '8px',
            fontSize: '14px'
          }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '16px', marginBottom: '32px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
            Street Address
          </label>
          <input
            type="text"
            value={formData.address.street}
            onChange={(e) => updateFormData('address.street', e.target.value)}
            placeholder="123 Main St"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #D1D5DB',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
        </div>
        
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
            City *
          </label>
          <input
            type="text"
            value={formData.address.city}
            onChange={(e) => updateFormData('address.city', e.target.value)}
            placeholder="Anytown"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #D1D5DB',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
        </div>
        
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
            State
          </label>
          <input
            type="text"
            value={formData.address.state}
            onChange={(e) => updateFormData('address.state', e.target.value)}
            placeholder="ST"
            maxLength={2}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #D1D5DB',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
        </div>
        
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
            ZIP Code
          </label>
          <input
            type="text"
            value={formData.address.zip}
            onChange={(e) => updateFormData('address.zip', e.target.value)}
            placeholder="12345"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #D1D5DB',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', color: '#1F2937' }}>
        Step 2: Business Details & Content Data
      </h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
            Business Type *
          </label>
          <input
            type="text"
            value={formData.contentData.businessType}
            onChange={(e) => updateFormData('contentData.businessType', e.target.value)}
            placeholder="e.g., family-owned cabinet store"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #D1D5DB',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
        </div>
        
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
            Primary Service Area *
          </label>
          <input
            type="text"
            value={formData.contentData.primaryServiceArea}
            onChange={(e) => updateFormData('contentData.primaryServiceArea', e.target.value)}
            placeholder="e.g., Tampa"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #D1D5DB',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
          Location Description
        </label>
        <input
          type="text"
          value={formData.contentData.locationDescription}
          onChange={(e) => updateFormData('contentData.locationDescription', e.target.value)}
          placeholder="e.g., suburb 20 minutes from downtown Tampa"
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #D1D5DB',
            borderRadius: '8px',
            fontSize: '14px'
          }}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
          Business Description *
        </label>
        <textarea
          value={formData.contentData.businessDescription}
          onChange={(e) => updateFormData('contentData.businessDescription', e.target.value)}
          placeholder="Brief description of your business for schema markup"
          rows={3}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #D1D5DB',
            borderRadius: '8px',
            fontSize: '14px',
            resize: 'vertical'
          }}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
          Target Audience *
        </label>
        <textarea
          value={formData.contentData.targetAudience}
          onChange={(e) => updateFormData('contentData.targetAudience', e.target.value)}
          placeholder="e.g., Tampa Bay homeowners seeking affordable, quality renovations"
          rows={2}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #D1D5DB',
            borderRadius: '8px',
            fontSize: '14px',
            resize: 'vertical'
          }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
            Content Tone
          </label>
          <select
            value={formData.contentData.tone}
            onChange={(e) => updateFormData('contentData.tone', e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #D1D5DB',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          >
            <option value="professional">Professional</option>
            <option value="casual">Casual</option>
            <option value="technical">Technical</option>
            <option value="conversational">Conversational</option>
          </select>
        </div>
        
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
            Primary GEO Keyword
          </label>
          <input
            type="text"
            value={formData.contentData.primaryGeoKeyword}
            onChange={(e) => updateFormData('contentData.primaryGeoKeyword', e.target.value)}
            placeholder="e.g., valrico showroom"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #D1D5DB',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', color: '#1F2937' }}>
        Step 3: Services & USPs
      </h2>
      
      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
          Services Offered *
        </label>
        {formData.services.map((service, index) => (
          <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <input
              type="text"
              value={service}
              onChange={(e) => {
                const newServices = [...formData.services];
                newServices[index] = e.target.value;
                updateFormData('services', newServices);
              }}
              placeholder="e.g., Custom Cabinets"
              style={{
                flex: 1,
                padding: '12px',
                border: '1px solid #D1D5DB',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
            <button
              type="button"
              onClick={() => removeArrayItem('services', index)}
              style={{
                padding: '12px',
                backgroundColor: '#EF4444',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => addArrayItem('services')}
          style={{
            padding: '8px 16px',
            backgroundColor: '#3B82F6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          Add Service
        </button>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
          Unique Selling Points (USPs) *
        </label>
        <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '12px' }}>
          Add up to 5 unique selling points that set your business apart
        </p>
        {formData.contentData.usps.map((usp, index) => (
          <div key={index} style={{ marginBottom: '8px' }}>
            <input
              type="text"
              value={usp}
              onChange={(e) => {
                const newUsps = [...formData.contentData.usps];
                newUsps[index] = e.target.value;
                updateFormData('contentData.usps', newUsps);
              }}
              placeholder={`USP ${index + 1}: e.g., Large showroom displaying samples`}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #D1D5DB',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>
        ))}
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
          Service Areas
        </label>
        {formData.contentData.serviceAreas.map((area, index) => (
          <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <input
              type="text"
              value={area}
              onChange={(e) => {
                const newAreas = [...formData.contentData.serviceAreas];
                newAreas[index] = e.target.value;
                updateFormData('contentData.serviceAreas', newAreas);
              }}
              placeholder="e.g., Tampa, Brandon, Riverview"
              style={{
                flex: 1,
                padding: '12px',
                border: '1px solid #D1D5DB',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
            <button
              type="button"
              onClick={() => removeArrayItem('contentData.serviceAreas', index)}
              style={{
                padding: '12px',
                backgroundColor: '#EF4444',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => addArrayItem('contentData.serviceAreas')}
          style={{
            padding: '8px 16px',
            backgroundColor: '#3B82F6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          Add Service Area
        </button>
      </div>
    </div>
  );

  const handleSubmit = () => {
    // Validate required fields
    const requiredFields = [
      'name',
      'website', 
      'address.full',
      'address.city',
      'contentData.businessType',
      'contentData.primaryServiceArea',
      'contentData.targetAudience',
      'contentData.businessDescription'
    ];
    
    const isValid = requiredFields.every(field => {
      const value = field.split('.').reduce((obj, key) => obj?.[key], formData);
      return value && value.toString().trim() !== '';
    });
    
    if (!isValid) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Clean up empty array items
    const cleanedData = {
      ...formData,
      services: formData.services.filter(s => s.trim() !== ''),
      contentData: {
        ...formData.contentData,
        serviceAreas: formData.contentData.serviceAreas.filter(a => a.trim() !== ''),
        usps: formData.contentData.usps.filter(u => u.trim() !== ''),
        socialLinks: formData.contentData.socialLinks.filter(l => l.trim() !== '')
      },
      websiteStructure: formData.websiteStructure.filter(w => w.trim() !== ''),
      seedKeywords: formData.seedKeywords.filter(k => k.keyword.trim() !== '')
    };
    
    onSubmit(cleanedData);
  };

  return (
    <div style={{ backgroundColor: '#F9FAFB', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #E5E7EB', padding: '20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', color: '#1F2937' }}>
            Comprehensive Client Onboarding
          </h1>
          <p style={{ fontSize: '16px', color: '#6B7280' }}>
            Step {step} of 3: Capture all business details for AI-powered content generation
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #E5E7EB' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px 20px' }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            {[1, 2, 3].map(stepNum => (
              <div
                key={stepNum}
                style={{
                  flex: 1,
                  height: '8px',
                  backgroundColor: stepNum <= step ? '#3B82F6' : '#E5E7EB',
                  borderRadius: '4px'
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}

        {/* Navigation Buttons */}
        <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between' }}>
          <div>
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#6B7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Previous
              </button>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={onCancel}
              style={{
                padding: '12px 24px',
                backgroundColor: 'transparent',
                color: '#6B7280',
                border: '1px solid #D1D5DB',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            
            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#3B82F6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#10B981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Complete Onboarding
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}