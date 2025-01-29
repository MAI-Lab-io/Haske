import React from "react";
import "./AboutUs.css";

const AboutUs = () => {
  return (
    <div className="about-us-container">
      <div className="about-us-card">
        <h1 className="about-us-title">About Us</h1>
        <p className="about-us-description">
          We are a team of passionate professionals committed to advancing
          science and technology in medical imaging. Our mission is to
          empower medical imaging workflows through a seamless archival process
          and integration with Artificial Intelligence. We strive to make a
          positive impact on society through our research, projects, and
          collaborations.
        </p>
        <p className="about-us-mission">
          <strong>Our Mission:</strong> At Haske, our mission is to
          revolutionize the healthcare landscape in low-resource environments
          like Nigeria by providing accessible, affordable, and efficient
          medical imaging solutions. We aim to empower Radiology departments
          with AI-powered, web-based Picture Archiving and Communication
          Systems (PACS) that meet international standards. Through our
          platform, we seek to enhance diagnostic capabilities, improve
          healthcare outcomes, and promote equitable access to high-quality
          medical care across underserved regions.
        </p>
        <p className="about-us-values">
          <strong>Our Values:</strong> Integrity, Collaboration, Innovation,
          and Excellence.
        </p>
      </div>
    </div>
  );
};

export default AboutUs;
