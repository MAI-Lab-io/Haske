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
import logo from "../assets/haske.png"; // Import your logo here
import backgroundImage from "../assets/signin-image.png"; // Import your background image here

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
      if (user) navigate("/patient-details");
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/patient-details");
    } catch (error) {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signin-container">
      <div className="left-column">
        <div className="image-container">
          <img src={backgroundImage} alt="Background" className="background-image" />
        </div>
      </div>
      <div className="right-column">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="form-wrapper"
        >
          <img src={logo} alt="Logo" className="logo" />
          <h2 className="form-title">Welcome Back</h2>
          <p className="form-subtitle">Sign in to continue</p>

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
                onClick={() => setShowPassword((prev) => !prev)}
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
            Don't have an account? <a href="/register">Register</a>
          </p>
          <p className="forgot-password-link" onClick={() => sendPasswordResetEmail(auth, email)}>
            Forgot Password?
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default SignIn;
