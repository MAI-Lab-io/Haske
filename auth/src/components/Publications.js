import React from "react";
import "./Publications.css";

const publications = [
  {
    title: "Research Paper Title 1",
    description: "An insightful paper on [Topic]. Published in [Journal].",
    link: "https://link-to-publication.com",
  },
  {
    title: "Conference Presentation",
    description: "Haske: An Open PACS Platform Integrating AI for Affordable Medical Image Archiving and Diagnosis in Resource-Constrained Settings",
    link: "https://link-to-conference.com",
  },
  // Add more publications or conference details here
];

const Publications = () => {
  return (
    <div className="publications-container">
      <div className="publications-card">
        <h1 className="publications-title">Publications & Conferences</h1>
        <div className="publications-list">
          {publications.map((pub, index) => (
            <div key={index} className="publication-item">
              <h3 className="publication-title">{pub.title}</h3>
              <p className="publication-description">{pub.description}</p>
              <a href={pub.link} target="_blank" rel="noopener noreferrer" className="publication-link">
                Read More
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Publications;
