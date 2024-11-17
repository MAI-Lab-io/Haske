// src/components/SignIn.js
import React, { useState } from "react";
import { auth } from "../firebaseConfig";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "./SignIn.css"; // Import CSS file for styles

function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [resetEmail, setResetEmail] = useState(""); // Email for password reset
  const [isResetMode, setIsResetMode] = useState(false); // Toggle reset mode
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/patient-details"); // Redirect to protected content
    } catch (error) {
      setError(error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate("/patient-details"); // Redirect to protected content
    } catch (error) {
      setError(error.message);
    }
  };

  const handlePasswordReset = async () => {
    if (!resetEmail) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setError(null);
      alert("Password reset email sent! Please check your inbox.");
      setIsResetMode(false); // Switch back to sign-in form
    } catch (error) {
      setError("Error sending password reset email: " + error.message);
    }
  };

  return (
    <div className="signin-container">
      <div className="form-wrapper">
        <h2 className="form-title">{isResetMode ? "Reset Password" : "Sign In"}</h2>
        
        {isResetMode ? (
          // Password reset form
          <div>
            <input
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="signin-input"
            />
            <button onClick={handlePasswordReset} className="signin-button">Reset Password</button>
            <p onClick={() => setIsResetMode(false)} className="toggle-form-link">
              Back to Sign In
            </p>
          </div>
        ) : (
          // Sign In form
          <form className="signin-form" onSubmit={handleSignIn}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="signin-input"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="signin-input"
            />
            <button type="submit" className="signin-button">Sign In</button>
            <p onClick={() => setIsResetMode(true)} className="toggle-form-link">
              Forgot Password?
            </p>
          </form>
        )}

        {error && <p className="signin-error">{error}</p>}

        {/* Google Sign-In Button */}
        <button className="google-signin-button" onClick={handleGoogleSignIn}>
          Sign in with Google
        </button>

        <p className="signin-footer">
          Don't have an account? <a href="/register">Register</a>
        </p>
      </div>
    </div>
  );
}

export default SignIn;
