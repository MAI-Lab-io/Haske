import React, { useEffect, useState } from "react";
import { auth } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import "./ProtectedContent.css";

function ProtectedContent() {
    const [isVerified, setIsVerified] = useState(null);
    const navigate = useNavigate();
    const inactivityLimit = 15 * 60 * 1000; // 15 minutes in milliseconds

    useEffect(() => {
        const user = auth.currentUser;
        if (user) {
            fetch(`https://haske.online:8080/api/verification/check-verification?email=${user.email}`)
                .then((response) => response.json())
                .then((data) => setIsVerified(data.isVerified))
                .catch(() => setIsVerified(false));
        } else {
            setIsVerified(false);
        }

        // Handle activity and inactivity
        const handleActivity = () => localStorage.setItem("lastActivity", Date.now());
        const checkInactivity = () => {
            const lastActivity = localStorage.getItem("lastActivity");
            if (lastActivity && Date.now() - lastActivity > inactivityLimit) {
                localStorage.removeItem("lastActivity");
                navigate("/register");
            }
        };

        window.addEventListener("mousemove", handleActivity);
        window.addEventListener("keypress", handleActivity);
        const inactivityInterval = setInterval(checkInactivity, 60000);
        const refreshInterval = setInterval(() => window.location.reload(), 10000);

        return () => {
            window.removeEventListener("mousemove", handleActivity);
            window.removeEventListener("keypress", handleActivity);
            clearInterval(inactivityInterval);
            clearInterval(refreshInterval);
        };
    }, [navigate]);

    useEffect(() => {
        if (isVerified === false) navigate("/register");
    }, [isVerified, navigate]);

    const handleSignOut = () => {
        auth.signOut().then(() => {
            navigate("/register", { state: { message: "Signed out successfully!" } });
            localStorage.removeItem("lastActivity");
        });
    };

    if (isVerified === null) return <div>Loading...</div>;

    return (
        <div className="protected-container">
            <iframe
                src="https://haske.online:5000/ui/app/"
                title="Haske"
                className="protected-iframe"
            ></iframe>
            <button onClick={handleSignOut} className="signout-button">Sign Out</button>
        </div>
    );
}

export default ProtectedContent;
