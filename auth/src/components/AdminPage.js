import React, { useEffect, useState } from "react";
import "./AdminPage.css"; // For styling

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [notification, setNotification] = useState(""); // State for success or error message
  const [filter, setFilter] = useState("all"); // Filter: "all", "verified", "unverified"

  const fetchUsers = async () => {
    try {
      const response = await fetch("https://haske.online:8080/api/verification/get-users");
      const data = await response.json();
      setUsers(data);
      setFilteredUsers(data); // Initially, no filter, show all users
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleApprove = async (userId) => {
    try {
      const response = await fetch(`https://haske.online:8080/api/verification/approve-user/${userId}`, {
        method: "POST",
      });
      const result = await response.json();
      
      if (response.ok) {
        setNotification("User approved successfully and notified!");
        fetchUsers(); // Refresh the user list after approval
      } else {
        setNotification("Error: " + result.message || "An error occurred. Please try again.");
      }
    } catch (error) {
      console.error("Error approving user:", error);
      setNotification("An error occurred while approving the user. Please try again.");
    }
  };

  // Filter users based on verification status
  const handleFilterChange = (e) => {
    const filterValue = e.target.value;
    setFilter(filterValue);

    if (filterValue === "verified") {
      setFilteredUsers(users.filter((user) => user.isVerified));
    } else if (filterValue === "unverified") {
      setFilteredUsers(users.filter((user) => !user.isVerified));
    } else {
      setFilteredUsers(users); // Show all users
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="admin-page">
      <h2 className="admin-page-title">Admin Page</h2>

      {/* Display Notification */}
      {notification && <p className="notification">{notification}</p>}

      <div className="filter-container">
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
              <tr key={user.id} className={user.isVerified ? "verified" : "unverified"}>
                <td>{user.name}</td>
                <td>{user.institution_name}</td>
                <td>{user.institution_address}</td>
                <td>{user.role}</td>
                <td>{user.email}</td>
                <td>
                  <button
                    className={user.isVerified ? "verify-button verified" : "verify-button unverified"}
                    disabled={user.isVerified}
                  >
                    {user.isVerified ? "Verified" : "Verify"}
                  </button>
                </td>
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
    </div>
  );
};

export default AdminPage;
