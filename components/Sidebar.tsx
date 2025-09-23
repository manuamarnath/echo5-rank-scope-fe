import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, Box } from '@mui/material';
import { Home, Search, Person, Settings } from '@mui/icons-material';

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
            {[{ text: 'Home', icon: <Home /> }, { text: 'Search', icon: <Search /> }, { text: 'Profile', icon: <Person /> }, { text: 'Settings', icon: <Settings /> }].map((item) => (
              <ListItem component="div" sx={{ cursor: 'pointer' }} key={item.text}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </Box>
  );
};

export default Sidebar;