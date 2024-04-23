import { useTheme } from '@emotion/react';
import { Avatar, Box, Button, Container, CssBaseline, Grid, Link, Paper, TextField, ThemeProvider, Typography } from '@mui/material';
import React, { useContext, useRef } from 'react';
import LoginIcon from '@mui/icons-material/Login';
import UserContext from '../context/user'
import useFetch from '../hooks/useFetch';

const Login = (props) => {
    const userCtx = useContext(UserContext);
    const theme = useTheme();
    const usernameRef = useRef();
    const passwordRef = useRef();
    const fetchData = useFetch();

    const handleLogin = () => {
        console.log("login")
    }

    return (
        <>
            <Avatar sx={{ m: 1, marginTop: 6, bgcolor: theme.palette.primary.avatar, color: '#000' }}>
                <LoginIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
                Sign in
            </Typography>
            <Box component="form" noValidate onSubmit={handleLogin} sx={{ mt: 1 }}>
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    variant='standard'
                    id="username"
                    label="Username"
                    name="username"
                    autoComplete="username"
                    color="success"
                    inputRef={usernameRef}
                    autoFocus
                />
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    variant='standard'
                    name="password"
                    label="Password"
                    type="password"
                    id="password"
                    color="success"
                    inputRef={passwordRef}
                    autoComplete="current-password"
                />
                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color='success'
                    sx={{ mt: 3, mb: 2 }}
                >
                    Sign In
                </Button>
                <Grid container justifyContent="flex-end">
                    <Grid item>
                        <Link onClick={() => {
                            userCtx.setShowLogin(false);
                        }} variant="body2" sx={{ color: theme.palette.text.primary }}>
                            {"Don't have an account? Sign Up"}
                        </Link>
                    </Grid>
                </Grid>
            </Box></>
    );
};

export default Login;