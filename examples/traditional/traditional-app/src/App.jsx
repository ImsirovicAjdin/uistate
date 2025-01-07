import { useSelector, useDispatch } from 'react-redux';
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
  Settings as SettingsIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { 
  setTheme, 
  toggleSidebar, 
  setActiveTab 
} from './store/uiSlice';
import NotificationCenter from './components/NotificationCenter';
import PerformanceMonitor from './core/PerformanceMonitor';

function App() {
  const dispatch = useDispatch();
  const { theme, layout, components } = useSelector(state => state.ui);
  
  const muiTheme = createTheme({
    palette: {
      mode: theme
    }
  });

  const handleThemeToggle = () => {
    dispatch(setTheme(theme === 'light' ? 'dark' : 'light'));
  };

  const handleSidebarToggle = () => {
    dispatch(toggleSidebar());
  };

  const handleTabChange = (tab) => {
    dispatch(setActiveTab(tab));
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
              Traditional Dashboard
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
          open={layout.sidebarExpanded}
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
              selected={components.activeTab === 'dashboard'}
              onClick={() => handleTabChange('dashboard')}
            >
              <ListItemIcon>
                <DashboardIcon />
              </ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItem>
            <ListItem 
              button
              selected={components.activeTab === 'settings'}
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
            ml: layout.sidebarExpanded ? '240px' : 0,
            transition: theme => theme.transitions.create(['margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          }}
        >
          <Paper sx={{ p: 2 }}>
            {components.activeTab === 'dashboard' && (
              <Typography variant="h5">Dashboard Content</Typography>
            )}
            {components.activeTab === 'settings' && (
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
