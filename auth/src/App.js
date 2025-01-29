import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import SignIn from "./components/SignIn";
import Register from "./components/Register";
import ProtectedContent from "./components/ProtectedContent";
import LandingPage from "./components/LandingPage";
import VerifyPage from "./components/VerifyPage";
import AdminPage from "./components/AdminPage";
import { auth } from "./firebaseConfig"; // Firebase auth import
import VerifyWaiting from "./components/VerifyWaiting";

const App = () => {
const [user, setUser] = useState(null);
const [loading, setLoading] = useState(true); // Add a loading state

useEffect(() => {
  const unsubscribe = auth.onAuthStateChanged((user) => {
    setUser(user);
    setLoading(false); // Set loading to false after auth state is checked
  });

  return () => unsubscribe();
}, []);

if (loading) {
  return <div>Loading...</div>; // Show a loading message or spinner
}

return (
  <Router>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/signin"
        element={user ? <Navigate to="/patient-details" replace /> : <SignIn />}
      />
      <Route path="/verification" element={<VerifyPage />} />
      <Route path="/verify-waiting" element={<VerifyWaiting />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/patient-details"
        element={user ? <ProtectedContent /> : <Navigate to="/" replace />}
      />
    </Routes>
  </Router>
);
};

export default App;
