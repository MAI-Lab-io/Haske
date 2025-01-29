react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import SignIn from "./components/SignIn";
import Register from "./components/Register";
import ProtectedContent from "./components/ProtectedContent";
import LandingPage from "./components/LandingPage";
import VerifyPage from "./components/VerifyPage";
import AdminPage from "./components/AdminPage";
import { auth } from "./firebaseConfig"; // Firebase auth import
import VerifyWaiting from "./components/VerifyWaiting";

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Listen to authentication state changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user); // Set user to state when authentication state changes
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/signin"
          element={<SignIn />}
        />
        <Route path="/verification" element={<VerifyPage />} />
        <Route path="/verify-waiting" element={<VerifyWaiting />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/patient-details"
          element={user ? <ProtectedContent /> : <Navigate to="/" replace />}
        />
      </Routes>
    </Router>
  );
};

export default App;
