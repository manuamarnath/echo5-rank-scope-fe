import React from 'react';
import { useAuth } from '../src/components/auth/AuthContext';
import AuthWrapper from '../src/components/auth/AuthWrapper';
import MainLayout from '../src/components/layout/MainLayout';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  CardActions,
  CircularProgress,
  Container,
  Stack
} from '@mui/material';
import { Dashboard, People, Analytics, Assignment } from '@mui/icons-material';
import Link from 'next/link';

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <AuthWrapper />;
  }

  const quickActions: Array<{
    title: string;
    description: string;
    href: string;
    icon: React.ComponentType;
    color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  }> = [
    {
      title: 'Dashboard',
      description: 'View your SEO overview and statistics',
      href: '/dashboard',
      icon: Dashboard,
      color: 'primary'
    },
    {
      title: 'Client Management',
      description: 'Manage your client accounts and projects',
      href: '/clients',
      icon: People,
      color: 'secondary'
    },
    {
      title: 'Analytics',
      description: 'View detailed SEO reports and metrics',
      href: '/analytics',
      icon: Analytics,
      color: 'success'
    },
    {
      title: 'Task Management',
      description: 'Organize and track your SEO tasks',
      href: '/tasks',
      icon: Assignment,
      color: 'warning'
    }
  ];

  return (
    <MainLayout>
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
              Welcome to Seo-Ops OS
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Hello {user.email}! You are logged in as a {user.role}.
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Your comprehensive SEO management platform is ready to help you scale your business.
            </Typography>
          </Box>

          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: 3,
            mb: 4
          }}>
            {quickActions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <Card key={index} sx={{ 
                  height: '100%',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 4,
                  }
                }}>
                  <CardContent sx={{ pb: 1 }}>
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                      <Box sx={{ fontSize: 32, color: `${action.color}.main` }}>
                        <IconComponent />
                      </Box>
                      <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                        {action.title}
                      </Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {action.description}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button 
                      component={Link}
                      href={action.href}
                      variant="contained"
                      color={action.color}
                      size="small"
                      sx={{ ml: 1 }}
                    >
                      Get Started
                    </Button>
                  </CardActions>
                </Card>
              );
            })}
          </Box>

          <Card sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            textAlign: 'center'
          }}>
            <CardContent sx={{ py: 4 }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                Ready to optimize your SEO strategy?
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
                Access all features from your dashboard and start managing your SEO campaigns efficiently.
              </Typography>
              <Button 
                component={Link}
                href="/dashboard"
                variant="contained"
                color="inherit"
                size="large"
                sx={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  }
                }}
              >
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </MainLayout>
  );
}