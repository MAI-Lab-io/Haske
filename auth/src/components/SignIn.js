import React, { useState, useEffect, useRef } from "react";
import { auth } from "../firebaseConfig";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaShieldAlt } from "react-icons/fa";
import { motion } from "framer-motion";
import ReCAPTCHA from "react-google-recaptcha";
import "./SignIn.css";
import logo from "../assets/haske.png";
import aiWebBackground from "../assets/ai-web-background.png";
import { logAction } from "../utils/analytics";
import UAParser from "ua-parser-js"; // For device info parsing

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const navigate = useNavigate();
  const recaptchaRef = useRef(null);
  const signInStartTime = useRef(null);

  // Get device and browser information
  const getDeviceInfo = () => {
    const parser = new UAParser();
    const result = parser.getResult();
    return {
      browser: `${result.browser.name} ${result.browser.version}`,
      os: `${result.os.name} ${result.os.version}`,
      device: result.device.type || 'desktop',
      deviceModel: result.device.model || 'unknown',
      screenResolution: `${window.screen.width}x${window.screen.height}`,
    };
  };

  // Check for suspicious activity patterns
  const checkSuspiciousActivity = (email) => {
    // In a real app, you would check against your analytics API
    // This is a simplified version for demonstration
    const recentFailedAttempts = localStorage.getItem(`failed_attempts_${email}`) || 0;
    return recentFailedAttempts > 3; // Show CAPTCHA after 3 failed attempts
  };

  useEffect(() => {
    const storedAttempts = localStorage.getItem(`failed_attempts_${email}`);
    if (storedAttempts && parseInt(storedAttempts) >= 3) {
      setShowCaptcha(true);
    }
  }, [email]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const deviceInfo = getDeviceInfo();
        logAction('User Auto-Sign In', { 
          method: 'session',
          ...deviceInfo
        }, user);
        navigate("/patient-details");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleSignIn = async (e) => {
    e.preventDefault();
    signInStartTime.current = new Date().getTime();
    
    if (!email || !password) {
      setError("Email and password are required.");
      logAction('Sign In Attempt', { 
        status: 'failed', 
        reason: 'missing_fields', 
        email,
        ...getDeviceInfo()
      }, null);
      return;
    }

    // Check for suspicious activity
    if (checkSuspiciousActivity(email) {
      setShowCaptcha(true);
      if (!captchaToken) {
        setError("Please complete the CAPTCHA to continue");
        return;
      }
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    const deviceInfo = getDeviceInfo();
    
    // Track sign in attempt with device info
    logAction('Sign In Attempt', { 
      email,
      ...deviceInfo,
      captchaUsed: showCaptcha,
      failedAttempts: failedAttempts
    }, null);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const signInDuration = new Date().getTime() - signInStartTime.current;
      
      // Track successful sign in with timing
      logAction('User Sign In', { 
        method: 'email',
        provider: user.providerData[0]?.providerId,
        durationMs: signInDuration,
        ...deviceInfo
      }, user);
      
      // Reset failed attempts on successful login
      localStorage.removeItem(`failed_attempts_${email}`);
      setFailedAttempts(0);
      setShowCaptcha(false);
      
      navigate("/patient-details");
    } catch (error) {
      const errorMessage = "Invalid email or password. Please try again.";
      setError(errorMessage);
      
      // Increment and store failed attempts
      const attempts = failedAttempts + 1;
      setFailedAttempts(attempts);
      localStorage.setItem(`failed_attempts_${email}`, attempts);
      
      // Show CAPTCHA after 3 failed attempts
      if (attempts >= 3) {
        setShowCaptcha(true);
      }
      
      // Track failed sign in with detailed info
      logAction('Sign In Failed', { 
        email,
        errorCode: error.code,
        errorMessage: error.message,
        failedAttempts: attempts,
        ...deviceInfo,
        captchaUsed: showCaptcha
      }, null);

      // Trigger security alert if multiple failures
      if (attempts >= 5) {
        logAction('Security Alert', {
          type: 'multiple_failed_attempts',
          email,
          attempts,
          ...deviceInfo
        }, null);
      }
    } finally {
      setLoading(false);
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
      setCaptchaToken(null);
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
      
      // Track password reset request with device info
      logAction('Password Reset Requested', { 
        email,
        ...getDeviceInfo()
      }, null);
    } catch (error) {
      setError(`Error sending reset email: ${error.message}`);
      
      // Track failed password reset
      logAction('Password Reset Failed', { 
        email,
        errorCode: error.code,
        errorMessage: error.message,
        ...getDeviceInfo()
      }, null);
    }
  };

  const onCaptchaChange = (token) => {
    setCaptchaToken(token);
    setError(null);
    logAction('CAPTCHA Completed', { email }, null);
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

          {failedAttempts >= 3 && (
            <div className="security-alert">
              <FaShieldAlt className="security-icon" />
              <span>Additional verification required</span>
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
                    visible: !showPassword,
                    ...getDeviceInfo()
                  }, null);
                }}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {showCaptcha && (
              <div className="captcha-container">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
                  onChange={onCaptchaChange}
                />
              </div>
            )}

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
