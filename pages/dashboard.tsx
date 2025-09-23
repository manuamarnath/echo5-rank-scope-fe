import React from 'react';
import { useAuth } from '../src/components/auth/AuthContext';
import MainLayout from '../src/components/layout/MainLayout';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  IconButton,
  Stack,
} from '@mui/material';
import {
  TrendingUp,
  People,
  Search,
  Assignment,
  Analytics,
  Edit,
  Description,
  KeyboardArrowRight,
  Launch,
} from '@mui/icons-material';
import Link from 'next/link';

export default function Dashboard() {
  const { user } = useAuth();

  const statsData = [
    {
      title: 'Active Clients',
      value: '0',
      icon: People,
      color: '#2196f3',
      change: '+0%',
      trend: 'up'
    },
    {
      title: 'Keywords Tracked',
      value: '0',
      icon: Search,
      color: '#4caf50',
      change: '+0%',
      trend: 'up'
    },
    {
      title: 'Pages Managed',
      value: '0',
      icon: Description,
      color: '#ff9800',
      change: '+0%',
      trend: 'up'
    },
    {
      title: 'Tasks Completed',
      value: '0',
      icon: Assignment,
      color: '#9c27b0',
      change: '+0%',
      trend: 'up'
    },
  ];

  const featureCards = [
    {
      title: 'Client Management',
      description: 'Manage client accounts, contacts, and SEO projects in one centralized platform.',
      icon: People,
      color: '#e3f2fd',
      iconColor: '#1976d2',
      href: '/clients',
      status: 'Available'
    },
    {
      title: 'Keyword Tracking',
      description: 'Track keyword rankings, search volumes, and performance across all campaigns.',
      icon: Search,
      color: '#e8f5e8',
      iconColor: '#388e3c',
      href: '/keywords',
      status: 'Available'
    },
    {
      title: 'Task Management',
      description: 'Organize SEO tasks, deadlines, and team workflows with advanced project management.',
      icon: Assignment,
      color: '#fff3e0',
      iconColor: '#f57c00',
      href: '/tasks',
      status: 'Available'
    },
    {
      title: 'Content Briefs',
      description: 'Generate AI-powered content briefs with outlines, FAQs, and entity suggestions.',
      icon: Edit,
      color: '#fce4ec',
      iconColor: '#c2185b',
      href: '/briefs',
      status: 'Available'
    },
    {
      title: 'Analytics & Reports',
      description: 'Generate comprehensive SEO reports and track performance metrics.',
      icon: Analytics,
      color: '#f3e5f5',
      iconColor: '#7b1fa2',
      href: '/analytics',
      status: 'Available'
    },
  ];

  return (
    <MainLayout>
      <Box sx={{ pb: 4 }}>
        {/* Welcome Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            Welcome back, {user?.email?.split('@')[0] || 'User'}! 👋
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Here&apos;s what&apos;s happening with your SEO campaigns today.
          </Typography>
        </Box>

        {/* Quick Stats */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
          gap: 3,
          mb: 4 
        }}>
          {statsData.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index} sx={{ 
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 4,
                }
              }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography color="text.secondary" gutterBottom variant="body2">
                        {stat.title}
                      </Typography>
                      <Typography variant="h4" component="h2" sx={{ fontWeight: 700, mb: 1 }}>
                        {stat.value}
                      </Typography>
                      <Chip 
                        label={stat.change} 
                        size="small" 
                        color={stat.trend === 'up' ? 'success' : 'error'}
                        icon={<TrendingUp sx={{ fontSize: 16 }} />}
                      />
                    </Box>
                    <Avatar sx={{ bgcolor: stat.color, width: 48, height: 48 }}>
                      <IconComponent />
                    </Avatar>
                  </Stack>
                </CardContent>
              </Card>
            );
          })}
        </Box>

        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
          gap: 3 
        }}>
          {/* Recent Activity */}
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                Recent Activity
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">
                  No recent activity to display
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Start by adding clients or creating tasks to see activity here.
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                Quick Actions
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List>
                {[
                  { label: 'Add New Client', href: '/clients', icon: People },
                  { label: 'Create Task', href: '/tasks', icon: Assignment },
                  { label: 'Generate Brief', href: '/briefs', icon: Edit },
                  { label: 'View Analytics', href: '/analytics', icon: Analytics },
                ].map((action, index) => {
                  const IconComponent = action.icon;
                  return (
                    <ListItem 
                      key={index}
                      component={Link}
                      href={action.href}
                      sx={{ 
                        borderRadius: 1,
                        mb: 0.5,
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        }
                      }}
                    >
                      <Avatar sx={{ mr: 2, width: 32, height: 32, bgcolor: 'primary.light' }}>
                        <IconComponent sx={{ fontSize: 18 }} />
                      </Avatar>
                      <ListItemText primary={action.label} />
                      <KeyboardArrowRight color="action" />
                    </ListItem>
                  );
                })}
              </List>
            </CardContent>
          </Card>
        </Box>

        {/* Feature Cards */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
            Available Features
          </Typography>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
            gap: 3 
          }}>
            {featureCards.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} sx={{ 
                  height: '100%',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 8,
                  }
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                      <Avatar sx={{ 
                        bgcolor: feature.color, 
                        color: feature.iconColor,
                        width: 56, 
                        height: 56 
                      }}>
                        <IconComponent sx={{ fontSize: 28 }} />
                      </Avatar>
                      <IconButton 
                        component={Link}
                        href={feature.href}
                        size="small"
                        sx={{ color: 'primary.main' }}
                      >
                        <Launch />
                      </IconButton>
                    </Stack>
                    
                    <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {feature.description}
                    </Typography>
                    <Chip 
                      label={feature.status} 
                      size="small" 
                      color="success" 
                      variant="outlined"
                    />
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        </Box>
      </Box>
    </MainLayout>
  );
}