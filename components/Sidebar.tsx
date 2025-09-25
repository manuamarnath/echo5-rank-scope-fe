import React from 'react';
import Link from 'next/link';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, Box } from '@mui/material';
import { Home, Search, Person, Settings, Speed } from '@mui/icons-material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import MapIcon from '@mui/icons-material/Map';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';

const drawerWidth = 240;

const Sidebar: React.FC = () => {
  return (
    <Box>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          ['& .MuiDrawer-paper']: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            <Link href="/" passHref legacyBehavior>
              <ListItem component="a" sx={{ cursor: 'pointer' }}>
                <ListItemIcon><Home /></ListItemIcon>
                <ListItemText primary="Home" />
              </ListItem>
            </Link>
            <Link href="/audits" passHref legacyBehavior>
              <ListItem component="a" sx={{ cursor: 'pointer' }}>
                <ListItemIcon><AssessmentIcon /></ListItemIcon>
                <ListItemText primary="Site Audits" />
              </ListItem>
            </Link>
            <Link href="/keywords-map" passHref legacyBehavior>
              <ListItem component="a" sx={{ cursor: 'pointer' }}>
                <ListItemIcon><MapIcon /></ListItemIcon>
                <ListItemText primary="Keyword Map" />
              </ListItem>
            </Link>
            <Link href="/heatmap" passHref legacyBehavior>
              <ListItem component="a" sx={{ cursor: 'pointer' }}>
                <ListItemIcon><WhatshotIcon /></ListItemIcon>
                <ListItemText primary="Heatmap" />
              </ListItem>
            </Link>
            <Link href="/blog-planner" passHref legacyBehavior>
              <ListItem component="a" sx={{ cursor: 'pointer' }}>
                <ListItemIcon><LibraryBooksIcon /></ListItemIcon>
                <ListItemText primary="Blog Planner" />
              </ListItem>
            </Link>
            <Link href="/performance" passHref legacyBehavior>
              <ListItem component="a" sx={{ cursor: 'pointer' }}>
                <ListItemIcon><Speed /></ListItemIcon>
                <ListItemText primary="Performance" />
              </ListItem>
            </Link>
            <Link href="/search" passHref legacyBehavior>
              <ListItem component="a" sx={{ cursor: 'pointer' }}>
                <ListItemIcon><Search /></ListItemIcon>
                <ListItemText primary="Search" />
              </ListItem>
            </Link>
            <Link href="/profile" passHref legacyBehavior>
              <ListItem component="a" sx={{ cursor: 'pointer' }}>
                <ListItemIcon><Person /></ListItemIcon>
                <ListItemText primary="Profile" />
              </ListItem>
            </Link>
            <Link href="/settings" passHref legacyBehavior>
              <ListItem component="a" sx={{ cursor: 'pointer' }}>
                <ListItemIcon><Settings /></ListItemIcon>
                <ListItemText primary="Settings" />
              </ListItem>
            </Link>
          </List>
        </Box>
      </Drawer>
    </Box>
  );
};

export default Sidebar;