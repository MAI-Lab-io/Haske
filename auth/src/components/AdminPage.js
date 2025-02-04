import React, { useEffect, useState } from "react";
import { FaTrash, FaLock, FaUnlock } from "react-icons/fa";
import { useNavigate } from "react-router-dom"; // Ensure you have this import
import { auth } from "../firebaseConfig";
import "./AdminPage.css"; // For styling

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [notification, setNotification] = useState("");
  const [filter, setFilter] = useState("all");
  const [isAdmin, setIsAdmin] = useState(false); // Added isAdmin state
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const response = await fetch("https://haske.online:8080/api/verification/get-users");
      const data = await response.json();
      setUsers(data);
      setFilteredUsers(data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))); // Sort by created_at
    } catch (error) {
      console.error("Error fetching users:", error);
      setNotification("Failed to load users. Please try again.");
    }
  };

  const checkAdminStatus = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const response = await fetch(`https://haske.online:8080/api/verification/check-verification?email=${user.email}`);
        const data = await response.json();
        if (data.isAdmin) {
          setIsAdmin(true);
          fetchUsers();
        } else {
          navigate("/");
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        navigate("/");
      }
    } else {
      navigate("/");
    }
  };

  useEffect(() => {
    checkAdminStatus();
  }, [navigate]);

  const handleApprove = async (userId, approved) => {
    try {
      const response = await fetch(`https://haske.online:8080/api/verification/approve-user/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ approved }),
      });

      const result = await response.json();

      if (response.ok) {
        setNotification("User updated successfully!");
        fetchUsers(); // Refresh user data after update
      } else {
        setNotification("Error: " + result.message || "Approval failed.");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      setNotification("An error occurred while updating the user.");
    }
  };

  const handleDeactivate = async (userId, deactivated) => {
    try {
      const response = await fetch(`https://haske.online:8080/api/verification/deactivate-user/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ deactivated }),
      });

      const result = await response.json();

      if (response.ok) {
        setNotification(deactivated ? "User deactivated successfully!" : "User activated successfully!");
        fetchUsers(); // Refresh user data after update
      } else {
        setNotification("Error: " + result.message || "Failed to update user status.");
      }
    } catch (error) {
      console.error("Error updating user status:", error);
      setNotification("An error occurred while updating the user status.");
    }
  };

  const handleMakeAdmin = async (userId) => {
    if (!window.confirm("Are you sure you want to make this user an Admin?")) return;

    try {
      const response = await fetch(`https://haske.online:8080/api/verification/update-role/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: "admin" }),
      });

      const result = await response.json();

      if (response.ok) {
        setNotification("User promoted to Admin successfully!");
        fetchUsers(); // Refresh the list
      } else {
        setNotification("Error: " + result.message || "Failed to update role.");
      }
    } catch (error) {
      console.error("Error updating user role:", error);
      setNotification("An error occurred while updating the role.");
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      const response = await fetch(`https://haske.online:8080/api/verification/delete-user/${userId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setNotification("User deleted successfully!");
        fetchUsers(); // Refresh user list after deletion
      } else {
        const result = await response.json();
        setNotification("Error: " + result.message || "Failed to delete user.");
      }
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

  useEffect(() => {
    const interval = setInterval(fetchUsers, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!isAdmin) {
    return <div>Loading...</div>;
  }

  return (
    <div className="admin-container">
      <aside className="admin-sidebar">
        <div className="sidebar-logo">Admin Panel</div>
        <nav>
          <ul className="sidebar-menu">
            <li><a href="#dashboard">Dashboard</a></li>
            <li><a href="#users">Manage Users</a></li>
            <li><a href="#analytics">Analytics</a></li>
            <li><a href="#settings">Settings</a></li>
          </ul>
        </nav>
      </aside>

      <main className="admin-content">
        <header className="admin-header">
          <h1>User Management</h1>
        </header>

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
                <th>Last Name / Surname</th>
                <th>First Name</th>
                <th>Institution Name</th>
                <th>Institution Address</th>
                <th>Role</th>
                <th>Email</th>
                <th>Phone Number</th>
                <th>Status</th>
                <th>Actions</th>
                <th>Account Approval</th>
                <th>Admin Privileges</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className={user.deactivated ? "deactivated-row" : user.approved ? "verified-row" : "unverified-row"}>
                  <td>{user.last_name}</td>
                  <td>{user.first_name}</td>
                  <td>{user.institution_name}</td>
                  <td>{user.institution_address}</td>
                  <td>{user.role}</td>
                  <td>{user.email}</td>
                  <td>{user.phone_number}</td>
                  <td>{user.deactivated ? "Deactivated" : user.approved ? "Verified" : "Unverified"}</td>
                  <td>
                    <FaTrash
                      className="delete-icon"
                      onClick={() => handleDelete(user.id)}
                    />
                  </td>
                  <td>
                    <button onClick={() => handleApprove(user.id, !user.approved)}>
                      {user.approved ? "Unapprove" : "Approve"}
                    </button>
                  </td>
                  <td>
                    <button onClick={() => handleMakeAdmin(user.id)}>
                      Make Admin
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
};

export default AdminPage;
