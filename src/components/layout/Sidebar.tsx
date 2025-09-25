import React from 'react';
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Chip, Avatar } from '@mui/material';
import { Theme } from '@mui/material/styles';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../auth/AuthContext';
import {
  Dashboard,
  People,
  Search,
  Description,
  Edit,
  Assignment,
  Analytics,
  Map,
  Leaderboard,
  LibraryBooks,
} from '@mui/icons-material';

const navigationItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Dashboard },
  { href: '/clients', label: 'Clients', icon: People },
  { href: '/keywords', label: 'Keywords', icon: Search },
  { href: '/keywords-map', label: 'Keyword Map', icon: Map },
  { href: '/heatmap', label: 'Heatmap', icon: Leaderboard },
  { href: '/blog-planner', label: 'Blog Planner', icon: LibraryBooks },
  { href: '/pages', label: 'Pages', icon: Description },
  { href: '/briefs', label: 'Briefs', icon: Edit },
  { href: '/tasks', label: 'Tasks', icon: Assignment },
  { href: '/analytics', label: 'Analytics', icon: Analytics },
];

interface SidebarProps {
  theme: Theme;
}

export default function Sidebar({ theme }: SidebarProps) {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Typography
          variant="h5"
          component="h1"
          sx={{ 
            fontWeight: 700,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          RankScope
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          SEO Management Platform
        </Typography>
      </Box>
      
      <List sx={{ flex: 1, px: 2, py: 1 }}>
        {navigationItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = router.pathname === item.href;
          
          return (
            <ListItem key={item.href} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={Link}
                href={item.href}
                selected={isActive}
                sx={{
                  borderRadius: 2,
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.primary.main,
                    color: 'white',
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark,
                    },
                    '& .MuiListItemText-primary': {
                      color: 'white',
                      fontWeight: 600,
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                  },
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                  },
                }}
              >
                <ListItemIcon sx={{ 
                  minWidth: 40,
                  color: isActive ? 'white' : 'inherit'
                }}>
                  <IconComponent />
                </ListItemIcon>
                <ListItemText 
                  primary={item.label} 
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? 'white' : 'inherit',
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, 
          backgroundColor: theme.palette.background.paper, 
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`
        }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main }}>
            {user?.email?.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>
              {user?.email}
            </Typography>
            <Chip 
              label={user?.role} 
              size="small" 
              variant="outlined"
              sx={{ height: 20, fontSize: '0.7rem', textTransform: 'capitalize' }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}