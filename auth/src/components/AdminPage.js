import React, { useEffect, useState } from "react";

const AdminPage = () => {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const response = await fetch("https://haske.onrender.com/api/verification/get-users/");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleApprove = async (userId) => {
    try {
      const response = await fetch(`https://haske.onrender.com/api/verification/approve-user/${userId}/`, {
        method: "POST",
      });
      const result = await response.json();
      alert(result.message);
      fetchUsers(); // Refresh the user list
    } catch (error) {
      console.error("Error approving user:", error);
      alert("An error occurred. Please try again.");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div>
      <h2>Admin Page</h2>
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
