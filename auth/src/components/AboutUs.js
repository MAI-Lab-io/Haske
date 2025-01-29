import React from "react";
import "./AboutUs.css";

const AboutUs = () => {
  return (
    <div className="about-us-container">
      <div className="about-us-card">
        <h1 className="about-us-title">About Us</h1>
        <p className="about-us-description">
          We are a team of passionate professionals committed to advancing
          science and technology in the field of [Your Field]. Our mission is to
          [Your Mission], and we strive to make a positive impact on society
          through our research, projects, and collaborations.
        </p>
        <p className="about-us-mission">
          <strong>Our Mission:</strong> To drive innovation and excellence in
          [specific mission statement].
        </p>
        <p className="about-us-values">
          <strong>Our Values:</strong> Integrity, Collaboration, Innovation, and
          Excellence.
        </p>
      </div>
    </div>
  );
};

export default AboutUs;
