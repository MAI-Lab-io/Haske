// src/components/LandingPage.js
import React from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css";
import logo from "../assets/haske.png"


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
        <p>&copy; 2024 MyApp. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default LandingPage;
