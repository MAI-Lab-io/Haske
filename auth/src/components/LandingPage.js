// src/components/LandingPage.js
import React from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css";
import logo from "../assets/haske.png";
import mailabLogo from "../assets/mailablogo.png";
// import sponsor1 from "../assets/sponsor1.png"; // Replace with actual sponsor logos
// import sponsor2 from "../assets/sponsor2.png";
// import sponsor3 from "../assets/sponsor3.png";

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

      {/* Add Sponsors Section */}
      //<Sponsors />

      <Footer />
    </div>
  );
}

export default LandingPage;
