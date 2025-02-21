import React, { useState, useEffect } from "react";
import { auth } from "../firebaseConfig";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { motion } from "framer-motion";
import logo from "../assets/haske.png";
import signinImage from "../assets/signin-image.png";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) navigate("/patient-details");
    });
    return () => unsubscribe();
  }, [navigate]);

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
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/patient-details");
    } catch (error) {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left Side - Image & Background */}
      <div className="w-1/2 flex items-center justify-center relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-80 z-[-1]"
        ></motion.div>
        <img
          src={signinImage}
          alt="Sign In"
          className="w-3/4 h-auto drop-shadow-lg"
        />
      </div>

      {/* Right Side - Sign In Form */}
      <div className="w-1/2 flex flex-col justify-center items-center px-12 bg-white shadow-lg">
        <img src={logo} alt="Logo" className="w-24 mb-6" />
        <h2 className="text-3xl font-bold mb-2">Welcome Back</h2>
        <p className="text-gray-600 mb-6">Sign in to continue</p>

        <form className="w-full max-w-md" onSubmit={handleSignIn}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email Address"
            required
            className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500"
          />

          <div className="relative mb-4">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              className="absolute right-3 top-3 text-gray-500"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-300"
            disabled={loading}
          >
            {loading ? <div className="spinner"></div> : "Sign In"}
          </motion.button>
        </form>

        {error && <p className="text-red-500 mt-4">{error}</p>}
        {message && <p className="text-green-500 mt-4">{message}</p>}

        <p className="mt-4 text-gray-600">
          Don't have an account? <a href="/register" className="text-blue-600">Register</a>
        </p>
        <p
          className="mt-2 text-blue-600 cursor-pointer"
          onClick={() => sendPasswordResetEmail(auth, email)}
        >
          Forgot Password?
        </p>
      </div>
    </div>
  );
};

export default SignIn;
