import { useTheme } from '@emotion/react';
import { Box, Button, Container, CssBaseline, Grid, Link, TextField, ThemeProvider, Typography } from '@mui/material';
import React, { useRef } from 'react';

const Login = (props) => {
    const theme = useTheme();
    const usernameRef = useRef();
    const passwordRef = useRef();

    const handleLogin = () => {
        console.log("login")
    }

    return (
        <Container component="main" maxWidth="lg">
            <CssBaseline>
                <Box
                    sx={{
                        marginTop: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Typography component="h1" variant="h5">
                        Sign in
                    </Typography>
                    <Box component="form" onSubmit={handleLogin} noValidate sx={{ mt: 1 }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="username"
                            label="Username"
                            name="username"
                            autoComplete="username"
                            inputRef={usernameRef}
                            autoFocus
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            inputRef={passwordRef}
                            autoComplete="current-password"
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                        >
                            Sign In
                        </Button>
                        <Grid container justifyContent="flex-end">
                            <Grid item>
                                <Link onClick={() => {
                                    console.log("showLogin(false)")
                                    // props.setShowLogin(false);
                                }} variant="body2">
                                    {"Don't have an account? Sign Up"}
                                </Link>
                            </Grid>
                            {/* {props.setShowLogin && (
                                    <>
                                        <Grid item>
                                            <Link onClick={() => {
                                                props.setShowLogin(false);
                                            }} variant="body2">
                                                {"Don't have an account? Sign Up"}
                                            </Link>
                                        </Grid>
                                    </>
                                )} */}
                        </Grid>
                    </Box>
                </Box>
            </CssBaseline>
        </Container>
    );
};

export default Login;