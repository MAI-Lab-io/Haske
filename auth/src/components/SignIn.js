import React, { useState, useEffect } from "react";
import { auth } from "../firebaseConfig";
import { 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "./SignIn.css";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Eye icons for password toggle

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Track authentication state and redirect if already signed in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) navigate("/patient-details");
    });

    return () => unsubscribe();
  }, [navigate]);

  // Function to check user verification and deactivation status from backend
  const checkUserStatus = async (email) => {
    try {
      const response = await fetch(
        `https://haske.online:8080/api/verification/check-verification?email=${email}`
      );
      const data = await response.json();

      if (data.notRegistered) {
        alert("No account found. Redirecting to registration.");
        navigate("/register");
        await signOut(auth);
        return { valid: false, message: "No account found." };
      }

      if (!data.isVerified) {
        alert("Your profile is not yet verified. Redirecting to verification.");
        navigate("/verification");
        await signOut(auth);
        return { valid: false, message: "Profile not verified." };
      }

      if (data.isDeactivated) {
        alert("Your account has been deactivated. Redirecting.");
        navigate("/register");
        await signOut(auth);
        return { valid: false, message: "Account deactivated." };
      }

      return { valid: true };
    } catch (error) {
      console.error("User status check error:", error);
      return { valid: false, message: "Error checking account status." };
    }
  };

  // Handle user sign-in
  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const status = await checkUserStatus(email);
    if (!status.valid) {
      setError(status.message);
      setLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/patient-details"); // Redirect after successful login
    } catch (error) {
      console.error("Sign-in error:", error);

      switch (error.code) {
        case "auth/wrong-password":
          setError("Incorrect password. Please try again.");
          break;
        case "auth/user-not-found":
          setError("No account found with this email.");
          break;
        default:
          setError("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
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
    } catch (error) {
      console.error("Forgot password error:", error);
      setError(
        error.code === "auth/user-not-found"
          ? "No account found with this email."
          : "Unable to send reset email. Try again later."
      );
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
              aria-label={showPassword ? "Hide password" : "Show password"}
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
