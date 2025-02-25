import React, { useState } from "react";
import { auth } from "../firebaseConfig";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "./Register.css"; // Import CSS file for styles
import logo from "../assets/haske.png"; // Import your logo here
import aiWebBackground from "../assets/ai-web-background.png";  // Import your background image here

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Function to handle sign-in if the user already has an account
  const handleSignIn = async (e) => {
    e.preventDefault(); // Prevent default link behavior
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
          <h2 className="form-title">Setup your account here!</h2>
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
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="register-button"
              disabled={loading}
            >
              {loading ? "Processing..." : "Register"}
            </motion.button>
          </form>
          {error && <p className="register-error">{error}</p>}
          <p className="register-footer">
            Already have an account?{" "}
            <a
              href="/signin"
              onClick={(e) => {
                e.preventDefault(); // Prevent default link behavior
                handleSignIn(e); // Call the handleSignIn function
              }}
            >
              Sign In
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default Register;
