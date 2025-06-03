import React, { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { auth } from "../firebaseConfig"; // Ensure correct Firebase setup
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
} from "@mui/material";
import logo from "../assets/haske.png"; // Import the logo properly
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; // Import the back icon

// Define menu items for the admin sidebar
const menuItems = [
  { name: "Dashboard", path: "/admin/dashboard" },
  { name: "Manage Users", path: "/admin/users" },
  { name: "Manage Institutions", path: "/admin/institutions" },
  { name: "Manage Haske MedAI", path: "/admin/models" },
  { name: "User Analytics", path: "/admin/analytics" },
  { name: "Settings", path: "/admin/settings" },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(null); // Null means loading
  const [darkMode, setDarkMode] = useState(false); // Dark mode state

  // Create a theme based on dark mode state
  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
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
          `https://haske.online:8090/api/verification/check-verification?email=${user.email}`
        );
        const data = await response.json();
        if (data.isAdmin) {
          setIsAdmin(true);
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

  const handleSignOut = () => {
    auth
      .signOut()
      .then(() => {
        navigate("/", { state: { message: "Signed out successfully!" } });
      })
      .catch((error) => {
        console.error("Error signing out:", error);
      });
  };

  // Show loader while verifying admin status
  if (isAdmin === null) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  // Function to handle back navigation
  const handleBackClick = () => {
    navigate("/patient-details");
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Apply the theme globally */}
      <Box sx={{ display: "flex", backgroundColor: darkMode ? "#121212" : "#F9FAFB" }}>
        {/* Sidebar */}
        <Drawer
          variant="permanent"
          sx={{
            width: 240,
            flexShrink: 0,
            bgcolor: darkMode ? "#333" : "#E5E7EB",
            "& .MuiDrawer-paper": { width: 240, bgcolor: darkMode ? "#333" : "#E5E7EB" },
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", p: 2 }}>
            <img src={logo} alt="Logo" style={{ width: "80%", height: "auto" }} />
          </Box>
          <List>
            <ListItem>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="body1" sx={{ color: darkMode ? "#E5E7EB" : "#333" }}>
                  Light
                </Typography>
                <Switch checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
                <Typography variant="body1" sx={{ color: darkMode ? "#E5E7EB" : "#333" }}>
                  Dark
                </Typography>
              </Box>
            </ListItem>
            {menuItems.map((item) => (
              <ListItem
                button
                key={item.name}
                selected={location.pathname === item.path}
                onClick={() => {
                  navigate(item.path);
                }}
              >
                <ListItemText primary={item.name} />
              </ListItem>
            ))}
            <ListItem component="button" onClick={handleSignOut} sx={{ "&:hover": { bgcolor: "#F87171" } }}>
              <ListItemText primary="Sign Out" />
            </ListItem>
          </List>
        </Drawer>

        {/* Main Content */}
        <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: darkMode ? "#121212" : "#E5E7EB", color: darkMode ? "#E5E7EB" : "#333" }}>
          <AppBar position="static" sx={{ bgcolor: darkMode ? "#333" : "#0F172A" }}>
            <Toolbar>
              {/* Back button - only show when not on dashboard */}
              {location.pathname !== "/admin/dashboard" && (
                <IconButton
                  edge="start"
                  color="inherit"
                  aria-label="back"
                  onClick={handleBackClick}
                  sx={{ mr: 2 }}
                >
                  <ArrowBackIcon />
                </IconButton>
              )}
              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                Admin Panel
              </Typography>
            </Toolbar>
          </AppBar>
          <Outlet />
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default AdminLayout;
