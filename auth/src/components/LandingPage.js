// src/components/LandingPage.js
import React from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css";
import logo from "../assets/haske.png";

const Footer = () => {
  const currentYear = new Date().getFullYear(); // Automatically fetch the current year


function LandingPage() {
  return (
    <div className="landing-container">
      <header className="landing-header">
      <img src={logo} alt="Haske" className="logo" />
        <nav className="nav-links">
          <Link to="/register" className="nav-button">Register</Link>
          <Link to="/signin" className="nav-button">Sign In</Link>
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
      
    <footer className="landing-footer">
      <p>&copy; {currentYear} Haske. Powered by.</p>
      <div>
        <a href="https://mailab.io" target="_blank" rel="noopener noreferrer">
          <img 
            src="/assets/mailablogo.png" 
            alt="MAILAB Logo" 
            className="mailab-logo" 
          />
        </a>
      </div>
    </footer>

              
    </div>
  );
}

export default LandingPage;
