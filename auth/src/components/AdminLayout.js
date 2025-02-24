import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
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
  Button,
  IconButton,
  useTheme,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import Brightness4Icon from "@mui/icons-material/Brightness4"; // Dark mode icon
import Brightness7Icon from "@mui/icons-material/Brightness7"; // Light mode icon

// Define menu items for the admin sidebar
const menuItems = [
  { name: "Dashboard", path: "/admin/dashboard" },
  { name: "Manage Users", path: "/admin/users" },
  { name: "Analytics", path: "/admin/analytics" },
  { name: "Settings", path: "/admin/settings" },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(menuItems[0].path);
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
        } else {
          navigate("/");
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        navigate("/");
      }
    };

    checkAdminStatus();
  }, [navigate]);

  const handleSignOut = () => {
    auth.signOut().then(() => {
      navigate("/", { state: { message: "Signed out successfully!" } });
    }).catch((error) => {
      console.error("Error signing out:", error);
    });
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
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
      <Box sx={{ display: "flex", bgcolor: "background.default" }}>
        {/* Sidebar */}
        <Drawer variant="permanent" sx={{ width: 240, flexShrink: 0 }}>
          <List>
            <ListItem button onClick={() => navigate("/patient-details")}>
              <ListItemText primary="Haske" />
            </ListItem>
            {menuItems.map((item) => (
              <ListItem
                button
                key={item.name}
                selected={selected === item.path}
                onClick={() => {
                  setSelected(item.path);
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
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                Admin Panel
              </Typography>
              <IconButton onClick={toggleDarkMode} color="inherit">
                {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Toolbar>
          </AppBar>
          <Outlet />
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default AdminLayout;
