import React, { useEffect, useState } from "react";
import "./AdminPage.css"; // For styling
import { FaTrash } from "react-icons/fa"; // Importing Font Awesome Trash icon
import { FaCheck } from "react-icons/fa"; // Importing Font Awesome Check icon

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [notification, setNotification] = useState("");
  const [filter, setFilter] = useState("all");

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

  const handleApprove = async (userId) => {
    try {
      const response = await fetch(`https://haske.online:8080/api/verification/approve-user/${userId}`, {
        method: "POST",
      });
      const result = await response.json();

      if (response.ok) {
        setNotification("User approved successfully!");
        fetchUsers(); // Refresh user data after approval
      } else {
        setNotification("Error: " + result.message || "Approval failed.");
      }
    } catch (error) {
      console.error("Error approving user:", error);
      setNotification("An error occurred while approving the user.");
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
      setFilteredUsers(users.filter((user) => user.approved));
    } else if (filterValue === "unverified") {
      setFilteredUsers(users.filter((user) => !user.approved));
    } else {
      setFilteredUsers(users);
    }
  };

  useEffect(() => {
    fetchUsers();

    // Auto-refresh the user data every 60 seconds
    const interval = setInterval(fetchUsers, 30000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

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
                <th>Institution</th>
                <th>Institution Address</th>
                <th>Role</th>
                <th>Email</th>
                <th>Status</th>
                <th>Actions</th>
                <th>Approve</th> {/* New column for approval */}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className={user.approved ? "verified-row" : "unverified-row"}>
                  <td>{user.last_name}</td>
                  <td>{user.first_name}</td>
                  <td>{user.institution_name}</td>
                  <td>{user.institution_address}</td>
                  <td>{user.role}</td>
                  <td>{user.email}</td>
                  <td>{user.approved ? "Verified" : "Unverified"}</td>
                  <td>
                    <FaTrash
                      className="delete-icon"
                      title="Delete User"
                      onClick={() => handleDelete(user.id)}
                    />
                  </td>
                  <td>
                    {!user.approved && (
                      <FaCheck
                        className="approve-icon"
                        title="Approve User"
                        onClick={() => handleApprove(user.id)}
                      />
                    )}
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
