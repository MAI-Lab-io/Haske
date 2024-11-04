// src/App.js
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import SignIn from "./components/SignIn";
import Register from "./components/Register";
import ProtectedContent from "./components/ProtectedContent";
import LandingPage from "./components/LandingPage"; // Import LandingPage
import { auth } from "./firebaseConfig";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} /> {/* LandingPage as the default route */}
        <Route path="/signin" element={user ? <Navigate to="/patient-details" replace /> : <SignIn />} />
        <Route path="/register" element={user ? <Navigate to="/patient-details" replace /> : <Register />} />
        <Route
          path="/patient-details"
          element={user ? <ProtectedContent /> : <Navigate to="/" replace />}
        />
      </Routes>
    </Router>
  );
}

export default App;
