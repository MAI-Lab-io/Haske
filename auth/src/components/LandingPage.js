import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./LandingPage.css";
import logo from "../assets/haske.png";
import mailabLogo from "../assets/mailablogo.png";
import sponsor1 from "../assets/sponsor1.png";
import sponsor2 from "../assets/sponsor2.png"; 
import sponsor3 from "../assets/sponsor3.png"; 
import sponsor4 from "../assets/sponsor4.png";
import sponsor5 from "../assets/sponsor5.png";


// Footer Component
// Footer Component
const Footer = () => {
  const currentYear = new Date().getFullYear(); // Automatically fetch the current year
  return (
    <footer className="landing-footer">
      <div className="footer-content">
        <div className="footer-left">
          <p>&copy; {currentYear} Haske</p>
        </div>
        <div className="footer-middle">
          <a
            href="mailto:haske@mailab.io"  // Replace with your company's Gmail address
            className="contact-us-link"
          >
            Contact Us
          </a>
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


// Sponsors Section with improved structure
const Sponsors = () => (
  <section className="sponsors-section">
    <h3 className="sponsors-title">Our Partners & Sponsors</h3>
    <p className="sponsors-description">
      We are proud to collaborate with leading organizations and institutions supporting our mission.
    </p>
   <div className="sponsors-logos">
  <div className="sponsor-logo-wrapper">
    <a href="https://www.med.upenn.edu/globalhealth/" target="_blank" rel="noopener noreferrer">
      <img src={sponsor1} alt="Upenn" className="sponsor-logo" />
    </a>
  </div>
  <div className="sponsor-logo-wrapper">
    <a href="https://aws.amazon.com/" target="_blank" rel="noopener noreferrer">
      <img src={sponsor2} alt="AWS" className="sponsor-logo" />
    </a>
  </div>
  <div className="sponsor-logo-wrapper">
    <a href="https://crestviewradiology.org/" target="_blank" rel="noopener noreferrer">
      <img src={sponsor3} alt="CrestView" className="sponsor-logo" />
    </a>
  </div>
  <div className="sponsor-logo-wrapper">
    <a href="https://lacunafund.org/" target="_blank" rel="noopener noreferrer">
      <img src={sponsor4} alt="Lacuna" className="sponsor-logo" />
    </a>
  </div>
  <div className="sponsor-logo-wrapper-black">
    <a href="https://airg.nitda.gov.ng/" target="_blank" rel="noopener noreferrer">
      <img src={sponsor5} alt="NAIRS" className="sponsor-logo" />
    </a>
  </div>
</div>

  </section>
);


// LandingPage Component
function LandingPage() {
  const location = useLocation();
  const [message, setMessage] = useState("");

  useEffect(() => {
   if (location.state?.message) {
      setMessage(location.state.message);
      // Hide the message after 3 seconds
      setTimeout(() => {
        setMessage(null);
      }, 1000);
    }
  },  [location]);

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
        <Link to="/about-us" className="nav-button">
            About Us
          </Link>
        <Link to="/publications" className="nav-button">
            Publications
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
