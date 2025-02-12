import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import "./LandingPage.css";
import logo from "../assets/haske.png";
import mailabLogo from "../assets/mailablogo.png";
import sponsor1 from "../assets/sponsor1.png";
import sponsor2 from "../assets/sponsor2.png";
import sponsor3 from "../assets/sponsor3.png";
import sponsor4 from "../assets/sponsor4.png";
import sponsor5 from "../assets/sponsor5.png";
import AnimatedSVG from "../assets/animated.svg";
import BackgroundVideo from "../assets/background-video.mp4";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="landing-footer">
      <div className="footer-content">
        <div className="footer-left">
          <p>&copy; {currentYear} Haske</p>
        </div>
        <div className="footer-middle">
          <a href="mailto:haske@mailab.io" className="contact-us-link">
            Contact Us
          </a>
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

const Sponsors = () => (
  <motion.section 
    className="sponsors-section"
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    transition={{ duration: 1 }}
    viewport={{ once: true }}
  >
    <h3 className="sponsors-title">Our Partners & Sponsors</h3>
    <p className="sponsors-description">
      We are proud to collaborate with leading organizations and institutions supporting our mission.
    </p>
    <div className="sponsors-logos">
      {[sponsor1, sponsor2, sponsor3, sponsor4, sponsor5].map((sponsor, index) => (
        <motion.div 
          key={index} 
          className="sponsor-logo-wrapper"
          whileHover={{ scale: 1.1 }}
        >
          <img src={sponsor} alt={`Sponsor ${index + 1}`} className="sponsor-logo" />
        </motion.div>
      ))}
    </div>
  </motion.section>
);

function LandingPage() {
  const location = useLocation();
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (location.state?.message) {
      setMessage(location.state.message);
      setTimeout(() => {
        setMessage(null);
      }, 1000);
    }
  }, [location]);

  return (
    <div className="landing-container">
      {message && <div className="message-popup"><p>{message}</p></div>}

      <motion.header 
        className="landing-header"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <img src={logo} alt="Haske" className="logo" />
        <nav className="nav-links">
          {["register", "signin", "about-us", "publications"].map((path, index) => (
            <Link key={index} to={`/${path}`} className="nav-button">
              {path.replace("-", " ").toUpperCase()}
            </Link>
          ))}
        </nav>
      </motion.header>

      <div className="background-video">
        <video autoPlay loop muted>
          <source src={BackgroundVideo} type="video/mp4" />
        </video>
      </div>

      <motion.main 
        className="landing-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
      >
        <h2>Welcome to Haske</h2>
        <p className="landing-subtitle">
          Open-source Picture Archiving Communication System
        </p>
        <motion.div className="action-buttons" whileHover={{ scale: 1.1 }}>
          <Link to="/register" className="action-button">Register</Link>
          <Link to="/signin" className="action-button">Sign In</Link>
        </motion.div>
      </motion.main>

      <motion.div className="animated-svg" whileHover={{ scale: 1.2 }}>
        <img src={AnimatedSVG} alt="Animated Graphic" />
      </motion.div>

      <Sponsors />
      <Footer />
    </div>
  );
}

export default LandingPage;
