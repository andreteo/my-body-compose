import React, { useContext, useState } from 'react';
import Navbar from './Navbar';
import Dashboard from './Dashboard';
import UserContext from '../context/user'
import Login from './Login';
import SignUp from './SignUp';
import AuthUser from './AuthUser';


const Homepage = () => {
    const userCtx = useContext(UserContext);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const snackbarOperations = {
        snackbarOpen: snackbarOpen,
        setSnackbarOpen: setSnackbarOpen,
        snackbarMessage: snackbarMessage,
        setSnackbarMessage: setSnackbarMessage
    }

    return (
        <div>
            {userCtx.isSignedIn ? <Dashboard></Dashboard> : <AuthUser snackbarOperations={snackbarOperations}></AuthUser>}
        </div>
    );
};

export default Homepage;