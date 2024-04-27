import React, { useContext } from 'react';
import Dashboard from './Dashboard';
import UserContext from '../context/user'
import AuthUser from './AuthUser';


const Homepage = (props) => {
    // On first render (i.e user is not logged in), Homepage displays AuthUser (Log in/Sign up page)
    const userCtx = useContext(UserContext);

    return (
        <div>
            {userCtx.isSignedIn ? <Dashboard snackbarOperations={props.snackbarOperations}></Dashboard> : <AuthUser snackbarOperations={props.snackbarOperations}></AuthUser>}
        </div>
    );
};

export default Homepage;