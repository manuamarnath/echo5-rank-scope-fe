import { useState } from 'react';
import KeywordImport from '../keywords/KeywordImport';

interface LocationData {
  city: string;
  state: string;
  country: string;
  zip: string;
  radius: number;
  radiusUnit: 'miles' | 'km';
}

interface KeywordData {
  keyword: string;
  searchVolume?: number;
  difficulty?: number;
  intent?: 'informational' | 'transactional' | 'navigational' | 'local';
  source: 'csv' | 'gsc' | 'manual';
}

interface ClientFormData {
  name: string;
  industry: string;
  locations: LocationData[];
  services: string[];
  competitors: string[];
  seedKeywords: KeywordData[];
  integrations: {
    googleSearchConsole: boolean;
    googleAnalytics: boolean;
    googleBusinessProfile: boolean;
  };
}

interface ClientOnboardingFormProps {
  onComplete: (data: ClientFormData) => void;
  onCancel: () => void;
}

export default function ClientOnboardingForm({ onComplete, onCancel }: ClientOnboardingFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ClientFormData>({
    name: '',
    industry: '',
    locations: [{
      city: '',
      state: '',
      country: '',
      zip: '',
      radius: 25,
      radiusUnit: 'miles'
    }],
    services: [''],
    competitors: [''],
    seedKeywords: [],
    integrations: {
      googleSearchConsole: false,
      googleAnalytics: false,
      googleBusinessProfile: false,
    }
  });

  const totalSteps = 6;

  const updateFormData = (field: keyof ClientFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addArrayItem = (field: 'services' | 'competitors') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const addLocationItem = () => {
    setFormData(prev => ({
      ...prev,
      locations: [...prev.locations, {
        city: '',
        state: '',
        country: '',
        zip: '',
        radius: 25,
        radiusUnit: 'miles'
      }]
    }));
  };

  const updateArrayItem = (field: 'services' | 'competitors', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const updateLocationItem = (index: number, field: keyof LocationData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      locations: prev.locations.map((item, i) => i === index ? { ...item, [field]: value } : item)
    }));
  };

  const removeArrayItem = (field: 'services' | 'competitors', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const removeLocationItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      locations: prev.locations.filter((_, i) => i !== index)
    }));
  };

  const handleKeywordsImported = (keywords: KeywordData[]) => {
    setFormData(prev => ({
      ...prev,
      seedKeywords: keywords
    }));
    nextStep(); // Automatically proceed to next step after import
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    // Filter out empty array items
    const cleanedData = {
      ...formData,
      locations: formData.locations.filter(item => item.city.trim()),
      services: formData.services.filter(item => item.trim()),
      competitors: formData.competitors.filter(item => item.trim()),
      seedKeywords: formData.seedKeywords, // Keep all imported keywords
    };
    onComplete(cleanedData);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
              Company Information
            </h3>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                Company Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => updateFormData('name', e.target.value)}
                required
                style={{ 
                  width: '100%', 
                  padding: '0.5rem', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '0.375rem' 
                }}
                placeholder="Enter company name"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                Industry *
              </label>
              <select
                value={formData.industry}
                onChange={(e) => updateFormData('industry', e.target.value)}
                required
                style={{ 
                  width: '100%', 
                  padding: '0.5rem', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '0.375rem' 
                }}
              >
                <option value="">Select industry</option>
                <option value="Technology">Technology</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Finance">Finance</option>
                <option value="Retail">Retail</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Real Estate">Real Estate</option>
                <option value="Legal">Legal</option>
                <option value="Education">Education</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
              Business Locations
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
              Add all locations where your business operates with radius for local SEO targeting
            </p>
            {formData.locations.map((location, index) => (
              <div key={index} style={{ 
                border: '1px solid #d1d5db', 
                borderRadius: '0.5rem', 
                padding: '1rem', 
                marginBottom: '1rem',
                backgroundColor: '#f9fafb'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                      City *
                    </label>
                    <input
                      type="text"
                      value={location.city}
                      onChange={(e) => updateLocationItem(index, 'city', e.target.value)}
                      style={{ 
                        width: '100%', 
                        padding: '0.5rem', 
                        border: '1px solid #d1d5db', 
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem'
                      }}
                      placeholder="Enter city"
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                      State/Province
                    </label>
                    <input
                      type="text"
                      value={location.state}
                      onChange={(e) => updateLocationItem(index, 'state', e.target.value)}
                      style={{ 
                        width: '100%', 
                        padding: '0.5rem', 
                        border: '1px solid #d1d5db', 
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem'
                      }}
                      placeholder="State/Province"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                      Country
                    </label>
                    <input
                      type="text"
                      value={location.country}
                      onChange={(e) => updateLocationItem(index, 'country', e.target.value)}
                      style={{ 
                        width: '100%', 
                        padding: '0.5rem', 
                        border: '1px solid #d1d5db', 
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem'
                      }}
                      placeholder="Country"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                      ZIP/Postal Code
                    </label>
                    <input
                      type="text"
                      value={location.zip}
                      onChange={(e) => updateLocationItem(index, 'zip', e.target.value)}
                      style={{ 
                        width: '100%', 
                        padding: '0.5rem', 
                        border: '1px solid #d1d5db', 
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem'
                      }}
                      placeholder="ZIP/Postal Code"
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.75rem', alignItems: 'end' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                      Local SEO Radius *
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="number"
                        value={location.radius}
                        onChange={(e) => updateLocationItem(index, 'radius', parseInt(e.target.value) || 25)}
                        min="1"
                        max="500"
                        style={{ 
                          flex: 1, 
                          padding: '0.5rem', 
                          border: '1px solid #d1d5db', 
                          borderRadius: '0.375rem',
                          fontSize: '0.875rem'
                        }}
                        placeholder="25"
                      />
                      <select
                        value={location.radiusUnit}
                        onChange={(e) => updateLocationItem(index, 'radiusUnit', e.target.value)}
                        style={{ 
                          padding: '0.5rem', 
                          border: '1px solid #d1d5db', 
                          borderRadius: '0.375rem',
                          fontSize: '0.875rem'
                        }}
                      >
                        <option value="miles">Miles</option>
                        <option value="km">KM</option>
                      </select>
                    </div>
                  </div>
                  {formData.locations.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLocationItem(index)}
                      style={{ 
                        padding: '0.5rem', 
                        backgroundColor: '#ef4444', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '0.375rem',
                        cursor: 'pointer',
                        fontSize: '0.875rem'
                      }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addLocationItem}
              style={{ 
                padding: '0.5rem 1rem', 
                backgroundColor: '#10b981', 
                color: 'white', 
                border: 'none', 
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              Add Location
            </button>
          </div>
        );

      case 3:
        return (
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
              Services Offered
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
              List the main services or products your business offers
            </p>
            {formData.services.map((service, index) => (
              <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input
                  type="text"
                  value={service}
                  onChange={(e) => updateArrayItem('services', index, e.target.value)}
                  style={{ 
                    flex: 1, 
                    padding: '0.5rem', 
                    border: '1px solid #d1d5db', 
                    borderRadius: '0.375rem' 
                  }}
                  placeholder="Enter service"
                />
                {formData.services.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem('services', index)}
                    style={{ 
                      padding: '0.5rem', 
                      backgroundColor: '#ef4444', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '0.375rem',
                      cursor: 'pointer'
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('services')}
              style={{ 
                padding: '0.5rem 1rem', 
                backgroundColor: '#10b981', 
                color: 'white', 
                border: 'none', 
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              Add Service
            </button>
          </div>
        );

      case 4:
        return (
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
              Competitors
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
              List your main competitors (optional but helpful for SEO strategy)
            </p>
            {formData.competitors.map((competitor, index) => (
              <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input
                  type="text"
                  value={competitor}
                  onChange={(e) => updateArrayItem('competitors', index, e.target.value)}
                  style={{ 
                    flex: 1, 
                    padding: '0.5rem', 
                    border: '1px solid #d1d5db', 
                    borderRadius: '0.375rem' 
                  }}
                  placeholder="Enter competitor name or website"
                />
                {formData.competitors.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem('competitors', index)}
                    style={{ 
                      padding: '0.5rem', 
                      backgroundColor: '#ef4444', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '0.375rem',
                      cursor: 'pointer'
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('competitors')}
              style={{ 
                padding: '0.5rem 1rem', 
                backgroundColor: '#10b981', 
                color: 'white', 
                border: 'none', 
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              Add Competitor
            </button>
          </div>
        );

      case 5:
        return (
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
              Seed Keywords
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
              Import your seed keywords to jumpstart your SEO strategy. You can import from CSV, 
              Google Search Console, or enter them manually.
            </p>
            
            {formData.seedKeywords.length > 0 ? (
              <div>
                <div style={{ 
                  backgroundColor: '#f0f9ff', 
                  border: '1px solid #0ea5e9', 
                  borderRadius: '0.375rem', 
                  padding: '1rem',
                  marginBottom: '1rem'
                }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem', color: '#0ea5e9' }}>
                    ✓ Keywords Imported Successfully
                  </h4>
                  <p style={{ fontSize: '0.875rem', color: '#0369a1' }}>
                    {formData.seedKeywords.length} keywords have been imported and are ready for allocation.
                  </p>
                </div>
                
                <div style={{ marginBottom: '1rem' }}>
                  <h5 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                    Preview (first 10 keywords):
                  </h5>
                  <div style={{ 
                    backgroundColor: '#f9fafb', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '0.375rem',
                    padding: '0.75rem',
                    fontSize: '0.875rem'
                  }}>
                    {formData.seedKeywords.slice(0, 10).map((kw, index) => (
                      <div key={index} style={{ marginBottom: '0.25rem' }}>
                        • {kw.keyword} {kw.searchVolume && `(${kw.searchVolume} searches)`}
                      </div>
                    ))}
                    {formData.seedKeywords.length > 10 && (
                      <div style={{ color: '#6b7280', fontStyle: 'italic' }}>
                        ... and {formData.seedKeywords.length - 10} more
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, seedKeywords: [] }))}
                  style={{ 
                    padding: '0.5rem 1rem', 
                    backgroundColor: '#f3f4f6', 
                    color: '#374151', 
                    border: 'none', 
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                  }}
                >
                  Import Different Keywords
                </button>
              </div>
            ) : (
              <KeywordImport
                onKeywordsImported={handleKeywordsImported}
                onCancel={() => nextStep()} // Allow skipping this step
              />
            )}
          </div>
        );

      case 6:
        return (
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
              Tool Integrations
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
              Select which Google tools you'd like to integrate with RankScope
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={formData.integrations.googleSearchConsole}
                  onChange={(e) => updateFormData('integrations', {
                    ...formData.integrations,
                    googleSearchConsole: e.target.checked
                  })}
                />
                <span>Google Search Console</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={formData.integrations.googleAnalytics}
                  onChange={(e) => updateFormData('integrations', {
                    ...formData.integrations,
                    googleAnalytics: e.target.checked
                  })}
                />
                <span>Google Analytics 4</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={formData.integrations.googleBusinessProfile}
                  onChange={(e) => updateFormData('integrations', {
                    ...formData.integrations,
                    googleBusinessProfile: e.target.checked
                  })}
                />
                <span>Google Business Profile</span>
              </label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.name.trim() && formData.industry;
      case 2:
        return formData.locations.some(loc => loc.city.trim());
      case 3:
        return formData.services.some(service => service.trim());
      case 4:
        return true; // Competitors are optional
      case 5:
        return true; // Seed keywords are optional but recommended
      case 6:
        return true; // Integrations are optional
      default:
        return false;
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f9fafb', 
      padding: '2rem 1rem' 
    }}>
      <div style={{ 
        maxWidth: '42rem', 
        margin: '0 auto', 
        backgroundColor: 'white', 
        borderRadius: '0.5rem', 
        padding: '2rem',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ 
            fontSize: '1.875rem', 
            fontWeight: 'bold', 
            marginBottom: '0.5rem' 
          }}>
            Client Onboarding
          </h2>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            marginBottom: '1rem'
          }}>
            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Step {currentStep} of {totalSteps}
            </span>
            <div style={{ 
              flex: 1, 
              height: '0.25rem', 
              backgroundColor: '#e5e7eb', 
              borderRadius: '0.125rem' 
            }}>
              <div style={{ 
                width: `${(currentStep / totalSteps) * 100}%`, 
                height: '100%', 
                backgroundColor: '#4f46e5', 
                borderRadius: '0.125rem',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>
        </div>

        {renderStep()}

        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          marginTop: '2rem' 
        }}>
          <div>
            {currentStep > 1 && (
              <button
                onClick={prevStep}
                style={{ 
                  padding: '0.5rem 1rem', 
                  backgroundColor: '#6b7280', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  marginRight: '0.5rem'
                }}
              >
                Previous
              </button>
            )}
            <button
              onClick={onCancel}
              style={{ 
                padding: '0.5rem 1rem', 
                backgroundColor: 'transparent', 
                color: '#6b7280', 
                border: '1px solid #d1d5db', 
                borderRadius: '0.375rem',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
          
          <div>
            {currentStep < totalSteps ? (
              <button
                onClick={nextStep}
                disabled={!isStepValid()}
                style={{ 
                  padding: '0.5rem 1rem', 
                  backgroundColor: isStepValid() ? '#4f46e5' : '#9ca3af', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '0.375rem',
                  cursor: isStepValid() ? 'pointer' : 'not-allowed'
                }}
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                style={{ 
                  padding: '0.5rem 1rem', 
                  backgroundColor: '#10b981', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '0.375rem',
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