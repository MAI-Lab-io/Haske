import React, { useState } from "react";
import { auth } from "../firebaseConfig";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "./SignIn.css";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Eye icons for password visibility toggle

function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null); // For success messages like password reset email sent
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Handle user sign-in
  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null); // Clear previous errors
    setMessage(null); // Clear previous success messages

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/patient-details"); // Redirect to protected content
    } catch (error) {
      console.error("Full error:", error); // Log full error for debugging
      setLoading(false);

      // Handle specific error cases
      if (error.code === "auth/wrong-password") {
        setError("Oops! The password you entered is incorrect. Please try again.");
      } else if (error.code === "auth/user-not-found") {
        setError("No account found with this email. Please check the email or register.");
      } else {
        setError("An error occurred. Please try again later.");
      }
    }
  };

  // Handle password reset
  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email address to reset your password.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent! Please check your inbox.");
      setError(null);
    } catch (error) {
      console.error("Forgot password error:", error);

      if (error.code === "auth/user-not-found") {
        setError("No account found with this email.");
      } else {
        setError("Unable to send password reset email. Please try again later.");
      }
    }
  };

  // Handle Google sign-in and verification check
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const email = user.email;

      // Check user verification status from your backend API
      const response = await fetch(`/api/check-user-verification?email=${email}`);
      const data = await response.json();

      if (!data.isVerified) {
        setError("Your account is not verified. Please contact the admin for verification.");
        setLoading(false);
        return; // Stop the sign-in process if not verified
      }

      // Proceed if the user is verified
      navigate("/patient-details"); // Redirect to protected content
    } catch (error) {
      console.error("Google sign-in error:", error);
      setLoading(false);
      setError(error.message);
    }
  };

  return (
    <div className="signin-container">
      <div className="form-wrapper">
        <h2 className="form-title">Sign In</h2>

        <form className="signin-form" onSubmit={handleSignIn}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="signin-input"
          />

          <div className="password-input-container">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="signin-input"
            />
            <button
              type="button"
              className="password-toggle-button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <button type="submit" className="signin-button" disabled={loading}>
            {loading ? <div className="spinner"></div> : "Sign In"}
          </button>
        </form>

        {error && <p className="signin-error">{error}</p>}
        {message && <p className="signin-message">{message}</p>}

        <button className="google-signin-button" onClick={handleGoogleSignIn} disabled={loading}>
          {loading ? <div className="spinner"></div> : "Sign in with Google"}
        </button>

        <p className="signin-footer">
          Don't have an account? <a href="/register">Register</a>
        </p>

        <p className="forgot-password-link" onClick={handleForgotPassword}>
          Forgot Password?
        </p>
      </div>
    </div>
  );
}

export default SignIn;
