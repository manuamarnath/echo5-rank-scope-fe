import { useAuth } from '../src/components/auth/AuthContext';
import MainLayout from '../src/components/layout/MainLayout';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <MainLayout>
      <div style={{ padding: '1rem' }}>
        <h1 style={{ 
          fontSize: '2rem', 
          fontWeight: 'bold', 
          marginBottom: '2rem' 
        }}>
          Dashboard
        </h1>
        
        <div style={{ 
          display: 'grid', 
          gap: '1.5rem',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          marginBottom: '2rem'
        }}>
          {/* Quick Stats */}
          <div style={{ 
            backgroundColor: 'white', 
            padding: '1.5rem', 
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ 
              fontSize: '1.125rem', 
              fontWeight: '600', 
              marginBottom: '1rem',
              color: '#111827'
            }}>
              Quick Stats
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Active Clients:</span>
                <span style={{ fontWeight: '600' }}>0</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Keywords Tracked:</span>
                <span style={{ fontWeight: '600' }}>0</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Pages Managed:</span>
                <span style={{ fontWeight: '600' }}>0</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Pending Tasks:</span>
                <span style={{ fontWeight: '600' }}>0</span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div style={{ 
            backgroundColor: 'white', 
            padding: '1.5rem', 
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ 
              fontSize: '1.125rem', 
              fontWeight: '600', 
              marginBottom: '1rem',
              color: '#111827'
            }}>
              Recent Activity
            </h3>
            <div style={{ color: '#6b7280', textAlign: 'center', padding: '2rem 0' }}>
              No recent activity
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div style={{ 
          display: 'grid', 
          gap: '1.5rem',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))'
        }}>
          <a 
            href="/clients"
            style={{ 
              backgroundColor: 'white', 
              padding: '1.5rem', 
              borderRadius: '0.5rem',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              textDecoration: 'none',
              color: 'inherit',
              display: 'block',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
            }}
          >
            <div style={{ 
              width: '3rem', 
              height: '3rem', 
              backgroundColor: '#dbeafe', 
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}>
              <span style={{ fontSize: '1.5rem' }}>👥</span>
            </div>
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '600', 
              marginBottom: '0.5rem',
              color: '#111827'
            }}>
              Manage Clients
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
              Add new clients, view client details, and manage onboarding process.
            </p>
            <span style={{ 
              color: '#4f46e5', 
              fontSize: '0.875rem', 
              fontWeight: '500' 
            }}>
              View Clients →
            </span>
          </a>

          <a 
            href="/pages"
            style={{ 
              backgroundColor: 'white', 
              padding: '1.5rem', 
              borderRadius: '0.5rem',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              textDecoration: 'none',
              color: 'inherit',
              display: 'block',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
            }}
          >
            <div style={{ 
              width: '3rem', 
              height: '3rem', 
              backgroundColor: '#dcfce7', 
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}>
              <span style={{ fontSize: '1.5rem' }}>📄</span>
            </div>
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '600', 
              marginBottom: '0.5rem',
              color: '#111827'
            }}>
              Pages & Keywords
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
              Manage SEO pages, allocate keywords, and resolve cannibalization issues.
            </p>
            <span style={{ 
              color: '#10b981', 
              fontSize: '0.875rem', 
              fontWeight: '500' 
            }}>
              Manage Pages →
            </span>
          </a>

          <div style={{ 
            backgroundColor: 'white', 
            padding: '1.5rem', 
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            opacity: 0.6
          }}>
            <div style={{ 
              width: '3rem', 
              height: '3rem', 
              backgroundColor: '#fef3c7', 
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}>
              <span style={{ fontSize: '1.5rem' }}>📝</span>
            </div>
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '600', 
              marginBottom: '0.5rem',
              color: '#111827'
            }}>
              Content Briefs
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
              Generate AI-powered content briefs with outlines, FAQs, and entity suggestions.
            </p>
            <span style={{ 
              color: '#92400e', 
              fontSize: '0.875rem', 
              fontWeight: '500' 
            }}>
              Coming Soon
            </span>
          </div>

          <div style={{ 
            backgroundColor: 'white', 
            padding: '1.5rem', 
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            opacity: 0.6
          }}>
            <div style={{ 
              width: '3rem', 
              height: '3rem', 
              backgroundColor: '#fce7f3', 
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}>
              <span style={{ fontSize: '1.5rem' }}>📊</span>
            </div>
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '600', 
              marginBottom: '0.5rem',
              color: '#111827'
            }}>
              Reports & Analytics
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
              Generate weekly reports and track SEO performance across all clients.
            </p>
            <span style={{ 
              color: '#92400e', 
              fontSize: '0.875rem', 
              fontWeight: '500' 
            }}>
              Coming Soon
            </span>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
