import { useNavigate } from "react-router-dom";
import "./Register.css"; // Import CSS file for styles
// Register.js
import React, { useState } from "react";
import { auth, firestore } from "../firebaseConfig"; // Ensure Firestore is initialized
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore"; 

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [institution, setInstitution] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState(null);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Add user data to Firestore with 'isApproved' set to false initially
      await setDoc(doc(firestore, "users", user.uid), {
        firstName,
        lastName,
        institution,
        role,
        isApproved: false,
        isActivated: false,
      });

      // Send email to admin for approval or use a notification system for admin
      setError("Registration successful, please wait for admin approval.");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <form onSubmit={handleRegister}>
      {/* Your form inputs */}
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
      <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
      <input type="text" value={institution} onChange={(e) => setInstitution(e.target.value)} required />
      <select value={role} onChange={(e) => setRole(e.target.value)} required>
        <option value="">Select Role</option>
        <option value="Radiologist">Radiologist</option>
        <option value="IT">IT</option>
        <option value="Staff">Staff</option>
      </select>
      <button type="submit">Register</button>
      {error && <p>{error}</p>}
    </form>
  );
}

export default Register;
