import React from "react";
import "./VerifyWaiting.css"; // Add styles for Verify Waiting Page

const VerifyWaiting = () => {
  return (
    <div className="verify-waiting-container">
      <div className="verify-waiting-message">
        <h1>Thank You!</h1>
        <p>Your verification request has been submitted. We'll reach out to you shortly via email.</p>
        <p className="signature">- Haske</p>
      </div>
    </div>
  );
};

export default VerifyWaiting;
