import React, { useEffect, useState } from "react";
import { auth } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import { Box, Button, Select, MenuItem, CircularProgress, Alert } from "@mui/material";
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
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
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
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          if (data.success && Array.isArray(data.institutions)) {
            setInstitutionsList(data.institutions);
          } else {
            throw new Error(data.error || "Invalid response format");
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
          if (!response.ok) {
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

  if (isVerified === null) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isVerified === false) {
    navigate("/register");
    return null;
  }

  const formattedInstitutionName = institutionName ? encodeURIComponent(institutionName) : "";

  const iframeSrc = isAdmin
    ? `https://haske.online:5000/ui/app/#${selectedInstitution ? `filtered-studies?InstitutionName=${encodeURIComponent(selectedInstitution)}&order-by=Metadata,LastUpdate,DESC` : ""}`
    : `https://haske.online:5000/ui/app/#${institutionName ? `filtered-studies?InstitutionName=${formattedInstitutionName}&order-by=Metadata,LastUpdate,DESC` : ""}`;

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100vh' }}>
      <iframe 
        src={iframeSrc} 
        title="Haske" 
        style={{ width: '100%', height: '100%', border: 'none' }}
      />
      
      <Box sx={{
        position: 'absolute',
        top: 0,
        right: 0,
        padding: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        zIndex: 1000
      }}>
        {isAdmin && (
          <Box sx={{
            backgroundColor: 'background.paper',
            padding: 2,
            borderRadius: 1,
            boxShadow: 3,
            display: 'flex',
            gap: 2,
            alignItems: 'center'
          }}>
            {loadingInstitutions ? (
              <CircularProgress size={24} />
            ) : error ? (
              <Alert severity="error">{error}</Alert>
            ) : (
              <>
                <Select
                  value={selectedInstitution}
                  onChange={handleInstitutionChange}
                  disabled={institutionsList.length === 0}
                  size="small"
                  sx={{ minWidth: 200 }}
                >
                  <MenuItem value="">All Institutions</MenuItem>
                  {institutionsList.map((institution) => (
                    <MenuItem key={institution.id} value={institution.name}>
                      {institution.name}
                    </MenuItem>
                  ))}
                </Select>
                <Button 
                  onClick={handleFilterClick} 
                  variant="contained"
                  disabled={!selectedInstitution}
                  size="small"
                >
                  Apply Filter
                </Button>
              </>
            )}
          </Box>
        )}
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          {isAdmin && (
            <Button 
              onClick={() => navigate("/admin")} 
              variant="contained"
              size="small"
            >
              Admin Panel
            </Button>
          )}
          <Button 
            onClick={handleSignOut} 
            variant="contained" 
            color="error"
            size="small"
          >
            Sign Out
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default ProtectedContent;
