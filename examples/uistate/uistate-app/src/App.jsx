import React from 'react';
import { 
  ThemeProvider, 
  CssBaseline, 
  createTheme,
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper
} from '@mui/material';
import {
  Menu as MenuIcon,
  Brightness4 as DarkIcon,
  Brightness7 as LightIcon,
  Dashboard as DashboardIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useUIState } from './core/useUIState';
import NotificationCenter from './components/NotificationCenter';
import PerformanceMonitor from './core/PerformanceMonitor';

function App() {
  const [theme, setTheme] = useUIState('theme', 'light');
  const [sidebarExpanded, setSidebarExpanded] = useUIState('layout-sidebar', true);
  const [activeTab, setActiveTab] = useUIState('active-tab', 'dashboard');
  
  const muiTheme = createTheme({
    palette: {
      mode: theme
    }
  });

  const handleThemeToggle = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleSidebarToggle = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        {/* AppBar */}
        <AppBar position="fixed">
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleSidebarToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              UIState Dashboard
            </Typography>
            <IconButton color="inherit" onClick={handleThemeToggle}>
              {theme === 'light' ? <DarkIcon /> : <LightIcon />}
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* Sidebar */}
        <Drawer
          variant="persistent"
          anchor="left"
          open={sidebarExpanded}
          sx={{
            width: 240,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 240,
              boxSizing: 'border-box',
              top: '64px',
              height: 'calc(100% - 64px)'
            },
          }}
        >
          <List>
            <ListItem 
              button 
              selected={activeTab === 'dashboard'}
              onClick={() => handleTabChange('dashboard')}
            >
              <ListItemIcon>
                <DashboardIcon />
              </ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItem>
            <ListItem 
              button
              selected={activeTab === 'settings'}
              onClick={() => handleTabChange('settings')}
            >
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary="Settings" />
            </ListItem>
          </List>
        </Drawer>

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            mt: 8,
            ml: sidebarExpanded ? '240px' : 0,
            transition: theme => theme.transitions.create(['margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          }}
        >
          <Paper sx={{ p: 2 }}>
            {activeTab === 'dashboard' && (
              <Typography variant="h5">Dashboard Content</Typography>
            )}
            {activeTab === 'settings' && (
              <Typography variant="h5">Settings Content</Typography>
            )}
          </Paper>
        </Box>
      </Box>
      <NotificationCenter />
      <PerformanceMonitor />
    </ThemeProvider>
  );
}

export default App;
