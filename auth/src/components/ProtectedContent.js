import React, { useEffect, useState } from "react";
import { auth } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import "./ProtectedContent.css";

function ProtectedContent() {
    const [isVerified, setIsVerified] = useState(null);
    const [institutionName, setInstitutionName] = useState("");
    const [isAdmin, setIsAdmin] = useState(false);  // Track if user is an admin
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
                        setIsAdmin(data.isAdmin); // Store admin status
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

    const handleSignOut = () => {
        auth.signOut().then(() => {
            navigate("/", { state: { message: "Signed out successfully!" } });
        });
    };

    if (isVerified === null) {
        return <div>Loading...</div>;
    }

    if (isVerified === false) {
        navigate("/register");
        return null;
    }

    const formattedInstitutionName = institutionName ? institutionName.replace(/ /g, "+") : "";

    return (
        <div className="protected-container">
            <iframe
                src={`https://haske.online:5000/ui/app/#/filtered-studies?InstitutionName=${formattedInstitutionName}&order-by=Metadata,LastUpdate,DESC`}
                title="Haske"
                className="protected-iframe"
            ></iframe>
            <div className="signout-container">
                {isAdmin && (  // Show Admin button only if user is an admin
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
