import React, { useEffect, useState } from "react";
import { FaTrash, FaLock, FaUnlock } from "react-icons/fa";
import { auth } from "../firebaseConfig";
import "./ManageUsers.css"; // Ensure this CSS file exists for styling

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [notification, setNotification] = useState("");
  const [filter, setFilter] = useState("all");

  const fetchUsers = async () => {
    try {
      const response = await fetch("https://api.haske.online/api/verification/get-users");
      const data = await response.json();
      setUsers(data);
      setFilteredUsers(data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    } catch (error) {
      console.error("Error fetching users:", error);
      setNotification("Failed to load users. Please try again.");
    }
  };

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(fetchUsers, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleApprove = async (userId, approved) => {
    try {
      const response = await fetch(`https://api.haske.online/api/verification/approve-user/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved }),
      });

      const result = await response.json();
      response.ok ? setNotification("User updated successfully!") : setNotification(result.message || "Approval failed.");
      fetchUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      setNotification("An error occurred while updating the user.");
    }
  };

  const handleDeactivate = async (userId, deactivated) => {
    try {
      const response = await fetch(`https://api.haske.online/api/verification/deactivate-user/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deactivated }),
      });

      const result = await response.json();
      response.ok
        ? setNotification(deactivated ? "User deactivated successfully!" : "User activated successfully!")
        : setNotification(result.message || "Failed to update user status.");
      fetchUsers();
    } catch (error) {
      console.error("Error updating user status:", error);
      setNotification("An error occurred while updating the user status.");
    }
  };

  const handleMakeAdmin = async (userId) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      // Check if requester is super admin
      const response = await fetch(
        `https://api.haske.online/api/verification/check-verification?email=${user.email}`
      );
      const data = await response.json();
      
      if (!data.isSuperAdmin) {
        setNotification("Only super admins can modify roles.");
        return;
      }

      if (!window.confirm("Are you sure you want to change this user's role?")) return;

      const roleResponse = await fetch(`https://api.haske.online/api/verification/update-role/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          role: "admin", 
          requesterEmail: user.email 
        }),
      });

      const result = await roleResponse.json();
      if (roleResponse.ok) {
        setNotification("User role updated successfully!");
        fetchUsers();
      } else {
        setNotification(result.message || "Failed to update role.");
      }
    } catch (error) {
      console.error("Error updating user role:", error);
      setNotification("An error occurred while updating the role.");
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const response = await fetch(`https://api.haske.online/api/verification/delete-user/${userId}`, { method: "DELETE" });

      response.ok ? setNotification("User deleted successfully!") : setNotification("Failed to delete user.");
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      setNotification("An error occurred while deleting the user.");
    }
  };

  const handleFilterChange = (e) => {
    const filterValue = e.target.value;
    setFilter(filterValue);

    if (filterValue === "verified") {
      setFilteredUsers(users.filter((user) => user.approved && !user.deactivated));
    } else if (filterValue === "unverified") {
      setFilteredUsers(users.filter((user) => !user.approved));
    } else if (filterValue === "deactivated") {
      setFilteredUsers(users.filter((user) => user.deactivated));
    } else {
      setFilteredUsers(users);
    }
  };

  // Function to log user actions
  const logUserAction = async (userId, action) => {
    try {
      const user = auth.currentUser;
      const response = await fetch("https://api.haske.online/api/verification/log-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          action: `User ${action}d with ID ${userId}`
        })
      });

      if (!response.ok) {
        console.error("Failed to log the action.");
      }
    } catch (error) {
      console.error("Error logging user action:", error);
    }
  };
  
  return (
    <div className="manage-users-container">
      <h1>User Management</h1>

      {notification && <div className="notification">{notification}</div>}

      <div className="filter-section">
        <label htmlFor="filter">Filter Users:</label>
        <select id="filter" value={filter} onChange={handleFilterChange}>
          <option value="all">All Users</option>
          <option value="verified">Verified</option>
          <option value="unverified">Unverified</option>
          <option value="deactivated">Deactivated</option>
        </select>
      </div>

      {filteredUsers.length === 0 ? (
        <p>No users to display.</p>
      ) : (
        <table className="user-table">
          <thead>
            <tr>
              <th>Last Name</th>
              <th>First Name</th>
              <th>Institution</th>
              <th>Role</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Actions</th>
              <th>Approval</th>
              <th>Admin</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className={user.deactivated ? "deactivated-row" : user.approved ? "verified-row" : "unverified-row"}>
                <td>{user.last_name}</td>
                <td>{user.first_name}</td>
                <td>{user.institution_name}</td>
                <td>{user.role}</td>
                <td>{user.email}</td>
                <td>{user.phone_number}</td>
                <td>{user.deactivated ? "Deactivated" : user.approved ? "Verified" : "Unverified"}</td>
                <td>
                  <FaTrash className="delete-icon" title="Delete User" onClick={() => handleDelete(user.id)} />
                  <span onClick={() => handleDeactivate(user.id, !user.deactivated)} title={user.deactivated ? "Activate User" : "Deactivate User"}>
                    {user.deactivated ? <FaUnlock /> : <FaLock />}
                  </span>
                </td>
                <td>
                  <input type="checkbox" checked={user.approved} onChange={() => handleApprove(user.id, !user.approved)} disabled={user.deactivated} />
                </td>
                <td>
                  <button onClick={() => handleMakeAdmin(user.id)} disabled={user.role === "admin"}>Make Admin</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ManageUsers;
