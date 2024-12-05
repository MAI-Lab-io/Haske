// src/components/LandingPage.js
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./LandingPage.css";
import logo from "../assets/haske.png";
import mailabLogo from "../assets/mailablogo.png";

// Footer Component
const Footer = () => {
  const currentYear = new Date().getFullYear(); // Automatically fetch the current year
  return (
    <footer className="landing-footer">
      <div className="footer-content">
        <div className="footer-left">
          <p>&copy; {currentYear} Haske</p>
        </div>
        <div className="footer-right">
          <span>Powered by</span>
          <a href="https://mailab.io" target="_blank" rel="noopener noreferrer" className="mailab-link">
            <img src={mailabLogo} alt="MAILAB Logo" className="mailab-logo" />
          </a>
        </div>
      </div>
    </footer>
  );
};

// LandingPage Component
function LandingPage() {
  const location = useLocation();
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (location.state?.message) {
      setMessage(location.state.message); // Set the message if it exists in the state
    }
  }, [location]);

  return (
    <div className="landing-container">
      {/* Conditional message popup */}
      {message && (
        <div className="message-popup">
          <p>{message}</p>
        </div>
      )}

      <header className="landing-header">
        <img src={logo} alt="Haske" className="logo" />
        <nav className="nav-links">
          <Link to="/verification" className="nav-button">
            Verification
          </Link>
          <Link to="/register" className="nav-button">
            Register
          </Link>
          <Link to="/signin" className="nav-button">
            Sign In
          </Link>
        </nav>
      </header>

      <main className="landing-content">
        <h2>Welcome to Haske</h2>
        <p className="landing-subtitle">
          Open-source Picture Archiving Communication System
        </p>
        <div className="action-buttons">
          <Link to="/verification" className="action-button">
            Verification
          </Link>
          <Link to="/register" className="action-button">
            Register
          </Link>
          <Link to="/signin" className="action-button">
            Sign In
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default LandingPage;
