import React, { useEffect, useState } from "react";
import { Paper, Typography, Switch, FormControlLabel, Button, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import { toast } from "react-toastify";

const Settings = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [users, setUsers] = useState([]);

  // Load saved dark mode preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedTheme);
  }, []);

  // Fetch users for role management
  useEffect(() => {
    fetch("https://haske.online:8080/api/verification/get-users")
      .then((res) => res.json())
      .then((data) => setUsers(data));
  }, []);

  const handleDarkModeToggle = () => {
    setDarkMode((prev) => !prev);
    localStorage.setItem("darkMode", !darkMode);
  };

  const promoteToAdmin = async (userId) => {
    await fetch(`https://haske.online:8080/api/verification/promote-user/${userId}`, { method: "POST" });
    toast.success("User promoted to admin!");
    setUsers(users.map((u) => (u.id === userId ? { ...u, role: "admin" } : u)));
  };

  const demoteToUser = async (userId) => {
    await fetch(`https://haske.online:8080/api/verification/demote-user/${userId}`, { method: "POST" });
    toast.info("User demoted to regular user.");
    setUsers(users.map((u) => (u.id === userId ? { ...u, role: "user" } : u)));
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5">Admin Settings</Typography>

      {/* Dark Mode Toggle */}
      <FormControlLabel
        control={<Switch checked={darkMode} onChange={handleDarkModeToggle} />}
        label="Enable Dark Mode"
      />

      {/* Role Management Table */}
      <Typography variant="h6" sx={{ mt: 3 }}>Manage User Roles</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Email</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>
                {user.role === "user" ? (
                  <Button variant="contained" color="primary" onClick={() => promoteToAdmin(user.id)}>
                    Promote to Admin
                  </Button>
                ) : (
                  <Button variant="outlined" color="secondary" onClick={() => demoteToUser(user.id)}>
                    Demote to User
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default Settings;
