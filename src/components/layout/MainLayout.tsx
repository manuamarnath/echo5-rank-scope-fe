import { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../auth/AuthContext';

interface LayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const navigationItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/clients', label: 'Clients', icon: '👥' },
    { href: '/keywords', label: 'Keywords', icon: '🔍' },
    { href: '/pages', label: 'Pages', icon: '📄' },
    { href: '/briefs', label: 'Briefs', icon: '✏️' },
    { href: '/tasks', label: 'Tasks', icon: '📋' },
    { href: '/analytics', label: 'Analytics', icon: '📈' },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <nav style={{ backgroundColor: 'white', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
        <div style={{ 
          maxWidth: '80rem', 
          margin: '0 auto', 
          padding: '0 1rem' 
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            height: '4rem' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
              <Link href="/dashboard" style={{ textDecoration: 'none' }}>
                <h1 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '600', 
                  color: '#111827',
                  margin: 0,
                  cursor: 'pointer'
                }}>
                  RankScope
                </h1>
              </Link>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                {navigationItems.map(item => (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    style={{
                      textDecoration: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: router.pathname === item.href ? '#3b82f6' : '#6b7280',
                      backgroundColor: router.pathname === item.href ? '#eff6ff' : 'transparent',
                      transition: 'all 0.2s'
                    }}
                  >
                    {item.icon} {item.label}
                  </Link>
                ))}
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '0.875rem', color: '#374151' }}>
                {user?.email} ({user?.role})
              </span>
              <button
                onClick={logout}
                style={{ 
                  fontSize: '0.875rem', 
                  color: '#6b7280', 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.375rem',
                  transition: 'color 0.2s'
                }}
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main style={{ 
        maxWidth: '80rem', 
        margin: '0 auto', 
        padding: '1.5rem 1rem' 
      }}>
        {children}
      </main>
    </div>
  );
}