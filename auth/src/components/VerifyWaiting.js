import React from "react";
import { useNavigate } from "react-router-dom";
import "./VerifyWaiting.css"; // Import styles for the Verify Waiting Page

const VerifyWaiting = () => {
  const navigate = useNavigate();

  return (
    <div className="verify-waiting-container">
      <div className="verify-waiting-card">
        <h1 className="verify-title">Thank You!</h1>
        <p className="verify-text">
          Your registration has been successfully completed.
          <br />
          We'll get back to you shortly via email.
        </p>
        <p className="verify-signature">— Haske Team</p>
        <button className="home-button" onClick={() => navigate("/")}>Return to Main Page</button>
      </div>
    </div>
  );
};

export default VerifyWaiting;
