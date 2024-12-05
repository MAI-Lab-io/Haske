import React, { useEffect, useState } from "react";
import "./AdminPage.css"; // For styling

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
      setFilteredUsers(data);
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
        fetchUsers();
      } else {
        setNotification("Error: " + result.message || "Approval failed.");
      }
    } catch (error) {
      console.error("Error approving user:", error);
      setNotification("An error occurred while approving the user.");
    }
  };

  const handleFilterChange = (e) => {
    const filterValue = e.target.value;
    setFilter(filterValue);

    if (filterValue === "verified") {
      setFilteredUsers(users.filter((user) => user.isVerified));
    } else if (filterValue === "unverified") {
      setFilteredUsers(users.filter((user) => !user.isVerified));
    } else {
      setFilteredUsers(users);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-logo">
          <h2>Admin Dashboard</h2>
        </div>
        <nav>
          <ul className="sidebar-menu">
            <li><a href="#users">Manage Users</a></li>
            <li><a href="#analytics">Analytics</a></li>
            <li><a href="#settings">Settings</a></li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="admin-content">
        <header className="admin-header">
          <h1>User Management</h1>
        </header>

        {/* Notification */}
        {notification && <div className="notification">{notification}</div>}

        {/* Filter Section */}
        <div className="filter-section">
          <label htmlFor="filter">Filter Users:</label>
          <select id="filter" value={filter} onChange={handleFilterChange}>
            <option value="all">All Users</option>
            <option value="verified">Verified</option>
            <option value="unverified">Unverified</option>
          </select>
        </div>

        {/* User Table */}
        {filteredUsers.length === 0 ? (
          <p>No users to display.</p>
        ) : (
          <table className="user-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Institution</th>
                <th>Institution Address</th>
                <th>Role</th>
                <th>Email</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className={user.isVerified ? "verified-row" : "unverified-row"}>
                  <td>{user.name}</td>
                  <td>{user.institution_name}</td>
                  <td>{user.institution_address}</td>
                  <td>{user.role}</td>
                  <td>{user.email}</td>
                  <td>{user.isVerified ? "Verified" : "Unverified"}</td>
                  <td>
                    {!user.isVerified && (
                      <button className="approve-button" onClick={() => handleApprove(user.id)}>
                        Approve
                      </button>
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
