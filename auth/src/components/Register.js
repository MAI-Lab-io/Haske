import React, { useState } from "react";
import { auth } from "../firebaseConfig";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "./Register.css"; // Import CSS file for styles

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Function to handle sign-in if the user already has an account
  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Attempt to sign in
      await signInWithEmailAndPassword(auth, email, password);
      setLoading(false);
      alert("You already have an account. Redirecting to sign-in...");
      navigate("/signin"); // Redirect to sign-in page
    } catch (error) {
      console.error("Sign-in error:", error);
      setLoading(false);
      setError("Invalid credentials. Please try again.");
    }
  };

  // Function to handle registration
  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Create user on Firebase
      await createUserWithEmailAndPassword(auth, email, password);
      setLoading(false);
      alert("Registration successful! Please complete your profile.");
      
      // Redirect to verify-waiting page
      navigate("/verification", { state: { email } });
    } catch (error) {
      setLoading(false);
      if (error.code === "auth/email-already-in-use") {
        setError("This email is already registered. Redirecting to sign in...");
        alert("You already have an account. Redirecting...");
        navigate("/signin");
      } else {
        setError(error.message);
      }
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
          <button type="submit" className="register-button" disabled={loading}>
            {loading ? "Processing..." : "Register"}
          </button>
        </form>
        {error && <p className="register-error">{error}</p>}
        <p className="register-footer">
          Already have an account? <a href="/signin" onClick={handleSignIn}>Sign In</a>
        </p>
      </div>
    </div>
  );
}

export default Register;
