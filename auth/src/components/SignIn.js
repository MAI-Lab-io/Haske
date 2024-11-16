import React, { useState } from "react";
import { auth } from "../firebaseConfig";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "./SignIn.css"; 

function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Sign in with email and password
  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/patient-details"); 
    } catch (error) {
      setError(error.message);
    }
  };

  // Sign in with Google
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate("/patient-details"); // Redirect to protected content
    } catch (error) {
      setError(error.message);
    }
  };


  const handleForgotPassword = async () => {
  if (!email) {
    setError("Please enter your email address.");
    return;
  }

  try {
    await auth.sendPasswordResetEmail(email);
    alert("Password reset email sent! Check your inbox.");
  } catch (error) {
    setError(error.message);
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
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="signin-input"
          />
          <button type="submit" className="signin-button">Sign In</button>
        </form>
        {error && <p className="signin-error">{error}</p>}
        <p className="signin-footer">
          Don't have an account? <a href="/register">Register</a>
        </p>
        <button onClick={handleGoogleSignIn} className="google-signin-button">Sign In with Google</button>
        <p className="forgot-password" onClick={handleForgotPassword}>Forgot password?</p>

      </div>
    </div>
  );
}

export default SignIn;
