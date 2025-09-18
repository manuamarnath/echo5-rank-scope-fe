import { useState } from 'react';
import { useAuth } from './AuthContext';

interface LoginFormProps {
  onToggleMode: () => void;
}

export default function LoginForm({ onToggleMode }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: '#f9fafb', 
      padding: '3rem 1rem' 
    }}>
      <div style={{ maxWidth: '28rem', width: '100%' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ 
            fontSize: '1.875rem', 
            fontWeight: 'bold', 
            textAlign: 'center', 
            color: '#111827',
            marginBottom: '0.5rem'
          }}>
            Sign in to RankScope
          </h2>
          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#6b7280' }}>
            Or{' '}
            <button
              onClick={onToggleMode}
              style={{ 
                fontWeight: '500', 
                color: '#4f46e5', 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer' 
              }}
            >
              create a new account
            </button>
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{ 
              backgroundColor: '#fef2f2', 
              border: '1px solid #fecaca', 
              color: '#dc2626', 
              padding: '0.75rem 1rem', 
              borderRadius: '0.375rem',
              marginBottom: '1.5rem'
            }}>
              {error}
            </div>
          )}
          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="email" style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              color: '#374151', 
              marginBottom: '0.5rem' 
            }}>
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '0.5rem 0.75rem', 
                border: '1px solid #d1d5db', 
                borderRadius: '0.375rem', 
                fontSize: '0.875rem',
                outline: 'none'
              }}
              placeholder="Email address"
            />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="password" style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              color: '#374151', 
              marginBottom: '0.5rem' 
            }}>
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '0.5rem 0.75rem', 
                border: '1px solid #d1d5db', 
                borderRadius: '0.375rem', 
                fontSize: '0.875rem',
                outline: 'none'
              }}
              placeholder="Password"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              style={{ 
                width: '100%', 
                display: 'flex', 
                justifyContent: 'center', 
                padding: '0.5rem 1rem', 
                border: 'none', 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                borderRadius: '0.375rem', 
                color: 'white', 
                backgroundColor: loading ? '#9ca3af' : '#4f46e5', 
                cursor: loading ? 'not-allowed' : 'pointer' 
              }}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}