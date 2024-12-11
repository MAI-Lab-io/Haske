import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./VerifyPage.css";

const VerifyPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    institution_name: "",
    institution_address: "",
    role: "",
    email: "",
    phone_number: "",
  });

  const [notification, setNotification] = useState("");

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
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNotification("");

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
        navigate("/verify-waiting");
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
          <input
            type="text"
            name="institution_name"
            placeholder="Institution Name"
            value={formData.institution_name}
            onChange={handleChange}
            required
            className="verify-input"
          />
          <select
            name="institution_address"
            value={formData.institution_address}
            onChange={handleChange}
            required
            className="verify-select"
          >
            <option value="" disabled>
              Select Institution Address
            </option>
            <option value="Crestview Igbobi">Crestview Igbobi</option>
            <option value="Crestview Ikeja">Crestview Ikeja</option>
            <option value="Crestview Ilorin">Crestview Ilorin</option>
            <option value="Crestview VI">Crestview VI</option>
            <option value="OOUTH">OOUTH</option>
          </select>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
            className="verify-select"
          >
            <option value="" disabled>
              Select Role
            </option>
            <option value="Radiologist">Radiologist</option>
            <option value="Radiographer">Radiographer</option>
            <option value="Front Desk">Front Desk</option>
            <option value="IT Specialist">IT Specialist</option>
          </select>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            readOnly
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

        {notification && <p className="verify-notification">{notification}</p>}
      </div>
    </div>
  );
};

export default VerifyPage;
