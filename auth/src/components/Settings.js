import React, { useEffect, useState } from "react";
import { Paper, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import { toast } from "react-toastify";

const Settings = () => {
  const [users, setUsers] = useState([]);

  // Fetch users for role management
  useEffect(() => {
    fetch("https://api.haske.online/api/verification/get-users")
      .then((res) => res.json())
      .then((data) => setUsers(data));
  }, []);

  const promoteToAdmin = async (userId) => {
    await fetch(`https://api.haske.online/api/verification/promote-user/${userId}`, { method: "POST" });
    toast.success("User promoted to admin!");
    setUsers(users.map((u) => (u.id === userId ? { ...u, role: "admin" } : u)));
  };

  const demoteToUser = async (userId) => {
    await fetch(`https://api.haske.online/api/verification/demote-user/${userId}`, { method: "POST" });
    toast.info("User demoted to regular user.");
    setUsers(users.map((u) => (u.id === userId ? { ...u, role: "user" } : u)));
  };

  return (
    <Paper sx={{ p: 3, backgroundColor: "#E5E7EB", color: "#E5E7EB" }}>
      <Typography variant="h5" sx={{ color: "#0F172A" }}>
        Admin Settings
      </Typography>

      {/* Role Management Table */}
      <Typography variant="h6" sx={{ mt: 3, color: "#dd841a" }}>
        Manage User Roles
      </Typography>
      <Table sx={{ backgroundColor: "#333", color: "#E5E7EB" }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ color: "#dd841a" }}>Email</TableCell>
            <TableCell sx={{ color: "#dd841a" }}>Role</TableCell>
            <TableCell sx={{ color: "#dd841a" }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell sx={{ color: "#E5E7EB" }}>{user.email}</TableCell>
              <TableCell sx={{ color: "#E5E7EB" }}>{user.role}</TableCell>
              <TableCell>
                {user.role === "user" ? (
                  <Button
                    variant="contained"
                    sx={{ backgroundColor: "#dd841a", color: "#0F172A", "&:hover": { backgroundColor: "#E5E7EB", color: "#0F172A" } }}
                    onClick={() => promoteToAdmin(user.id)}
                  >
                    Promote to Admin
                  </Button>
                ) : (
                  <Button
                    variant="outlined"
                    sx={{ borderColor: "#dd841a", color: "#dd841a", "&:hover": { borderColor: "#E5E7EB", color: "#E5E7EB" } }}
                    onClick={() => demoteToUser(user.id)}
                  >
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
