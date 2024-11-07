// src/components/ProtectedContent.js
import React from "react";
import { auth } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import "./ProtectedContent.css"; // Import CSS for styling

function ProtectedContent() {
    const navigate = useNavigate();

    const handleSignOut = () => {
        auth.signOut().then(() => {
            navigate("/"); // Redirect to LandingPage on sign out
        });
    };

    return (
        <div className="protected-container">
            <iframe
                src="http://51.44.123.184:8042/ui/app/#/" // Replace with your actual URL
                title="Protected Content"
                className="protected-iframe"
            ></iframe>
            <div className="signout-container">
                <button onClick={handleSignOut} className="signout-button">Sign Out</button>
            </div>
        </div>
    );
}

export default ProtectedContent;
