import React, { useState, useEffect } from "react";
import { auth } from "../firebaseConfig";
import { signInWithEmailAndPassword, sendPasswordResetEmail, signOut, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "./SignIn.css";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Eye icons for password visibility toggle

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null); // For success messages like password reset email sent
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Track authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/patient-details"); // Redirect to patient details if the user is logged in
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Function to check user verification and deactivation status from the backend
  const checkUserStatus = async (email) => {
    try {
        const response = await fetch(`https://haske.online:8080/api/verification/check-verification?email=${email}`);
        const data = await response.json();

        if (data.notRegistered) {
            setError("No account found. Redirecting to registration.");
            alert("No account found with this email. Please click OK to register.");
            navigate("/register");
            setLoading(false);
            await signOut(auth);
            return false;
        }

        if (!data.isVerified) {
            setError("Your profile has not been completed/approved. Please complete your profile.");
            alert("Your profile has not been completed/approved. Please click OK to complete your profile.");
            navigate("/verification");
            setLoading(false);
            await signOut(auth);
            return false;
        }

        if (data.isDeactivated) {
            setError("Your account has been deactivated. Please contact support.");
            alert("Your account has been deactivated. You cannot access this page.");
            navigate("/register");
            setLoading(false);
            await signOut(auth);
            return false;
        }

        return true;
    } catch (error) {
        console.error("User status check error:", error);
        setError("An error occurred while checking your account status. Please try again later.");
        setLoading(false);
        return false;
    }
};

  // Handle user sign-in
  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const isValidUser = await checkUserStatus(email);
      if (!isValidUser) return;

      await signInWithEmailAndPassword(auth, email, password);
      setLoading(false);
      navigate("/patient-details"); // Redirect to protected content
    } catch (error) {
      console.error("Sign-in error:", error);
      setLoading(false);

      // Handling error messages based on error codes
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
