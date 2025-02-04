import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // Import location and navigate
import "./VerifyPage.css"; // Import CSS file for styles

const VerifyPage = () => {
  const navigate = useNavigate(); // Initialize navigation
  const location = useLocation(); // Access state passed from registration page
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    institution_name: "",
    institution_address: "",
    role: "",
    email: "",
    phone_number: "", // New phone number field
  });

  const [notification, setNotification] = useState(""); // State to hold the notification message

  const roles = ["Radiologist", "Radiographer", "Front Desk", "IT Specialist"];
  const institutions = [
    "CRESTVIEW RADIOLOGY LTD",
    "National Library of Medicine",
    "BTHDC LASUTH",
    "GEM DIAGNOSTIC CENTER",
    "OOUTH",
  ];

  // Pre-fill email from registration page
  useEffect(() => {
    if (location.state?.email) {
      setFormData((prevData) => ({
        ...prevData,
        email: location.state.email,
      }));
    }
  }, [location.state]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNotification(""); // Reset notification on new submission

    try {
      const response = await fetch(
        "https://haske.online:8080/api/verification/submit-verification",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();

      if (response.ok) {
        setNotification(
          "Account Approval in progress..! You will be contacted shortly."
        );
        setFormData({
          first_name: "",
          last_name: "",
          institution_name: "",
          institution_address: "",
          role: "",
          email: "",
          phone_number: "",
        });
        navigate("/verify-waiting"); // Navigate to verify-waiting page
      } else {
        setNotification(
          "Error: " + (result.message || "An error occurred. Please try again.")
        );
      }
    } catch (error) {
      console.error("Error submitting verification:", error);
      setNotification("An error occurred. Please try again.");
    }
  };

  return (
    <div className="verify-container">
      <div className="form-wrapper">
        <h2 className="form-title">Users Profile</h2>
        <form className="verify-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="first_name"
            placeholder="First Name"
            value={formData.first_name}
            onChange={handleChange}
            required
            className="verify-input"
          />
          <input
            type="text"
            name="last_name"
            placeholder="Last Name"
            value={formData.last_name}
            onChange={handleChange}
            required
            className="verify-input"
          />
          <select
            name="institution_name"
            value={formData.institution_name}
            onChange={handleChange}
            required
            className="verify-select"
          >
            <option value="">Select Institution Name</option>
            {institutions.map((inst, index) => (
              <option key={index} value={inst}>
                {inst}
              </option>
            ))}
          </select>
          <textarea
            name="institution_address"
            placeholder="Institution Address"
            value={formData.institution_address}
            onChange={handleChange}
            required
            className="verify-textarea"
          ></textarea>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
            className="verify-select"
          >
            <option value="">Select Role</option>
            {roles.map((role, index) => (
              <option key={index} value={role}>
                {role}
              </option>
            ))}
          </select>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            readOnly // Make email field read-only since it's pre-filled
            className="verify-input"
          />
          <input
            type="text"
            name="phone_number"
            placeholder="Phone Number"
            value={formData.phone_number}
            onChange={handleChange}
            required
            className="verify-input"
          />
          <button type="submit" className="verify-button">
            Complete Profile
          </button>
        </form>

        {/* Display Notification */}
        {notification && <p className="verify-notification">{notification}</p>}
      </div>
    </div>
  );
};

export default VerifyPage;
