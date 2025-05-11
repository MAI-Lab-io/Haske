import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { auth } from "./firebaseConfig"; // Firebase auth import
import { Helmet } from "react-helmet";

// Components
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
import Institutions from "./components/Institutions";
import Models from "./components/Models";
import Analytics from "./components/Analytics";
import Settings from "./components/Settings";
import VerifyWaiting from "./components/VerifyWaiting";
import Landing from "./screens/Landing.jsx";
import AIAnalysis from "./components/AIAnalysis";

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  let timeout;

  useEffect(() => {
    // Track Firebase auth state
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log("User state changed:", user);
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Function to log out user after inactivity
  const logoutUser = () => {
    console.log("User inactive for 5 minutes. Logging out...");
    auth.signOut();
    setUser(null);
  };

  // Reset timer on user activity
  const resetTimer = () => {
    clearTimeout(timeout);
    timeout = setTimeout(logoutUser, 300000); // 5 minutes (300,000ms)
  };

  useEffect(() => {
    const activityEvents = ["mousemove", "keydown", "click", "scroll"];
    activityEvents.forEach((event) => window.addEventListener(event, resetTimer));

    resetTimer(); // Start timer

    return () => {
      activityEvents.forEach((event) => window.removeEventListener(event, resetTimer));
      clearTimeout(timeout);
    };
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Helmet>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600;800&display=swap"
          rel="stylesheet"
        />
      </Helmet>
      
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/signin" element={user ? <Navigate to="/patient-details" replace /> : <SignIn />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verification" element={<VerifyPage />} />
          <Route path="/verify-waiting" element={<VerifyWaiting />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/publications" element={<Publications />} />
          <Route path="/haske-ai" element={<AIAnalysis />} />
          <Route path="/patient-details" element={user ? <ProtectedContent /> : <Navigate to="/" replace />} />

          {/* Admin Routes */}
          <Route path="/admin/*" element={user ? <AdminLayout /> : <Navigate to="/" replace />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<ManageUsers />} />
            <Route path="models" element={<Models />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="institutions" element={<Institutions />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
};

export default App;
