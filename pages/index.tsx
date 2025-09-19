import { useAuth } from '../src/components/auth/AuthContext';
import AuthWrapper from '../src/components/auth/AuthWrapper';
import MainLayout from '../src/components/layout/MainLayout';
import ConnectionTest from '../components/ConnectionTest';

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  }

  if (!user) {
    return <AuthWrapper />;
  }

  return (
    <MainLayout>
      <ConnectionTest />
      <div style={{ padding: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          Welcome to RankScope
        </h1>
        <p style={{ marginBottom: '1rem' }}>
          Hello {user.email}! You are logged in as a {user.role}.
        </p>
        <div style={{ display: 'grid', gap: '1rem', maxWidth: '400px' }}>
          <a 
            href="/dashboard" 
            style={{ 
              padding: '0.75rem 1.5rem', 
              backgroundColor: '#4f46e5', 
              color: 'white', 
              textDecoration: 'none', 
              borderRadius: '0.375rem',
              textAlign: 'center',
              fontWeight: '500'
            }}
          >
            Go to Dashboard
          </a>
          <a 
            href="/clients" 
            style={{ 
              padding: '0.75rem 1.5rem', 
              backgroundColor: '#10b981', 
              color: 'white', 
              textDecoration: 'none', 
              borderRadius: '0.375rem',
              textAlign: 'center',
              fontWeight: '500'
            }}
          >
            Manage Clients
          </a>
          <a 
            href="/pages" 
            style={{ 
              padding: '0.75rem 1.5rem', 
              backgroundColor: '#f59e0b', 
              color: 'white', 
              textDecoration: 'none', 
              borderRadius: '0.375rem',
              textAlign: 'center',
              fontWeight: '500'
            }}
          >
            Pages Management
          </a>
        </div>
      </div>
    </MainLayout>
  );
}
