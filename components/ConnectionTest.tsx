import { useState } from 'react';

interface ConnectionTestResult {
  frontend: boolean;
  backend: boolean;
  database: boolean;
  error?: string;
}

export default function ConnectionTest() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<ConnectionTestResult | null>(null);

  const testConnection = async () => {
    setTesting(true);
    setResult(null);

    const testResult: ConnectionTestResult = {
      frontend: true,
      backend: false,
      database: false
    };

    try {
      // Test backend connection
      const healthResponse = await fetch('/api/health');
      if (healthResponse.ok) {
        testResult.backend = true;
        
        // Test database connection by trying to fetch demo clients (public endpoint)
        const clientsResponse = await fetch('/api/clients/demo');
        if (clientsResponse.ok) {
          testResult.database = true;
        }
      }
    } catch (error) {
      testResult.error = error instanceof Error ? error.message : 'Unknown error';
    }

    setResult(testResult);
    setTesting(false);
  };

  return (
    <div style={{ 
      padding: '2rem', 
      maxWidth: '600px', 
      margin: '2rem auto',
      border: '1px solid #e5e7eb',
      borderRadius: '0.5rem',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <h2 style={{ marginBottom: '1rem', color: '#1f2937' }}>
        🔧 Frontend ↔ Backend Connection Test
      </h2>
      
      <button
        onClick={testConnection}
        disabled={testing}
        style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: testing ? '#9ca3af' : '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '0.375rem',
          cursor: testing ? 'not-allowed' : 'pointer',
          fontSize: '1rem',
          marginBottom: '1.5rem'
        }}
      >
        {testing ? '🔄 Testing...' : '🚀 Test Connection'}
      </button>

      {result && (
        <div style={{ 
          backgroundColor: '#f9fafb', 
          padding: '1rem', 
          borderRadius: '0.375rem',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#374151' }}>Connection Status:</h3>
          
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: result.frontend ? '#059669' : '#dc2626' }}>
                {result.frontend ? '✅' : '❌'}
              </span>
              <span>Frontend (React/Next.js)</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: result.backend ? '#059669' : '#dc2626' }}>
                {result.backend ? '✅' : '❌'}
              </span>
              <span>Backend (Express Server on :5000)</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: result.database ? '#059669' : '#dc2626' }}>
                {result.database ? '✅' : '❌'}
              </span>
              <span>Database (In-Memory MongoDB)</span>
            </div>
          </div>

          {result.error && (
            <div style={{ 
              marginTop: '1rem', 
              padding: '0.75rem', 
              backgroundColor: '#fef2f2', 
              border: '1px solid #fecaca',
              borderRadius: '0.375rem',
              color: '#dc2626'
            }}>
              <strong>Error:</strong> {result.error}
            </div>
          )}

          {result.frontend && result.backend && result.database && (
            <div style={{ 
              marginTop: '1rem', 
              padding: '0.75rem', 
              backgroundColor: '#f0fdf4', 
              border: '1px solid #bbf7d0',
              borderRadius: '0.375rem',
              color: '#059669'
            }}>
              🎉 <strong>All systems connected!</strong> Your SEO platform is ready to use.
              <br /><br />
              <strong>Available URLs:</strong>
              <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
                <li>Frontend: <a href={typeof window !== 'undefined' ? window.location.origin : 'https://echo5-rank-scope-fe-e5i4.vercel.app'} target="_blank">{typeof window !== 'undefined' ? window.location.origin : 'https://echo5-rank-scope-fe-e5i4.vercel.app/'}</a></li>
                <li>Backend API: <a href="/api/health" target="_blank">/api/health</a></li>
                <li>API Health: <a href="/api/health" target="_blank">/api/health</a></li>
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}