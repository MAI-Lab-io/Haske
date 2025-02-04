import React, { useEffect, useState } from "react";
import { auth } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import "./ProtectedContent.css";

function ProtectedContent() {
    const [isVerified, setIsVerified] = useState(null);
    const [institutionName, setInstitutionName] = useState("");
    const [isAdmin, setIsAdmin] = useState(false);  // Track if user is an admin
    const [selectedInstitution, setSelectedInstitution] = useState(""); // State for selected institution
    const [institutionsList, setInstitutionsList] = useState([]); // State for institutions list
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

            // Fetch institutions list only if admin
            if (user.isAdmin) {
                fetch("https://haske.online:8080/api/institutions")
                    .then((response) => response.json())
                    .then((data) => {
                        setInstitutionsList(data); // Populate institution list
                    })
                    .catch((error) => console.error("Error fetching institutions:", error));
            }
        } else {
            setIsVerified(false);
        }
    }, []);

    const handleSignOut = () => {
        auth.signOut().then(() => {
            navigate("/", { state: { message: "Signed out successfully!" } });
        });
    };

    const handleInstitutionChange = (event) => {
        setSelectedInstitution(event.target.value); // Update selected institution
    };

    const handleFilterClick = () => {
        // Trigger filter based on selected institution
        // If "All Institutions" is selected, clear the filter
        setInstitutionName(selectedInstitution || "");
    };

    if (isVerified === null) {
        return <div>Loading...</div>;
    }

    if (isVerified === false) {
        navigate("/register");
        return null;
    }

    // URL encoding for the institution name to be passed in the iframe URL
    const formattedInstitutionName = institutionName ? encodeURIComponent(institutionName) : "";

    // Dynamically set the iframe URL based on admin status and institution filter
    const iframeSrc = isAdmin
        ? `https://haske.online:5000/ui/app/#/${selectedInstitution ? `filtered-studies?InstitutionName=${encodeURIComponent(selectedInstitution)}&order-by=Metadata,LastUpdate,DESC` : "all"}`
        : `https://haske.online:5000/ui/app/#/filtered-studies?InstitutionName=${formattedInstitutionName}&order-by=Metadata,LastUpdate,DESC`;

    return (
        <div className="protected-container">
            <iframe
                src={iframeSrc}  // Use dynamic iframe URL
                title="Haske"
                className="protected-iframe"
            ></iframe>
            <div className="filter-container">
                {isAdmin && (
                    <div className="filter-section">
                        <label htmlFor="institutionFilter">Select Institution:</label>
                        <select
                            id="institutionFilter"
                            value={selectedInstitution}
                            onChange={handleInstitutionChange}
                        >
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
