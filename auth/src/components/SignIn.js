import React, { useState } from "react";
import { auth } from "../firebaseConfig";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "./SignIn.css";
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Eye icons for password visibility toggle

function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

const handleSignIn = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    await signInWithEmailAndPassword(auth, email, password);
    navigate("/patient-details"); // Redirect to protected content
  } catch (error) {
  console.error("Full error:", error); // Log full error for detailed debugging
  setLoading(false);

  if (error.code === "auth/wrong-password") {
    setError("Oops! The password you entered is incorrect. Please try again.");
  } else if (error.code === "auth/user-not-found") {
    setError("No account found with this email. Please check the email or register.");
  } else if (error.code === "auth/invalid-credential") {
    setError("The provided credentials are invalid. Please check your email and password.");
  } else {
    setError("An error occurred. Please try again later.");
  }
}

};

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
      setLoading(true);
      await signInWithPopup(auth, provider);
      navigate("/patient-details"); // Redirect to protected content
    } catch (error) {
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
