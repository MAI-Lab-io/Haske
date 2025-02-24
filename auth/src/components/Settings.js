import React, { useEffect, useState } from "react";
import { Paper, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import { toast } from "react-toastify";

const Settings = () => {
  const [users, setUsers] = useState([]);

  // Fetch users for role management
  useEffect(() => {
    fetch("https://haske.online:8080/api/verification/get-users")
      .then((res) => res.json())
      .then((data) => setUsers(data));
  }, []);

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
