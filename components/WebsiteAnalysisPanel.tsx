import React, { useState, useEffect } from 'react';

interface WebsiteAnalysisProps {
  clientId: string;
  clientName: string;
  clientWebsite: string;
  onAnalysisComplete?: () => void;
}

interface AnalysisResult {
  status: string;
  analyzedAt?: string;
  insights?: {
    seo?: {
      titleOptimization?: {
        totalPages: number;
        optimizedTitles: number;
        issues: string[];
      };
      contentGaps?: string[];
    };
    content?: {
      topKeywords?: Array<{ word: string; count: number }>;
      localSEOOpportunities?: string[];
    };
    opportunities?: {
      missingPages?: string[];
      contentEnhancements?: string[];
    };
  };
  recommendations?: Array<{
    category: string;
    priority: string;
    title: string;
    description: string;
    action: string;
    completed?: boolean;
  }>;
}

export default function WebsiteAnalysisPanel({ 
  clientId, 
  clientName, 
  clientWebsite, 
  onAnalysisComplete 
}: WebsiteAnalysisProps) {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalysisStatus();
  }, [clientId]);

  const fetchAnalysisStatus = async () => {
    try {
      const response = await fetch(`/api/analysis/status/${clientId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.analysis) {
          setAnalysis(data.analysis);
        }
      }
    } catch (err) {
      console.error('Error fetching analysis status:', err);
    }
  };

  const startAnalysis = async (forceReanalyze = false) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/analysis/analyze/${clientId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ forceReanalyze })
      });

      const data = await response.json();

      if (response.ok) {
        // Poll for results
        const pollInterval = setInterval(async () => {
          await fetchAnalysisStatus();
          const currentStatus = await getCurrentStatus();
          
          if (currentStatus === 'completed' || currentStatus === 'failed') {
            clearInterval(pollInterval);
            setLoading(false);
            if (currentStatus === 'completed' && onAnalysisComplete) {
              onAnalysisComplete();
            }
          }
        }, 5000); // Poll every 5 seconds

        // Stop polling after 5 minutes
        setTimeout(() => {
          clearInterval(pollInterval);
          setLoading(false);
        }, 300000);

      } else {
        setError(data.error || 'Failed to start analysis');
        setLoading(false);
      }
    } catch (err) {
      setError('Failed to start website analysis');
      setLoading(false);
    }
  };

  const getCurrentStatus = async () => {
    try {
      const response = await fetch(`/api/analysis/status/${clientId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.analysis) {
          setAnalysis(data.analysis);
          return data.analysis.status;
        }
      }
    } catch (err) {
      console.error('Error getting current status:', err);
    }
    return null;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10B981';
      case 'analyzing': return '#F59E0B';
      case 'failed': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  return (
    <div style={{ 
      backgroundColor: '#F9FAFB', 
      border: '1px solid #E5E7EB', 
      borderRadius: '8px', 
      padding: '24px',
      marginTop: '16px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1F2937', margin: 0 }}>
          Website Analysis
        </h3>
        
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {analysis && (
            <span 
              style={{ 
                padding: '4px 8px', 
                borderRadius: '4px', 
                fontSize: '12px', 
                fontWeight: '500',
                backgroundColor: getStatusColor(analysis.status) + '20',
                color: getStatusColor(analysis.status)
              }}
            >
              {analysis.status.toUpperCase()}
            </span>
          )}
          
          <button
            onClick={() => startAnalysis(analysis?.status === 'completed')}
            disabled={loading}
            style={{
              padding: '8px 16px',
              backgroundColor: loading ? '#9CA3AF' : '#3B82F6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Analyzing...' : analysis?.status === 'completed' ? 'Re-analyze' : 'Start Analysis'}
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <p style={{ color: '#6B7280', fontSize: '14px', margin: 0 }}>
          <strong>Website:</strong> {clientWebsite}
        </p>
        {analysis?.analyzedAt && (
          <p style={{ color: '#6B7280', fontSize: '14px', margin: '4px 0 0 0' }}>
            <strong>Last analyzed:</strong> {new Date(analysis.analyzedAt).toLocaleString()}
          </p>
        )}
      </div>

      {error && (
        <div style={{
          backgroundColor: '#FEE2E2',
          border: '1px solid #FECACA',
          borderRadius: '4px',
          padding: '12px',
          marginBottom: '16px'
        }}>
          <p style={{ color: '#DC2626', fontSize: '14px', margin: 0 }}>{error}</p>
        </div>
      )}

      {loading && (
        <div style={{
          backgroundColor: '#FEF3C7',
          border: '1px solid #FDE68A',
          borderRadius: '4px',
          padding: '12px',
          marginBottom: '16px'
        }}>
          <p style={{ color: '#92400E', fontSize: '14px', margin: 0 }}>
            Analyzing website... This may take 2-3 minutes.
          </p>
        </div>
      )}

      {analysis?.status === 'completed' && analysis.insights && (
        <div>
          {/* SEO Summary */}
          {analysis.insights.seo && (
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: '500', color: '#1F2937', marginBottom: '8px' }}>
                SEO Analysis
              </h4>
              
              {analysis.insights.seo.titleOptimization && (
                <div style={{ marginBottom: '12px' }}>
                  <p style={{ fontSize: '14px', color: '#374151', margin: '0 0 4px 0' }}>
                    <strong>Title Optimization:</strong> {analysis.insights.seo.titleOptimization.optimizedTitles} / {analysis.insights.seo.titleOptimization.totalPages} pages optimized
                  </p>
                  {analysis.insights.seo.titleOptimization.issues.length > 0 && (
                    <ul style={{ margin: '4px 0 0 20px', fontSize: '13px', color: '#6B7280' }}>
                      {analysis.insights.seo.titleOptimization.issues.slice(0, 3).map((issue, index) => (
                        <li key={index}>{issue}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {analysis.insights.seo.contentGaps && analysis.insights.seo.contentGaps.length > 0 && (
                <div style={{ marginBottom: '12px' }}>
                  <p style={{ fontSize: '14px', color: '#374151', margin: '0 0 4px 0' }}>
                    <strong>Content Gaps:</strong>
                  </p>
                  <ul style={{ margin: '4px 0 0 20px', fontSize: '13px', color: '#6B7280' }}>
                    {analysis.insights.seo.contentGaps.slice(0, 3).map((gap, index) => (
                      <li key={index}>{gap}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Top Keywords */}
          {analysis.insights.content?.topKeywords && (
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: '500', color: '#1F2937', marginBottom: '8px' }}>
                Current Website Keywords
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {analysis.insights.content.topKeywords.slice(0, 10).map((keyword, index) => (
                  <span 
                    key={index}
                    style={{ 
                      padding: '4px 8px', 
                      backgroundColor: '#EBF4FF', 
                      color: '#1E40AF', 
                      borderRadius: '12px', 
                      fontSize: '12px' 
                    }}
                  >
                    {keyword.word} ({keyword.count})
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {analysis.recommendations && analysis.recommendations.length > 0 && (
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: '500', color: '#1F2937', marginBottom: '12px' }}>
                Recommendations ({analysis.recommendations.length})
              </h4>
              
              <div style={{ display: 'grid', gap: '12px' }}>
                {analysis.recommendations.slice(0, 5).map((rec, index) => (
                  <div 
                    key={index}
                    style={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #E5E7EB', 
                      borderRadius: '6px', 
                      padding: '12px' 
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                      <h5 style={{ fontSize: '14px', fontWeight: '500', color: '#1F2937', margin: 0 }}>
                        {rec.title}
                      </h5>
                      <span 
                        style={{ 
                          padding: '2px 6px', 
                          borderRadius: '4px', 
                          fontSize: '11px', 
                          fontWeight: '500',
                          backgroundColor: getPriorityColor(rec.priority) + '20',
                          color: getPriorityColor(rec.priority)
                        }}
                      >
                        {rec.priority.toUpperCase()}
                      </span>
                    </div>
                    <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 8px 0' }}>
                      {rec.description}
                    </p>
                    <p style={{ fontSize: '12px', color: '#374151', margin: 0 }}>
                      <strong>Action:</strong> {rec.action}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {analysis?.status === 'failed' && (
        <div style={{
          backgroundColor: '#FEE2E2',
          border: '1px solid #FECACA',
          borderRadius: '4px',
          padding: '12px'
        }}>
          <p style={{ color: '#DC2626', fontSize: '14px', margin: 0 }}>
            Analysis failed. Please try again or check if the website is accessible.
          </p>
        </div>
      )}
    </div>
  );
}