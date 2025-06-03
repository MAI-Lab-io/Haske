import React, { useState, useEffect } from "react";
import { auth } from "../firebaseConfig";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { motion } from "framer-motion";
import "./SignIn.css";
import logo from "../assets/haske.png";
import aiWebBackground from "../assets/ai-web-background.png";
import { logAction } from "../utils/analytics"; // Import the analytics utility

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        logAction('User Auto-Sign In', { method: 'session' }, user);
        navigate("/patient-details");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Email and password are required.");
      logAction('Sign In Attempt', { status: 'failed', reason: 'missing_fields', email }, null);
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    // Track sign in attempt
    logAction('Sign In Attempt', { email }, null);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Track successful sign in
      logAction('User Sign In', { 
        method: 'email',
        provider: user.providerData[0]?.providerId 
      }, user);
      
      navigate("/patient-details");
    } catch (error) {
      const errorMessage = "Invalid email or password. Please try again.";
      setError(errorMessage);
      
      // Track failed sign in
      logAction('Sign In Failed', { 
        email,
        errorCode: error.code,
        errorMessage: error.message 
      }, null);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setError("Please enter your email address first.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent. Please check your inbox.");
      setError(null);
      
      // Track password reset request
      logAction('Password Reset Requested', { email }, null);
    } catch (error) {
      setError(`Error sending reset email: ${error.message}`);
      
      // Track failed password reset
      logAction('Password Reset Failed', { 
        email,
        errorCode: error.code,
        errorMessage: error.message 
      }, null);
    }
  };

  return (
    <div className="signin-container">
      <div className="left-column">
        <div
          className="background-image-wrapper"
          style={{
            backgroundImage: `url(${aiWebBackground})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        ></div>
      </div>
      <div className="right-column">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="form-wrapper"
        >
          <img src={logo} alt="Logo" className="logo" />
          <h2 className="form-title">Welcome to Haske!</h2>
          <p className="form-subtitle">Please sign in to access scans</p>

          <form className="signin-form" onSubmit={handleSignIn}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
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
                onClick={() => {
                  setShowPassword((prev) => !prev);
                  logAction('Password Visibility Toggled', { visible: !showPassword }, null);
                }}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="signin-button"
              disabled={loading}
            >
              {loading ? <div className="spinner"></div> : "Sign In"}
            </motion.button>
          </form>

          {error && <p className="signin-error">{error}</p>}
          {message && <p className="signin-message">{message}</p>}

          <p className="signin-footer">
            New on our platform? <a href="/register">Create an account</a>
          </p>
          <p 
            className="forgot-password-link" 
            onClick={handlePasswordReset}
          >
            Forgot Password?
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default SignIn;
