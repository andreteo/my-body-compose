import React, { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import { lightTheme, darkTheme } from './components/ColourTheme'
import { CssBaseline } from "@mui/material";
import Homepage from "./components/Homepage";
import Calories from "./components/Calories";
import BodyComposition from "./components/BodyComposition";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import UserContext from "./context/user";

export const ThemeContext = React.createContext();

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [theme, setTheme] = useState(lightTheme);
  const [accessToken, setAccessToken] = useState("");
  const [role, setRole] = useState("");
  const [showLogin, setShowLogin] = useState(true);
  const [userProfile, setUserProfile] = useState({});
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    accessToken.length !== 0 ? setIsSignedIn(true) : setIsSignedIn(false);
  }, [accessToken.length]);

  useEffect(() => {
    darkMode ? setTheme(darkTheme) : setTheme(lightTheme);
  }, [darkMode])

  return (
    <UserContext.Provider
      value={{
        accessToken,
        setAccessToken,
        role,
        setRole,
        userProfile,
        setUserProfile,
        isSignedIn,
        setIsSignedIn,
        showLogin,
        setShowLogin
      }}
    >
      <BrowserRouter>
        <ThemeContext.Provider value={{ darkMode, setDarkMode }}>
          <ThemeProvider theme={theme}>
            <CssBaseline style={{ backgroundColor: theme.palette.background.default }}>
              <Navbar></Navbar>
              <Routes>
                <Route path="/" element={<Homepage />} />
                <Route path="/calories" element={<Calories />} />
                <Route path="/composition" element={<BodyComposition />} />
              </Routes>
            </CssBaseline>
          </ThemeProvider>
        </ThemeContext.Provider>
      </BrowserRouter>
    </UserContext.Provider >
  );
}

export default App;
