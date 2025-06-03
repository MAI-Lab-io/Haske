import React, { useEffect, useState } from "react";
import { auth } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import { logAction } from "../utils/analytics";
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
            // Track verification check
            logAction('Verification Check Started', {}, user);
            
            fetch(`https://haske.online:8090/api/verification/check-verification?email=${user.email}`)
                .then((response) => response.json())
                .then((data) => {
                    if (data.isVerified) {
                        setIsVerified(true);
                        setInstitutionName(data.institutionName || "");
                        setIsAdmin(data.isAdmin || false);
                        logAction('User Verified', {
                            institution: data.institutionName,
                            isAdmin: data.isAdmin
                        }, user);
                    } else {
                        setIsVerified(false);
                        logAction('User Not Verified', {}, user);
                    }
                })
                .catch((error) => {
                    console.error("Error checking verification:", error);
                    setIsVerified(false);
                    logAction('Verification Check Failed', { error: error.message }, user);
                });
        } else {
            setIsVerified(false);
            logAction('No User Found - Redirecting', {}, null);
        }
    }, []);

    useEffect(() => {
        if (isVerified && isAdmin) {
            // Track admin institutions load
            const user = auth.currentUser;
            logAction('Admin Institutions Load Started', {}, user);
            
            setLoadingInstitutions(true);
            setError(null);
            
            fetch("https://haske.online:8090/api/institutions")
                .then((response) => response.json())
                .then((data) => {
                    if (data.success && Array.isArray(data.institutions)) {
                        setInstitutionsList(data.institutions);
                        logAction('Admin Institutions Loaded', {
                            count: data.institutions.length
                        }, user);
                    } else {
                        throw new Error(data.error || "Invalid response format");
                    }
                })
                .catch((error) => {
                    console.error("Error fetching institutions:", error);
                    setError("Failed to load institutions");
                    setInstitutionsList([]);
                    logAction('Admin Institutions Load Failed', {
                        error: error.message
                    }, user);
                })
                .finally(() => setLoadingInstitutions(false));
        }
    }, [isVerified, isAdmin]);

    const handleSignOut = () => {
        const user = auth.currentUser;
        if (user) {
            logAction('Sign Out Initiated', {}, user);
            
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
                        logAction('Sign Out Logged', {}, user);
                    } else {
                        logAction('Sign Out Log Failed', {}, user);
                    }
                    return auth.signOut();
                })
                .then(() => {
                    logAction('User Signed Out', {}, user);
                    navigate("/", { state: { message: "Signed out successfully!" }, replace: true });
                })
                .catch((error) => {
                    console.error('Error during sign out:', error);
                    logAction('Sign Out Error', {
                        error: error.message
                    }, user);
                });
        }
    };

    const handleInstitutionChange = (event) => {
        const user = auth.currentUser;
        const newInstitution = event.target.value;
        setSelectedInstitution(newInstitution);
        
        logAction('Institution Filter Changed', {
            selectedInstitution: newInstitution
        }, user);
    };

    const handleFilterClick = () => {
        const user = auth.currentUser;
        logAction('Institution Filter Applied', {
            institution: selectedInstitution
        }, user);
        
        setInstitutionName(selectedInstitution);
    };

    const handleAdminPanelClick = () => {
        const user = auth.currentUser;
        logAction('Admin Panel Accessed', {}, user);
        navigate("/admin");
    };

    if (isVerified === null) {
        return <div>Loading...</div>;
    }
    
    if (isVerified === false) {
        const user = auth.currentUser;
        logAction('Redirected to Register - Not Verified', {}, user);
        navigate("/register");
        return null;
    }

    // Track page view after verification
    useEffect(() => {
        const user = auth.currentUser;
        if (isVerified && user) {
            logAction('Protected Content Viewed', {
                isAdmin,
                institutionName
            }, user);
        }
    }, [isVerified, isAdmin, institutionName]);

    const formattedInstitutionName = institutionName ? encodeURIComponent(institutionName) : "";

    const iframeSrc = isAdmin
        ? `https://haske.online:5000/ui/app/#${selectedInstitution ? `filtered-studies?InstitutionName=${encodeURIComponent(selectedInstitution)}&order-by=Metadata,LastUpdate,DESC` : ""}`
        : `https://haske.online:5000/ui/app/#${institutionName ? `filtered-studies?InstitutionName=${formattedInstitutionName}&order-by=Metadata,LastUpdate,DESC` : ""}`;

    return (
        <div className="protected-container">
            <iframe 
                src={iframeSrc} 
                title="Haske" 
                className="protected-iframe"
                onLoad={() => {
                    const user = auth.currentUser;
                    logAction('Study Viewer Loaded', {
                        url: iframeSrc,
                        isAdmin,
                        institution: isAdmin ? selectedInstitution : institutionName
                    }, user);
                }}
            ></iframe>
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
                        <button 
                            onClick={handleAdminPanelClick} 
                            className="admin-button"
                        >
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
