// src/components/LandingPage.js
import React from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css";
import logo from "../assets/haske.png";
import mailabLogo from "../assets/mailablogo.png"; // Ensure this path is correct

// Footer Component
const Footer = () => {
  const currentYear = new Date().getFullYear(); // Automatically fetch the current year
  return (
    <footer className="landing-footer">
      <p>
        &copy; {currentYear} Haske. Powered by{" "}
        <a href="https://mailab.io" target="_blank" rel="noopener noreferrer" className="mailab-link">
          <img src={mailabLogo} alt="MAILAB Logo" className="mailab-logo" />
        </a>
      </p>
    </footer>
  );
};

// LandingPage Component
function LandingPage() {
  return (
    <div className="landing-container">
      <header className="landing-header">
        <img src={logo} alt="Haske" className="logo" />
        <nav className="nav-links">
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
