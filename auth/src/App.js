import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import SignIn from "./components/SignIn";
import Register from "./components/Register";
import ProtectedContent from "./components/ProtectedContent";
import LandingPage from "./components/LandingPage";
import VerifyPage from "./components/VerifyPage";
import AdminLayout from "./components/AdminLayout";
import AboutUs from "./components/AboutUs";
import Publications from "./components/Publications";
import Dashboard from "./components/Dashboard";
import ManageUsers from "./components/ManageUsers";
import Analytics from "./components/Analytics";
import Settings from "./components/Settings";
import { auth } from "./firebaseConfig"; // Firebase auth import
import VerifyWaiting from "./components/VerifyWaiting";
import { Helmet } from "react-helmet";
import Landing from "./screens/Landing.jsx";

const App = () => {
const [user, setUser] = useState(null);
const [loading, setLoading] = useState(true); // Add a loading state

useEffect(() => {
  const unsubscribe = auth.onAuthStateChanged((user) => {
    console.log("User state changed:", user);
    setUser(user);
    setLoading(false); // Set loading to false after auth state is checked
  });

  return () => unsubscribe();
}, []);

if (loading) {
  return <div>Loading...</div>; // Show a loading message or spinner
}

return (
  <>
    <Helmet>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
      <link href="https://fonts.googleapis.com/css2?family=Khula:wght@400;600;800&display=swap" rel="stylesheet" />
    </Helmet>
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/landing" element={<Landing />} />
        <Route
          path="/signin"
          element={user ? <Navigate to="/patient-details" replace /> : <SignIn />}
        />
        <Route path="/verification" element={<VerifyPage />} />
        <Route path="/verify-waiting" element={<VerifyWaiting />} />
        <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<ManageUsers />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="/register" element={<Register />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/publications" element={<Publications />} />
        <Route
          path="/patient-details"
          element={user ? <ProtectedContent /> : <Navigate to="/" replace />}
        />
      </Routes>
    </Router>
  </>
);
};

export default App;
