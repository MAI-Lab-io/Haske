import React, { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { auth } from "../firebaseConfig";
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  AppBar,
  Toolbar,
  Typography,
  CssBaseline,
  Box,
  CircularProgress,
  Switch,
  ThemeProvider,
  createTheme,
  IconButton,
  Button
} from "@mui/material";
import logo from "../assets/haske.png";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import ModelTrainingIcon from '@mui/icons-material/ModelTraining';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import SettingsIcon from '@mui/icons-material/Settings';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

// Enhanced menu items with icons
const menuItems = [
  { name: "Dashboard", path: "/admin/dashboard", icon: <DashboardIcon /> },
  { name: "Manage Users", path: "/admin/users", icon: <PeopleIcon /> },
  { name: "Manage Institutions", path: "/admin/institutions", icon: <SchoolIcon /> },
  { name: "Manage Haske MedAI", path: "/admin/models", icon: <ModelTrainingIcon /> },
  { name: "User Analytics", path: "/admin/analytics", icon: <AnalyticsIcon /> },
  { name: "Settings", path: "/admin/settings", icon: <SettingsIcon /> },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);

  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      primary: {
        main: '#dd841a', // Orange color for primary actions
      },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    },
  });

  useEffect(() => {
    const checkAdminStatus = async () => {
      const user = auth.currentUser;
      if (!user) {
        setIsAdmin(false);
        navigate("/");
        return;
      }

      try {
        const response = await fetch(
          `https://api.haske.online/api/verification/check-verification?email=${user.email}`
        );
        const data = await response.json();
        if (data.isAdmin || data.isSuperAdmin) {
          setIsAdmin(true);
          setIsSuperAdmin(data.isSuperAdmin || false);
          if (location.pathname === "/admin") {
            navigate("/admin/dashboard");
          }
        } else {
          setIsAdmin(false);
          navigate("/");
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
        navigate("/");
      }
    };

    checkAdminStatus();
  }, [navigate, location.pathname]);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      navigate("/", { state: { message: "Signed out successfully!" } });
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleBackClick = () => {
    // Go to previous page in history, or fallback to dashboard
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate("/admin/dashboard");
    }
  };

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  if (isAdmin === null) {
    return (
      <Box sx={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh",
        backgroundColor: darkMode ? "#121212" : "#F9FAFB"
      }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        display: "flex", 
        backgroundColor: darkMode ? "#121212" : "#F9FAFB",
        minHeight: "100vh"
      }}>
        {/* Collapsible Sidebar */}
        <Drawer
          variant="permanent"
          open={isDrawerOpen}
          sx={{
            width: isDrawerOpen ? 240 : 72,
            flexShrink: 0,
            whiteSpace: 'nowrap',
            transition: 'width 0.3s ease',
            '& .MuiDrawer-paper': {
              width: isDrawerOpen ? 240 : 72,
              overflowX: 'hidden',
              transition: 'width 0.3s ease',
              bgcolor: darkMode ? "#1E293B" : "#FFFFFF",
              borderRight: darkMode ? '1px solid #333' : '1px solid #E5E7EB'
            },
          }}
        >
          <Box sx={{ 
            display: "flex", 
            justifyContent: "center", 
            alignItems: "center", 
            p: 2,
            minHeight: 64
          }}>
            {isDrawerOpen ? (
              <img src={logo} alt="Logo" style={{ width: "80%", height: "auto" }} />
            ) : (
              <img src={logo} alt="Logo" style={{ width: "40px", height: "auto" }} />
            )}
          </Box>
          
          <List sx={{ px: isDrawerOpen ? 2 : 1 }}>
            <ListItem sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              mb: 2
            }}>
              {isDrawerOpen && (
                <Typography variant="body2" sx={{ color: darkMode ? "#E5E7EB" : "#64748B" }}>
                  Theme
                </Typography>
              )}
              <Switch 
                checked={darkMode} 
                onChange={() => setDarkMode(!darkMode)} 
                size={isDrawerOpen ? "medium" : "small"}
              />
            </ListItem>
            
            {menuItems.map((item) => (
              <ListItem
                button
                key={item.name}
                selected={location.pathname === item.path}
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  '&.Mui-selected': {
                    backgroundColor: darkMode ? '#334155' : '#F1F5F9',
                  },
                  '&.Mui-selected:hover': {
                    backgroundColor: darkMode ? '#334155' : '#F1F5F9',
                  },
                }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  color: location.pathname === item.path ? 
                    (darkMode ? '#dd841a' : '#0F172A') : 
                    (darkMode ? '#E5E7EB' : '#64748B')
                }}>
                  {item.icon}
                  {isDrawerOpen && (
                    <ListItemText 
                      primary={item.name} 
                      sx={{ ml: 2 }} 
                      primaryTypographyProps={{
                        fontWeight: location.pathname === item.path ? '600' : '400'
                      }}
                    />
                  )}
                </Box>
              </ListItem>
            ))}
            
            <ListItem 
              button 
              onClick={handleSignOut}
              sx={{
                borderRadius: 2,
                mt: 'auto',
                '&:hover': { 
                  backgroundColor: darkMode ? '#7F1D1D' : '#FEE2E2',
                  color: darkMode ? '#FECACA' : '#DC2626'
                }
              }}
            >
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                color: darkMode ? '#FECACA' : '#DC2626'
              }}>
                <ExitToAppIcon />
                {isDrawerOpen && (
                  <ListItemText primary="Sign Out" sx={{ ml: 2 }} />
                )}
              </Box>
            </ListItem>
          </List>
        </Drawer>

        {/* Main Content Area */}
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1, 
            p: 3, 
            bgcolor: darkMode ? "#121212" : "#F9FAFB",
            transition: 'margin 0.3s ease',
            ml: isDrawerOpen ? 0 : '-168px'
          }}
        >
          {/* App Bar */}
          <AppBar 
            position="static" 
            sx={{ 
              bgcolor: darkMode ? "#1E293B" : "#FFFFFF",
              color: darkMode ? "#E5E7EB" : "#0F172A",
              boxShadow: 'none',
              borderBottom: darkMode ? '1px solid #334155' : '1px solid #E5E7EB',
              borderRadius: 2,
              mb: 3
            }}
          >
            <Toolbar>
              <IconButton
                edge="start"
                color="inherit"
                aria-label="back"
                onClick={handleBackClick}
                sx={{ mr: 2 }}
              >
                <ArrowBackIcon />
              </IconButton>
              
              <Typography 
                variant="h6" 
                sx={{ 
                  flexGrow: 1,
                  fontWeight: 600
                }}
              >
                {menuItems.find(item => item.path === location.pathname)?.name || 'Admin Panel'}
              </Typography>
              
              {isSuperAdmin && (
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    mr: 2,
                    color: darkMode ? '#dd841a' : '#dd841a',
                    fontWeight: 'bold'
                  }}
                >
                  SUPER ADMIN
                </Typography>
              )}
              
              <Button 
                onClick={toggleDrawer}
                sx={{
                  color: darkMode ? "#E5E7EB" : "#0F172A",
                  textTransform: 'none'
                }}
              >
                {isDrawerOpen ? 'Collapse Menu' : 'Expand Menu'}
              </Button>
            </Toolbar>
          </AppBar>
          
          {/* Page Content */}
          <Box sx={{ 
            backgroundColor: darkMode ? "#1E293B" : "#FFFFFF",
            borderRadius: 2,
            p: 3,
            boxShadow: darkMode ? 'none' : '0px 2px 4px rgba(0, 0, 0, 0.05)',
            minHeight: 'calc(100vh - 180px)'
          }}>
            <Outlet />
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default AdminLayout;
