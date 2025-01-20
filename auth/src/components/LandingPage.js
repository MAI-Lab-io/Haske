// src/components/LandingPage.js
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./LandingPage.css";
import logo from "../assets/haske.png";
import mailabLogo from "../assets/mailablogo.png";
import sponsor1 from "../assets/sponsor1.png";
import sponsor2 from "../assets/sponsor2.png"; 
import sponsor3 from "../assets/sponsor3.png"; 
import sponsor4 from "../assets/sponsor4.png";

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
          <a
            href="https://mailab.io"
            target="_blank"
            rel="noopener noreferrer"
            className="mailab-link"
          >
            <img src={mailabLogo} alt="MAILAB Logo" className="mailab-logo" />
          </a>
        </div>
      </div>
    </footer>
  );
};

// Sponsors Section
const Sponsors = () => (
  <section className="sponsors-section">
    <h3 className="sponsors-title">Our Partners & Sponsors</h3>
    <div className="sponsors-logos">
      <img src={sponsor1} alt="Sponsor 1" className="sponsor-logo" />
      <img src={sponsor2} alt="Sponsor 2" className="sponsor-logo" />
      <img src={sponsor3} alt="Sponsor 3" className="sponsor-logo" />
      {/* Add more sponsor logos as needed */}
    </div>
  </section>
);

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

      {/* Sponsors Section */}
      <Sponsors />

      {/* Footer Section */}
      <Footer />
    </div>
  );
}

export default LandingPage;
