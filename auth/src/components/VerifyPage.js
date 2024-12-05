import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import navigate from React Router
import "./VerifyPage.css"; // Import CSS file for styles

const VerifyPage = () => {
  const navigate = useNavigate(); // Initialize navigation
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    institution_name: "",
    institution_address: "",
    role: "",
    email: "",
  });

  const [notification, setNotification] = useState(""); // State to hold the notification message

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
          "Verification request submitted successfully! You will be contacted shortly."
        );
        setFormData({
          first_name: "",
          last_name: "",
          institution_name: "",
          institution_address: "",
          role: "",
          email: "",
        });
        navigate("/"); // Navigate to home or another page after success
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
        <h2 className="form-title">Verify Your Role</h2>
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
          <input
            type="text"
            name="institution_name"
            placeholder="Institution Name"
            value={formData.institution_name}
            onChange={handleChange}
            required
            className="verify-input"
          />
          <textarea
            name="institution_address"
            placeholder="Institution Address"
            value={formData.institution_address}
            onChange={handleChange}
            required
            className="verify-textarea"
          ></textarea>
          <input
            type="text"
            name="role"
            placeholder="Role"
            value={formData.role}
            onChange={handleChange}
            required
            className="verify-input"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="verify-input"
          />
          <button type="submit" className="verify-button">
            Verify Your Role
          </button>
        </form>

        {/* Display Notification */}
        {notification && <p className="verify-notification">{notification}</p>}
      </div>
    </div>
  );
};

export default VerifyPage;
