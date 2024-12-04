import React, { useState } from "react";

const VerifyPage = () => {
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
      const response = await fetch("https://haske.onrender.com/api/verification/submit-verification/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setNotification("Verification request submitted successfully! You will be contacted shortly.");
      } else {
        setNotification("Error: " + result.message || "An error occurred. Please try again.");
      }

      setFormData({
        first_name: "",
        last_name: "",
        institution_name: "",
        institution_address: "",
        role: "",
        email: "",
      });

    } catch (error) {
      console.error("Error submitting verification:", error);
      setNotification("An error occurred. Please try again.");
    }
  };

  return (
    <div>
      <h2>Verify Your Role</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="first_name"
          placeholder="First Name"
          value={formData.first_name}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="last_name"
          placeholder="Last Name"
          value={formData.last_name}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="institution_name"
          placeholder="Institution Name"
          value={formData.institution_name}
          onChange={handleChange}
          required
        />
        <textarea
          name="institution_address"
          placeholder="Institution Address"
          value={formData.institution_address}
          onChange={handleChange}
          required
        ></textarea>
        <input
          type="text"
          name="role"
          placeholder="Role"
          value={formData.role}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <button type="submit">Verify Your Role</button>
      </form>

      {/* Display Notification */}
      {notification && <p>{notification}</p>}
    </div>
  );
};

export default VerifyPage;
