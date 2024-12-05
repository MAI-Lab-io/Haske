import React, { useState } from "react";
import { auth } from "../firebaseConfig";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "./Register.css"; // Import CSS file for styles

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isVerified, setIsVerified] = useState(true); // Track verification status
  const navigate = useNavigate();

  const checkUserVerification = async (email) => {
    try {
      // Make API call to check if the user is verified
      const response = await fetch(`https://haske.online:8080/api/verification/check-verification?email=${email}`);

      // Check if response is successful
      if (response.ok) {
        const data = await response.json(); // Parse the JSON response

        // Check if the isVerified field exists in the response
        if (data && data.isVerified !== undefined) {
          if (!data.isVerified) {
            setIsVerified(false);
            alert("Sorry, you have not been verified. Please kindly go ahead to verify at the Home page.");
            return false; // Return false for unverified users
          } else {
            setIsVerified(true);
            return true; // Return true for verified users
          }
        } else {
          console.error("Invalid response structure:", data);
          alert("Failed to verify the email. Please try again later.");
          return false; // Return false if the structure is invalid
        }
      } else {
        console.error("Failed to fetch verification status:", response.status);
        alert("An error occurred while checking verification. Please try again later.");
        return false; // Return false if the request fails
      }
    } catch (err) {
      console.error("Verification check failed", err);
      alert("An error occurred while checking verification. Please try again later.");
      return false; // Return false if the API call fails
    }
  };

  // Function to handle registration
  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      // Verify user first
      const isUserVerified = await checkUserVerification(email);

      if (!isUserVerified) {
        return; // Stop if the user is not verified
      }

      // Proceed with registration only if verified
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      alert("Registration successful!");
      navigate("/patient-details");
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
      // Perform Google sign-in
      const userCredential = await signInWithPopup(auth, provider);
      const email = userCredential.user.email;

      // Verify the user after sign-in
      const isUserVerified = await checkUserVerification(email);

      if (!isUserVerified) {
        // If the user is not verified, stop the process
        alert("You are not verified. Please go ahead and verify your email.");
        return; // Prevent further action (i.e., redirect or account creation)
      }

      // Proceed to the patient details page if verified
      alert("Google sign-in successful!");
      navigate("/patient-details");
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      setError("Error with Google sign-in: " + error.message);
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
          <button type="submit" className="register-button">Register</button>
        </form>
        {error && <p className="register-error">{error}</p>}

        {/* Google Sign-In Button */}
        <button className="google-signin-button" onClick={handleGoogleSignIn}>
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
