import React, { useEffect, useState } from "react";
import { auth } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import "./ProtectedContent.css"; // Import CSS for styling

function ProtectedContent() {
    const [isVerified, setIsVerified] = useState(null); // State to track verification status
    const [InstitutionName, setInstitutionName] = useState(""); // State to track the institution name
    const navigate = useNavigate();

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
            navigate("/LandingPage", { state: { message: "Signed out successfully!" } }); // Redirect to LandingPage with a message
        });
    };

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
