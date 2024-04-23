import React, { useContext } from 'react';
import UserContext from '../context/user'
import Login from './Login';
import SignUp from './SignUp';
import { Container, CssBaseline, Paper, useTheme } from '@mui/material';

const AuthUser = (props) => {
    const theme = useTheme();
    const userCtx = useContext(UserContext);

    return (
        <Container component="main" maxWidth="lg">
            <CssBaseline>
                <Paper sx={{
                    margin: "1rem",
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: 5,
                    backgroundColor: theme.palette.background.paper
                }}>
                    {userCtx.showLogin ? <Login snackbarOperations={props.snackbarOperations}></Login> : <SignUp snackbarOperations={props.snackbarOperations}></SignUp>}
                </Paper>
            </CssBaseline>
        </Container>
    );
};

export default AuthUser;