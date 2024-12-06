import React from "react";
import "./VerifyWaiting.css"; // Import styles for the Verify Waiting Page

const VerifyWaiting = () => {
  return (
    <div className="verify-waiting-container">
      <div className="verify-waiting-card">
        <h1 className="verify-title">🎉 Thank You! 🎉</h1>
        <p className="verify-text">
          Your verification request has been received.  
          <br />
          We'll get back to you shortly via email.
        </p>
        <p className="verify-signature">— Haske Team</p>
      </div>
    </div>
  );
};

export default VerifyWaiting;
