// src/components/Register.js
import React, { useState } from "react";
import { auth } from "../firebaseConfig";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Add axios to make API requests
import "./Register.css"; // Import CSS file for styles

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isVerified, setIsVerified] = useState(true); // Track verification status
  const navigate = useNavigate();

  // Function to check if the user is verified
  const checkUserVerification = async (email) => {
    try {
      const response = await axios.get(`/api/verification/check-verification?email=${email}`);
      if (!response.data.isVerified) {
        setIsVerified(false);
        alert("Sorry, you have not been verified.");
      } else {
        setIsVerified(true);
      }
    } catch (err) {
      console.error("Verification check failed", err);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      checkUserVerification(email);  // Check verification after registering
      if (isVerified) {
        navigate("/patient-details");
      }
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        setError("This email is already registered. Please sign in.");
      } else {
        setError(error.message);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const userCredential = await signInWithPopup(auth, provider);
      checkUserVerification(userCredential.user.email);  // Check verification after Google sign-in
      if (isVerified) {
        navigate("/patient-details");
      }
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="register-container">
      <div className="form-wrapper">
        <h2 className="form-title">Create an Account</h2>
        <form className="register-form" onSubmit={handleRegister}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="register-input"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="register-input"
          />
          <button type="submit" className="register-button" disabled={!isVerified}>Register</button>
        </form>
        {error && <p className="register-error">{error}</p>}

        {/* Google Sign-In Button */}
        <button className="google-signin-button" onClick={handleGoogleSignIn} disabled={!isVerified}>
          Sign up with Google
        </button>

        <p className="register-footer">
          Already have an account? <a href="/signin">Sign In</a>
        </p>
      </div>
    </div>
  );
}

export default Register;
