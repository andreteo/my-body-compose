import React, { useEffect, useState } from "react";
import { Navigate, BrowserRouter, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import { lightTheme, darkTheme } from './components/ColourTheme'
import { CssBaseline } from "@mui/material";
import Homepage from "./components/Homepage";
import Calories from "./components/Calories";
import BodyComposition from "./components/BodyComposition";
import Navbar from "./components/Navbar";
import UserContext from "./context/user";
import UserProfile from "./components/UserProfile";
import Workout from "./components/Workout";
import useFetch from './hooks/useFetch';
import AdminPage from "./components/AdminPage";

export const ThemeContext = React.createContext();

function App() {
  const [darkMode, setDarkMode] = useState(false); // Dark mode toggle state
  const [theme, setTheme] = useState(lightTheme);  // Theme state
  const [role, setRole] = useState("");  //  User roles (User/Admin)
  const [showLogin, setShowLogin] = useState(true);  // Show login component state
  const [userProfile, setUserProfile] = useState({});  // User profile state
  const [isSignedIn, setIsSignedIn] = useState(false);  // User signed-in state, works in conjunction with accessToken state

  // Generic snackbar stuff to display different messages (user signed up, etc.)
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const snackbarOperations = {
    snackbarOpen: snackbarOpen,
    setSnackbarOpen: setSnackbarOpen,
    snackbarMessage: snackbarMessage,
    setSnackbarMessage: setSnackbarMessage
  }

  // Toggle between light and dark theme
  useEffect(() => {
    darkMode ? setTheme(darkTheme) : setTheme(lightTheme);
  }, [darkMode])

  const storeAccessTokenInLocalStorage = (accessToken) => {
    localStorage.setItem('accessToken', accessToken);
  };

  const getAccessTokenFromLocalStorage = () => {
    return localStorage.getItem('accessToken');
  };

  const isUserSignedIn = () => {
    const accessToken = localStorage.getItem('accessToken');

    return accessToken !== null && accessToken !== '';
  }

  const fetchData = useFetch();

  useEffect(() => {
    if (isUserSignedIn()) {
      getUserProfile();
    }
  }, [])

  const getUserProfile = async () => {
    const login = await fetchData("/user/profile", "GET", undefined, localStorage.getItem('accessToken'));
    const res = login.data;

    if (res.ok) {
      const user_profile = res.user_profile;
      setUserProfile(user_profile)
    } else {
      alert(JSON.stringify(res));
    }
  }

  const getRefreshToken = async () => {
    const refresh = await fetchData("/auth/refresh", "GET", undefined, localStorage.getItem('accessToken'));
    const res = refresh.data;

    if (res.ok) {
      storeAccessTokenInLocalStorage(res.token);
    }
  }

  return (
    <UserContext.Provider
      value={{
        role,
        setRole,
        userProfile,
        setUserProfile,
        isSignedIn,
        setIsSignedIn,
        showLogin,
        setShowLogin,
        storeAccessTokenInLocalStorage,
        getAccessTokenFromLocalStorage,
        isUserSignedIn,
        getRefreshToken
      }}
    >
      <BrowserRouter>
        <ThemeContext.Provider value={{ darkMode, setDarkMode }}>
          <ThemeProvider theme={theme}>
            <CssBaseline style={{ backgroundColor: theme.palette.background.default }}>
              <Navbar snackbarOperations={snackbarOperations}></Navbar>
              <Routes>
                <Route path="/" element={<Navigate replace to="/home" />} />
                <Route path="/home" element={<Homepage snackbarOperations={snackbarOperations} />} />
                {/* Conditional routing based on user's loggged in state */}
                {isUserSignedIn() && (
                  <>
                    <Route path="/calories" element={<Calories />} />
                    <Route path="/composition" element={<BodyComposition />} />
                    <Route path="/workout" element={<Workout />} />
                    <Route path="/profile" element={<UserProfile snackbarOperations={snackbarOperations} />} />
                    {userProfile.is_admin && <Route path="/admin" element={<AdminPage snackbarOperations={snackbarOperations} />} />}
                  </>
                )}

              </Routes>
            </CssBaseline>
          </ThemeProvider>
        </ThemeContext.Provider>
      </BrowserRouter>
    </UserContext.Provider >
  );
}

export default App;
