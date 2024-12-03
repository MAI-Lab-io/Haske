// src/components/Register.js
import React, { useState } from "react";
import { auth, firestore } from "../firebaseConfig";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./Register.css"; // Import CSS file for styles

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [institution, setInstitution] = useState("");
  const [institutionAddress, setInstitutionAddress] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Add user data to Firestore
      await setDoc(doc(firestore, "users", user.uid), {
        firstName,
        lastName,
        institution,
        institutionAddress,
        role,
        isApproved: false,
        isActivated: false,
      });

      // Notify user
      setError("Registration successful. Please wait for admin approval.");
    } catch (error) {
      setError(error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Add user data to Firestore
      await setDoc(doc(firestore, "users", user.uid), {
        firstName: user.displayName?.split(" ")[0] || "",
        lastName: user.displayName?.split(" ")[1] || "",
        institution: "Not provided",
        institutionAddress: "Not provided",
        role: "User",
        isApproved: false,
        isActivated: false,
      });

      navigate("/patient-details");
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
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First Name"
            required
            className="register-input"
          />
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last Name"
            required
            className="register-input"
          />
          <input
            type="text"
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            placeholder="Institution Name"
            required
            className="register-input"
          />
          <input
            type="text"
            value={institutionAddress}
            onChange={(e) => setInstitutionAddress(e.target.value)}
            placeholder="Institution Address"
            required
            className="register-input"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
            className="register-input"
          >
            <option value="">Select Role</option>
            <option value="Radiologist">Radiologist</option>
            <option value="IT">IT</option>
            <option value="Staff">Staff</option>
          </select>
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
