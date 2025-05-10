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
    const [loadingInstitutions, setLoadingInstitutions] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const user = auth.currentUser;
        if (user) {
            fetch(`https://haske.online:8090/api/verification/check-verification?email=${user.email}`)
                .then((response) => response.json())
                .then((data) => {
                    if (data.isVerified) {
                        setIsVerified(true);
                        setInstitutionName(data.institutionName || "");
                        setIsAdmin(data.isAdmin || false);
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
        if (isVerified && isAdmin) {
            setLoadingInstitutions(true);
            setError(null);
            
            fetch("https://haske.online:8090/api/institutions")
                .then((response) => response.json())
                .then((data) => {
                    if (data.success && Array.isArray(data.data?.institutions)) {
                        setInstitutionsList(data.data.institutions);
                    } else {
                        throw new Error(data.error?.message || "Invalid response format");
                    }
                })
                .catch((error) => {
                    console.error("Error fetching institutions:", error);
                    setError("Failed to load institutions");
                    setInstitutionsList([]);
                })
                .finally(() => setLoadingInstitutions(false));
        }
    }, [isVerified, isAdmin]);

    const handleSignOut = () => {
        const user = auth.currentUser;
        if (user) {
            fetch('https://haske.online:8090/api/verification/log-action', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: user.email,
                    action: 'user signed out',
                }),
            })
                .then((response) => {
                    if (response.ok) {
                        console.log('Sign out action logged');
                    } else {
                        console.error('Failed to log sign out');
                    }
                    return auth.signOut();
                })
                .then(() => {
                    navigate("/", { state: { message: "Signed out successfully!" }, replace: true });
                })
                .catch((error) => {
                    console.error('Error during sign out:', error);
                });
        }
    };

    const handleInstitutionChange = (event) => {
        setSelectedInstitution(event.target.value);
    };

    const handleFilterClick = () => {
        setInstitutionName(selectedInstitution);
    };

    if (isVerified === null) return <div className="loading-container">Loading...</div>;
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
            <div className="overlay-container">
                {isAdmin && (
                    <div className="filter-section">
                        {loadingInstitutions ? (
                            <div>Loading institutions...</div>
                        ) : error ? (
                            <div className="error-message">{error}</div>
                        ) : (
                            <>
                                <select 
                                    id="institutionFilter" 
                                    value={selectedInstitution} 
                                    onChange={handleInstitutionChange}
                                    disabled={institutionsList.length === 0}
                                >
                                    <option value="">All Institutions</option>
                                    {institutionsList.map((institution) => (
                                        <option key={institution.id} value={institution.name}>
                                            {institution.name}
                                        </option>
                                    ))}
                                </select>
                                <button 
                                    onClick={handleFilterClick} 
                                    className="filter-button"
                                    disabled={!selectedInstitution}
                                >
                                    Apply Filter
                                </button>
                            </>
                        )}
                    </div>
                )}
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
        </div>
    );
}

export default ProtectedContent;
