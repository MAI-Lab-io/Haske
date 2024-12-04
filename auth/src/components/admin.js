import React, { useEffect, useState } from 'react';
import axios from 'axios';

function AdminPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Fetch the list of pending users
    axios.get('/admin')
      .then((response) => {
        setUsers(response.data);
      })
      .catch((error) => {
        console.error('Error fetching users:', error);
      });
  }, []);

  const handleApprove = async (index) => {
    try {
      await axios.post('/admin/approve-user', { index });
      setUsers((prevUsers) => {
        const updatedUsers = [...prevUsers];
        updatedUsers[index].approved = true;
        return updatedUsers;
      });
    } catch (error) {
      console.error('Error approving user:', error);
    }
  };

  return (
    <div>
      <h2>Admin Page</h2>
      <ul>
        {users.map((user, index) => (
          <li key={index}>
            {user.firstName} {user.lastName} - {user.role} - {user.institution}
            {user.approved ? (
              <span> (Approved)</span>
            ) : (
              <button onClick={() => handleApprove(index)}>Approve</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AdminPage;
