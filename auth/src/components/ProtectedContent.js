import React, { useEffect, useState } from "react";
import { auth } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import "./ProtectedContent.css"; // Import CSS for styling

function ProtectedContent() {
    const [isVerified, setIsVerified] = useState(null); // State to track verification status
    const navigate = useNavigate();
    const inactivityLimit = 15 * 60 * 1000; // 15 minutes in milliseconds

    // Check if the user is logged in and verified on component mount
    useEffect(() => {
        const user = auth.currentUser;
        if (user) {
            // Fetch verification status from backend
            fetch(`https://haske.online:8080/api/verification/check-verification?email=${user.email}`)
                .then((response) => response.json())
                .then((data) => {
                    setIsVerified(data.isVerified);
                })
                .catch((error) => {
                    console.error("Error checking verification:", error);
                    setIsVerified(false);
                });
        } else {
            setIsVerified(false);
        }

        // Listen for user activity to reset inactivity timer
        const handleActivity = () => {
            localStorage.setItem("lastActivity", Date.now()); // Update last activity time
        };

        window.addEventListener("mousemove", handleActivity);
        window.addEventListener("keypress", handleActivity);

        // Clean up event listeners on component unmount
        return () => {
            window.removeEventListener("mousemove", handleActivity);
            window.removeEventListener("keypress", handleActivity);
        };
    }, []);

    // Function to check if the user has been inactive for too long
    const checkInactivity = () => {
        const lastActivityTime = localStorage.getItem("lastActivity");
        if (lastActivityTime && Date.now() - lastActivityTime > inactivityLimit) {
            localStorage.removeItem("lastActivity"); // Clear session if expired
            navigate("/register"); // Redirect to register page after inactivity
        }
    };

    // Set an interval to check inactivity every minute
    useEffect(() => {
        const inactivityInterval = setInterval(checkInactivity, 60000); // Check inactivity every minute
        return () => clearInterval(inactivityInterval); // Clean up on component unmount
    }, []);

    // Auto-refresh the page every 10 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            window.location.reload(); // Reload the page
        }, 10000); // Refresh every 10 seconds

        return () => clearInterval(interval); // Clean up interval on component unmount
    }, []);

    // Redirect user if not verified
    useEffect(() => {
        if (isVerified === false) {
            navigate("/register"); // Redirect to register page if not verified
        }
    }, [isVerified, navigate]);

    // Handle user sign out
    const handleSignOut = () => {
        auth.signOut().then(() => {
            navigate("/register", { state: { message: "Signed out successfully!" } }); // Redirect to register page
            localStorage.removeItem("lastActivity"); // Clear session data
        });
    };

    if (isVerified === null) {
        return <div>Loading...</div>; // Wait for verification check response
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
