import React, { useEffect, useState } from "react";
import { auth } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import "./ProtectedContent.css"; // Import CSS for styling

function ProtectedContent() {
    const [isVerified, setIsVerified] = useState(null); // State to track verification status
    const [InstitutionName, setInstitutionName] = useState(""); // State to track the institution name
    const [lastActivity, setLastActivity] = useState(null); // Track the last activity timestamp
    const navigate = useNavigate();
    const inactivityLimit = 15 * 60 * 1000; // 15 minutes in milliseconds

    useEffect(() => {
        // Get the current user and check verification status
        const user = auth.currentUser;
        if (user) {
            // Call backend to check if the user is verified
            fetch(`https://haske.online:8080/api/verification/check-verification?email=${user.email}`)
                .then((response) => response.json()) // Parse the JSON response
                .then((data) => {
                    if (data.isVerified) {
                        setIsVerified(true);
                        setInstitutionName(data.institution_name); // Set institution name from the response
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
        const iframe = document.querySelector(".protected-iframe");
        if (iframe && InstitutionName) {
            iframe.contentWindow.postMessage({ InstitutionName }, "*");
        }
    }, [InstitutionName]);

    const handleSignOut = () => {
        auth.signOut().then(() => {
            navigate("/", { state: { message: "Signed out successfully!" } }); // Redirect to LandingPage with a message
            localStorage.removeItem("lastActivity"); // Clear the last activity on sign out
        });
    };

    const checkInactivity = () => {
        const lastActivityTime = localStorage.getItem("lastActivity");
        if (lastActivityTime && Date.now() - lastActivityTime > inactivityLimit) {
            navigate("/"); // Redirect to landing page after 15 minutes of inactivity
        }
    };

    // Update last activity timestamp whenever there is user activity
    useEffect(() => {
        const handleActivity = () => {
            localStorage.setItem("lastActivity", Date.now()); // Update the last activity time
            setLastActivity(Date.now()); // Update the local state as well
        };

        // Listen for any activity like mouse movement, keypress, etc.
        window.addEventListener("mousemove", handleActivity);
        window.addEventListener("keypress", handleActivity);

        // Cleanup event listeners on component unmount
        return () => {
            window.removeEventListener("mousemove", handleActivity);
            window.removeEventListener("keypress", handleActivity);
        };
    }, []);

    // Check inactivity on every page load
    useEffect(() => {
        checkInactivity();
    }, []);

    // Handle session expiration on page reload
    useEffect(() => {
        const sessionExpiration = localStorage.getItem("lastActivity");
        if (sessionExpiration && Date.now() - sessionExpiration > inactivityLimit) {
            navigate("/"); // Redirect to the landing page after inactivity
        }
    }, [navigate]);

    if (isVerified === null) {
        return <div>Loading...</div>; // Wait for verification check response
    }

    if (isVerified === false) {
        navigate("/register"); // Redirect to register page if not verified
        return null; // Prevent further rendering
    }

    return (
        <div className="protected-container">
            <iframe
                src="https://haske.online:5000/ui/app/" // Replace with your actual URL
                title="Haske"
                className="protected-iframe"
            ></iframe>
            <div className="signout-container">
                <button onClick={handleSignOut} className="signout-button">Sign Out</button>
            </div>
        </div>
    );
}

export default ProtectedContent;
