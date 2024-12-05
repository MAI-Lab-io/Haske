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

  // Check user verification status from the backend
  const checkUserVerification = async (email) => {
    try {
      const response = await fetch(`https://haske.online:8080/api/verification/check-verification?email=${email}`);
      const data = await response.json();

      if (!data.isVerified) {
        setError("Your account is not verified. Please kindly go ahead to verify at the Home page.");
        setLoading(false);
        return false; // User is not verified
      }
      return true; // User is verified
    } catch (error) {
      console.error("Verification check error:", error);
      setError("An error occurred while verifying your account. Please try again later.");
      setLoading(false);
      return false; // Treat as unverified in case of error
    }
  };

  // Handle user sign-in
  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      // Check if the user is verified before signing in
      const isVerified = await checkUserVerification(email);
      if (!isVerified) return;

      // Proceed with Firebase authentication
      await signInWithEmailAndPassword(auth, email, password);
      setLoading(false);
      navigate("/patient-details"); // Redirect to protected content
    } catch (error) {
      console.error("Sign-in error:", error);
      setLoading(false);

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

const handleGoogleSignIn = async () => {
  const provider = new GoogleAuthProvider();
  try {
    // Perform Google sign-in
    const userCredential = await signInWithPopup(auth, provider);

    // Extract email from the userCredential
    const email = userCredential.user.email;

    console.log("Google sign-in successful, checking verification for:", email);

    // Verify the user after sign-in
    const isUserVerified = await checkUserVerification(email);

    if (!isUserVerified) {
      // If the user is not verified, return without further action
      return;
    }

    // Proceed to patient details page if verified
    alert("Google sign-in successful!");
    navigate("/patient-details");
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    setError("Error with Google sign-in: " + error.message);
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
