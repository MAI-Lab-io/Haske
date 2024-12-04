import React, { useState } from 'react';
import axios from 'axios';  // Assuming you're using axios to send data to the backend
import { useNavigate } from 'react-router-dom';

function VerificationPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [institution, setInstitution] = useState('');
  const [institutionaddress, setInstitutionAddress] = useState('');
  const [role, setRole] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);
    try {
      // Send the verification request to the backend
      await axios.post('/api/verify-user', { firstName, lastName, institution, institutionaddress, role });

      // Show notification
      setNotification('Verification is in progress, you will be contacted.');

      // Redirect or show confirmation after submission
      setTimeout(() => {
        navigate('/');  // Redirect to homepage or a confirmation page
      }, 2000);
    } catch (error) {
      setNotification('There was an error submitting your information.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2>User Role Verification</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Institution Name"
          value={institution}
          onChange={(e) => setInstitution(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Institution Address"
          value={institutionaddress}
          onChange={(e) => setInstitutionAddress(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          required
        />
        <button type="submit" disabled={isLoading}>Verify Your Role</button>
      </form>

      {notification && <div>{notification}</div>}
    </div>
  );
}

export default VerificationPage;
