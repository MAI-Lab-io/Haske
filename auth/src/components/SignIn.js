// src/components/SignIn.js
import React, { useState } from "react";
import { auth } from "../firebaseConfig";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "./SignIn.css"; // Import CSS file for styles

function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const [loading, setLoading] = useState(false); // Track loading state
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true); // Set loading state
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/patient-details"); // Redirect to protected content
    } catch (error) {
      setLoading(false); // Reset loading state
      if (error.code === "auth/wrong-password") {
        setError("Oops! The password you entered is incorrect. Please try again.");
      } else if (error.code === "auth/user-not-found") {
        setError("No account found with this email. Please check the email or register.");
      } else {
        setError("An error occurred. Please try again later.");
      }
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      setLoading(true); // Set loading state
      await signInWithPopup(auth, provider);
      navigate("/patient-details"); // Redirect to protected content
    } catch (error) {
      setLoading(false); // Reset loading state
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
              type={showPassword ? "text" : "password"} // Toggle password visibility
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="signin-input"
            />
            <button
              type="button"
              className="password-toggle-button"
              onClick={() => setShowPassword(!showPassword)} // Toggle password visibility
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <button type="submit" className="signin-button" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {error && <p className="signin-error">{error}</p>}

        <button className="google-signin-button" onClick={handleGoogleSignIn} disabled={loading}>
          {loading ? "Signing in..." : "Sign in with Google"}
        </button>

        <p className="signin-footer">
          Don't have an account? <a href="/register">Register</a>
        </p>
      </div>
    </div>
  );
}

export default SignIn;
