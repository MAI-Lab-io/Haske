import React, { useState, useEffect, useRef } from "react";
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
import { logAction } from "../utils/analytics";
import { detect } from "detect-browser";
import UAParser from "ua-parser-js";

// Security thresholds
const SECURITY_CONFIG = {
  failedAttemptsThreshold: 5, // Alert after 5 failed attempts
  resetRequestsThreshold: 3, // Alert after 3 password reset requests
  timeBetweenAttempts: 30000, // 30 seconds between attempts threshold
};

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [securityCheck, setSecurityCheck] = useState(null);
  const navigate = useNavigate();
  const signInStartTime = useRef(null);
  const failedAttempts = useRef({});
  const resetRequests = useRef({});

  // Get detailed device and browser info
  const getDeviceInfo = () => {
    const browser = detect();
    const parser = new UAParser();
    const ua = parser.getResult();
    
    return {
      browser: `${browser.name} ${browser.version}`,
      os: ua.os.name,
      deviceType: ua.device.type || 'desktop',
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      cookiesEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack === '1',
      ipAddress: '', // Will be captured by backend from request headers
    };
  };

  // Check for suspicious patterns
  const checkSecurityPatterns = (email, action) => {
    const now = Date.now();
    const emailKey = email.toLowerCase();

    if (action === 'failed') {
      if (!failedAttempts.current[emailKey]) {
        failedAttempts.current[emailKey] = { count: 0, timestamps: [] };
      }

      failedAttempts.current[emailKey].count++;
      failedAttempts.current[emailKey].timestamps.push(now);

      // Check threshold
      if (failedAttempts.current[emailKey].count >= SECURITY_CONFIG.failedAttemptsThreshold) {
        logAction('Security Alert - Failed Attempts Threshold', {
          email,
          count: failedAttempts.current[emailKey].count,
          lastAttempts: failedAttempts.current[emailKey].timestamps
        }, null, getDeviceInfo());
        
        setSecurityCheck('We noticed several failed attempts. Please wait a moment or reset your password if needed.');
        return true;
      }

      // Check rapid attempts
      const recentAttempts = failedAttempts.current[emailKey].timestamps.filter(
        timestamp => now - timestamp < SECURITY_CONFIG.timeBetweenAttempts
      );
      
      if (recentAttempts.length > 2) {
        logAction('Security Alert - Rapid Attempts', {
          email,
          attemptsInPeriod: recentAttempts.length,
          timeWindow: SECURITY_CONFIG.timeBetweenAttempts
        }, null, getDeviceInfo());
        
        setSecurityCheck('Too many attempts too quickly. Please wait 30 seconds.');
        return true;
      }
    }

    if (action === 'reset') {
      if (!resetRequests.current[emailKey]) {
        resetRequests.current[emailKey] = { count: 0, timestamps: [] };
      }

      resetRequests.current[emailKey].count++;
      resetRequests.current[emailKey].timestamps.push(now);

      if (resetRequests.current[emailKey].count >= SECURITY_CONFIG.resetRequestsThreshold) {
        logAction('Security Alert - Reset Requests Threshold', {
          email,
          count: resetRequests.current[emailKey].count,
          lastRequests: resetRequests.current[emailKey].timestamps
        }, null, getDeviceInfo());
        
        setSecurityCheck('Multiple password reset requests detected. Check your email or contact support.');
        return true;
      }
    }

    return false;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        logAction('User Auto-Sign In', { 
          method: 'session',
          sessionDuration: user.metadata.lastSignInTime 
            ? (new Date() - new Date(user.metadata.lastSignInTime)) / 1000 
            : 'first_time'
        }, user, getDeviceInfo());
        navigate("/patient-details");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Email and password are required.");
      logAction('Sign In Attempt', { 
        status: 'failed', 
        reason: 'missing_fields', 
        email 
      }, null, getDeviceInfo());
      return;
    }

    // Check security patterns before proceeding
    if (checkSecurityPatterns(email, 'failed')) {
      setError("Security check triggered. Please follow the instructions.");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);
    setSecurityCheck(null);
    signInStartTime.current = Date.now();

    // Track sign in attempt with device info
    logAction('Sign In Attempt', { 
      email,
      deviceInfo: getDeviceInfo()
    }, null);

    try {
      const startTime = Date.now();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const signInDuration = Date.now() - startTime;
      
      // Track successful sign in with performance metrics
      logAction('User Sign In', { 
        method: 'email',
        provider: user.providerData[0]?.providerId,
        signInDuration,
        authTime: user.metadata.lastSignInTime,
        isNewUser: user.metadata.creationTime === user.metadata.lastSignInTime
      }, user, getDeviceInfo());
      
      // Reset failed attempts counter on success
      const emailKey = email.toLowerCase();
      if (failedAttempts.current[emailKey]) {
        failedAttempts.current[emailKey] = { count: 0, timestamps: [] };
      }
      
      navigate("/patient-details");
    } catch (error) {
      const errorMessage = "Invalid email or password. Please try again.";
      setError(errorMessage);
      
      // Track failed sign in with error details
      logAction('Sign In Failed', { 
        email,
        errorCode: error.code,
        errorMessage: error.message,
        failedAttempts: failedAttempts.current[email.toLowerCase()]?.count || 1,
        timeSinceLastAttempt: failedAttempts.current[email.toLowerCase()]?.timestamps.length 
          ? (Date.now() - failedAttempts.current[email.toLowerCase()].timestamps.slice(-1)[0]) / 1000 
          : 'first_attempt'
      }, null, getDeviceInfo());
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setError("Please enter your email address first.");
      return;
    }

    // Check security patterns before proceeding
    if (checkSecurityPatterns(email, 'reset')) {
      setError("Security check triggered. Please follow the instructions.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent. Please check your inbox.");
      setError(null);
      
      // Track password reset request with device info
      logAction('Password Reset Requested', { 
        email,
        resetCount: resetRequests.current[email.toLowerCase()]?.count + 1 || 1
      }, null, getDeviceInfo());
    } catch (error) {
      setError(`Error sending reset email: ${error.message}`);
      
      // Track failed password reset
      logAction('Password Reset Failed', { 
        email,
        errorCode: error.code,
        errorMessage: error.message,
        resetAttempts: resetRequests.current[email.toLowerCase()]?.count || 1
      }, null, getDeviceInfo());
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

          {securityCheck && (
            <div className="security-alert">
              <p>{securityCheck}</p>
            </div>
          )}

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
                  logAction('Password Visibility Toggled', { 
                    visible: !showPassword 
                  }, null, getDeviceInfo());
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
