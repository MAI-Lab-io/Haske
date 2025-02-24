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
  IconButton,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import DarkModeIcon from "@mui/icons-material/NightsStay";
import LightModeIcon from "@mui/icons-material/WbSunny";

// Define menu items for the admin sidebar
const menuItems = [
  { name: "Dashboard", path: "/admin/dashboard" },
  { name: "Manage Users", path: "/admin/users" },
  { name: "Analytics", path: "/admin/analytics" },
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
        navigate("/");
        return;
      }

      try {
        const response = await fetch(
          `https://haske.online:8080/api/verification/check-verification?email=${user.email}`
        );
        const data = await response.json();
        if (data.isAdmin) {
          setIsAdmin(true);
          if (location.pathname === "/admin") {
            navigate("/admin/dashboard");
          }
        } else {
          navigate("/");
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        navigate("/");
      }
    };

    checkAdminStatus();
  }, [navigate, location.pathname]);

  const handleSignOut = () => {
    auth.signOut().then(() => {
      navigate("/", { state: { message: "Signed out successfully!" } });
    }).catch((error) => {
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

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Apply the theme globally */}
      <Box sx={{ display: "flex", backgroundColor: darkMode ? "#121212" : "#F9FAFB" }}>
        {/* Sidebar */}
        <Drawer variant="permanent" sx={{ width: 130, flexShrink: 0, bgcolor: darkMode ? "#333" : "#E5E7EB" }}>
          <List>
            <ListItem>
              <IconButton onClick={() => setDarkMode(!darkMode)} color="inherit">
                {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
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
            <ListItem button onClick={handleSignOut}>
              <ListItemText primary="Sign Out" />
            </ListItem>
          </List>
        </Drawer>

        {/* Main Content */}
        <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: darkMode ? "#121212" : "#E5E7EB", color: darkMode ? "#E5E7EB" : "#333" }}>
          <AppBar position="static" sx={{ bgcolor: darkMode ? "#333" : "#0F172A" }}>
            <Toolbar>
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
