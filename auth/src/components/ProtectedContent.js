import React, { useEffect, useState } from "react";
import { auth } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import "./ProtectedContent.css";

function ProtectedContent() {
    const [isVerified, setIsVerified] = useState(null);
    const [institutionName, setInstitutionName] = useState("");
    const [isAdmin, setIsAdmin] = useState(false);
    const [selectedInstitution, setSelectedInstitution] = useState("");
    const [institutionsList, setInstitutionsList] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const user = auth.currentUser;
        if (user) {
            fetch(`https://haske.online:8080/api/verification/check-verification?email=${user.email}`)
                .then((response) => response.json())
                .then((data) => {
                    if (data.isVerified) {
                        setIsVerified(true);
                        setInstitutionName(data.institutionName);
                        setIsAdmin(data.isAdmin);
                    } else {
                        setIsVerified(false);
                    }
                })
                .catch((error) => {
                    console.error("Error checking verification:", error);
                    setIsVerified(false);
                });
        } else {
            setIsVerified(false);
        }
    }, []);

    useEffect(() => {
        if (isVerified !== null && isAdmin) {
            fetch("https://haske.online:8080/api/institutions")
                .then((response) => response.json())
                .then((data) => {
                    if (Array.isArray(data)) {
                        setInstitutionsList(data);
                    } else {
                        console.error("Unexpected institutions response format:", data);
                    }
                })
                .catch((error) => console.error("Error fetching institutions:", error));
        }
    }, [isVerified, isAdmin]);

const handleSignOut = () => {
  const user = auth.currentUser;
  if (user) {
    // Log the sign-out action before signing out
    fetch('https://haske.online:8080/api/verification/log-action', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: user.email,
        action: 'user signed out', // Log the sign-out action
      }),
    })
      .then((response) => {
        if (response.ok) {
          console.log('Sign out action logged');
        } else {
          console.error('Failed to log sign out');
        }

        // Proceed to sign out the user
        auth.signOut().then(() => {
          // Display message for 3 seconds before redirecting
          navigate("/", { state: { message: "Signed out successfully!" } });
          
          // Optionally, you could store a timestamp or flag to control the visibility in the parent component
          setTimeout(() => {
            navigate("/", { replace: true }); // Optionally redirect to home or a different page if needed
          }, 3000); // 3 seconds delay to show the message
        });
      })
      .catch((error) => {
        console.error('Error logging sign out action:', error);
      });
  }
};


    
    // Inactivity timeout functionality
    useEffect(() => {
        let inactivityTimeout;
        
        const resetInactivityTimer = () => {
            clearTimeout(inactivityTimeout);
            inactivityTimeout = setTimeout(handleSignOut, 5 * 60 * 1000); // 5 minutes of inactivity
        };

        // Listen for user activity
        window.addEventListener('mousemove', resetInactivityTimer);
        window.addEventListener('keydown', resetInactivityTimer);
        window.addEventListener("click", resetInactivityTimer);
        window.addEventListener("scroll", resetInactivityTimer);

        // Set the initial timeout when the component mounts
        resetInactivityTimer();

        // Cleanup listeners on component unmount
        return () => {
            clearTimeout(inactivityTimeout);
            window.removeEventListener('mousemove', resetInactivityTimer);
            window.removeEventListener('keydown', resetInactivityTimer);
            window.removeEventListener("click", resetInactivityTimer);
            window.removeEventListener("scroll", resetInactivityTimer);
            
        };
    }, []);

    const handleInstitutionChange = (event) => {
        setSelectedInstitution(event.target.value);
    };

    const handleFilterClick = () => {
        setInstitutionName(selectedInstitution || "");
    };

    if (isVerified === null) return <div>Loading...</div>;

    if (isVerified === false) {
        navigate("/register");
        return null;
    }

    const formattedInstitutionName = institutionName ? encodeURIComponent(institutionName) : "";

    const iframeSrc = isAdmin
        ? `https://haske.online:5000/ui/app/#${selectedInstitution ? `filtered-studies?InstitutionName=${encodeURIComponent(selectedInstitution)}&order-by=Metadata,LastUpdate,DESC` : ""}`
        : `https://haske.online:5000/ui/app/#${institutionName ? `filtered-studies?InstitutionName=${formattedInstitutionName}&order-by=Metadata,LastUpdate,DESC` : ""}`;

    return (
        <div className="protected-container">
            <iframe src={iframeSrc} title="Haske" className="protected-iframe"></iframe>
            <div className="filter-container">
                {isAdmin && (
                    <div className="filter-section">
                        <label htmlFor="institutionFilter">Select Institution:</label>
                        <select id="institutionFilter" value={selectedInstitution} onChange={handleInstitutionChange}>
                            <option value="">All Institutions</option>
                            {institutionsList.map((institution) => (
                                <option key={institution.id} value={institution.name}>
                                    {institution.name}
                                </option>
                            ))}
                        </select>
                        <button onClick={handleFilterClick} className="filter-button">
                            Apply Filter
                        </button>
                    </div>
                )}
            </div>
            <div className="signout-container">
                {isAdmin && (
                    <button onClick={() => navigate("/admin")} className="admin-button">
                        Admin Panel
                    </button>
                )}
                <button onClick={handleSignOut} className="signout-button">
                    Sign Out
                </button>
            </div>
        </div>
    );
}

export default ProtectedContent;
