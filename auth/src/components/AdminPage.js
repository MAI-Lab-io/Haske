import React, { useEffect, useState } from "react";

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [notification, setNotification] = useState(""); // State for success or error message

  const fetchUsers = async () => {
    try {
      const response = await fetch("https://haske.online:8080/api/verification/get-users");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleApprove = async (userId) => {
    try {
      const response = await fetch(`https://haske.online:8080/api/verification/approve-user/${userId}/`, {
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

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div>
      <h2>Admin Page</h2>

      {/* Display Notification */}
      {notification && <p>{notification}</p>}

      {users.length === 0 ? (
        <p>No users awaiting verification.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Institution</th>
              <th>Institution Address</th>
              <th>Role</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.institution_name}</td>
                <td>{user.institution_address}</td>
                <td>{user.role}</td>
                <td>{user.email}</td>
                <td>
                  <button onClick={() => handleApprove(user.id)}>Approve</button>
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
