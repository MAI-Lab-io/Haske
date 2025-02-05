import React, { useState, useEffect } from "react";
import { auth } from "../firebaseConfig";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./SignIn.css";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Redirect user if already authenticated
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) navigate("/patient-details");
    });

    return () => unsubscribe();
  }, [navigate]);

  // Function to check user verification and status from backend
  const checkUserStatus = async (email) => {
    try {
      const response = await fetch(
        `https://haske.online:8080/api/verification/check-verification?email=${email}`
      );
      
      if (!response.ok) {
        if (response.status === 404) {
          setError("No account found. Redirecting to registration.");
          alert("No account found. Click OK to register.");
          navigate("/register");
        } else {
          setError("Server error. Please try again later.");
        }
        setLoading(false);
        return false;
      }

      const data = await response.json();

      if (!data.isVerified) {
        setError("Your profile has not been approved. Please complete your profile.");
        alert("Your profile is incomplete or pending approval. Click OK to complete.");
        navigate("/verification");
      } else if (data.isDeactivated) {
        setError("Your account has been deactivated. Please contact support.");
        alert("Your account is deactivated. Contact support for assistance.");
        navigate("/");
      } else {
        return true;
      }

      setLoading(false);
      await signOut(auth);
      return false;
    } catch (error) {
      console.error("User status check error:", error);
      setError("Network error. Please try again.");
      setLoading(false);
      return false;
    }
  };

  // Handle user sign-in
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
    const isValidUser = await checkUserStatus(email);
    
    if (!isValidUser) return; // Prevent further login attempts if not verified

    // Log the sign-in action to the backend
    await logUserAction(email, "user signed in");

    // Sign the user in
    await signInWithEmailAndPassword(auth, email, password);
    navigate("/patient-details");
  } catch (error) {
    console.error("Sign-in error:", error);

    if (error.code === "auth/user-not-found") {
      setError("No account found. Redirecting to registration.");
      alert("No account found. Click OK to register.");
      navigate("/register");
    } else if (error.code === "auth/wrong-password") {
      setError("Incorrect password. Please try again.");
    } else {
      setError("An error occurred. Please try again.");
    }
  } finally {
    setLoading(false);
  }
};

// Function to log user actions
const logUserAction = async (email, action) => {
  try {
    const response = await fetch('https://haske.online:8080/api/verification/log-action', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, action }),
    });

    if (!response.ok) {
      throw new Error('Failed to log the action');
    }

    console.log('User action logged successfully');
  } catch (error) {
    console.error('Error logging user action:', error);
  }
};


  // Handle password reset
  const handleForgotPassword = async () => {
    if (!email) {
      setError("Enter your email to reset your password.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent! Check your inbox.");
    } catch (error) {
      console.error("Forgot password error:", error);
      setError(error.code === "auth/user-not-found"
        ? "No account found with this email."
        : "Unable to send reset email. Try again later.");
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
              onClick={() => setShowPassword((prev) => !prev)}
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

        <p className="signin-footer">
          Don't have an account? <a href="/register">Register</a>
        </p>

        <p className="forgot-password-link" onClick={handleForgotPassword}>
          Forgot Password?
        </p>
      </div>
    </div>
  );
};

export default SignIn;
