import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import SignIn from "./components/SignIn";
import Register from "./components/Register";
import ProtectedContent from "./components/ProtectedContent";
import LandingPage from "./components/LandingPage";
import VerifyPage from "./components/VerifyPage";
import AdminPage from "./AdminPage";
import { auth } from "./firebaseConfig";

function App() {
  const [user, setUser] = useState(null);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const response = await fetch("https://your-backend.onrender.com/api/verification/is-verified/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: currentUser.email }),
          });
          const result = await response.json();
          setIsVerified(result.is_verified);
        } catch (error) {
          console.error("Error checking verification status:", error);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={user ? <Navigate to="/patient-details" replace /> : <SignIn />} />
        <Route path="/verification" element={<VerifyPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route
          path="/register"
          element={
            user ? (
              isVerified ? (
                <Register />
              ) : (
                <Navigate to="/verification" replace />
              )
            ) : (
              <Navigate to="/patient-details" replace />
            )
          }
        />
        <Route
          path="/patient-details"
          element={user ? <ProtectedContent /> : <Navigate to="/" replace />}
        />
      </Routes>
    </Router>
  );
}

export default App;
