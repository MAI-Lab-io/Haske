import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebaseConfig";
import "./AdminPage.css";
import { FaTrash, FaLock, FaUnlock } from "react-icons/fa";

const AdminPage = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [notification, setNotification] = useState("");
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
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
    checkAdminStatus();
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      const response = await fetch("https://haske.online:8080/api/verification/get-users");
      const data = await response.json();
      setUsers(data);
      setFilteredUsers(data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    } catch (error) {
      console.error("Error fetching users:", error);
      setNotification("Failed to load users. Please try again.");
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
      </aside>
      <main className="admin-content">
        <header className="admin-header">
          <h1>User Management</h1>
        </header>
        {notification && <div className="notification">{notification}</div>}
      </main>
    </div>
  );
};

export default AdminPage;
