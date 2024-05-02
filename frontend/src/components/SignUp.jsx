import { useTheme } from '@emotion/react';
import { Avatar, Box, Button, Container, CssBaseline, FormControl, Grid, InputLabel, Link, MenuItem, Paper, Select, TextField, Typography } from '@mui/material';
import React, { useContext, useEffect, useRef, useState } from 'react';
import UserContext from '../context/user'
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import { faker } from '@faker-js/faker';
import useFetch from '../hooks/useFetch';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import SnackbarMessage from './SnackbarMessage';
import ImageUpload from './ImageUpload';

const SignUp = (props) => {
    const userCtx = useContext(UserContext);
    const fetchData = useFetch();
    const theme = useTheme();
    const [genderOptions, setGenderOptions] = useState(["male", "female", "non-binary", "non-hexadecimal", "non-decimal"])
    const [userRegistrationState, setUserRegistrationState] = useState({
        "username": "",
        "password": "",
        "email": "",
        "first_name": "",
        "last_name": "",
        "gender": "",
        "date_of_birth": "",
        "height": "",
        "weight": "",
        "phone_number": "",
        "profile_photo": "",
        "bio": "",
        "calorie_goal": "",
        "water_goal": "",
        "weight_goal": ""
    });
    const [upload, setUpload] = useState(true);
    const [photoUpload, setPhotoUpload] = useState(null);

    const generateRandomDateOfBirth = () => {
        const start = new Date(1950, 0, 1);
        const end = new Date(2003, 11, 31);
        return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString().split('T')[0];
    };

    const generateRandomHeight = () => {
        return Math.floor(Math.random() * (220 - 150 + 1)) + 150;
    };

    const generateRandomWeight = () => {
        return Math.floor(Math.random() * (150 - 50 + 1)) + 50;
    };

    const prefillFields = (e) => {
        e.preventDefault();

        setUserRegistrationState({
            "username": faker.internet.userName(),
            "password": "password",
            "email": faker.internet.email(),
            "first_name": faker.person.firstName(),
            "last_name": faker.person.lastName(),
            "gender": faker.helpers.arrayElement(genderOptions),
            "date_of_birth": generateRandomDateOfBirth(),
            "height": generateRandomHeight(),
            "weight": generateRandomWeight(),
            "phone_number": faker.phone.number(),
            "bio": "Placeholder",
            "calorie_goal": 2000,
            "water_goal": 2000,
            "weight_goal": 50
        })
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserRegistrationState(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        for (const key in userRegistrationState) {
            if (!userRegistrationState[key]) {
                alert('Please fill out all required fields.');
                return;
            }
        }

        const outgoingData = { ...userRegistrationState };

        const res = await fetchData("/auth/register", "POST", outgoingData);

        if (!res.ok) {
            alert(`Register failed!: ${res.data}`);
        } else {
            props.snackbarOperations.setSnackbarMessage("Registration Successful!");
            props.snackbarOperations.setSnackbarOpen(true);
            setUserRegistrationState({
                "username": "",
                "password": "",
                "email": "",
                "first_name": "",
                "last_name": "",
                "gender": "",
                "date_of_birth": "",
                "height": "",
                "weight": "",
                "phone_number": "",
                "profile_photo": ""
            });
        }
    };


    return (
        <>
            <SnackbarMessage
                open={props.snackbarOperations.snackbarOpen}
                message={props.snackbarOperations.snackbarMessage}
                vertical="bottom"
                horizontal="center"
                setSnackbarOpen={props.snackbarOperations.setSnackbarOpen}
                setSnackbarMessage={props.snackbarOperations.setSnackbarMessage}>
            </SnackbarMessage>

            <Avatar sx={{ m: 1, marginTop: 6, bgcolor: theme.palette.primary.avatar, color: '#000' }}>
                <AppRegistrationIcon />
            </Avatar>

            <Typography component="h1" variant="h5">
                Sign up
            </Typography>

            <Button
                type="submit"
                variant="contained"
                color="success"
                sx={{ mt: 3, mb: 2 }}
                onClick={prefillFields}
            >
                Pre-fill Fields
            </Button>

            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1, display: "flex", width: 500, flexDirection: "column" }}>
                {Object.keys(userRegistrationState).map((item, idx) => {
                    if (item === 'gender' || item === 'date_of_birth' || item === 'profile_photo' || item === 'password' || item === 'bio') {
                        const itemText = item.includes("_") ? item.replaceAll("_", " ") : item;
                        switch (item) {
                            case 'password':
                                return (
                                    <FormControl key={"formControl" + idx} margin="normal">
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
                                            onChange={handleInputChange}
                                            autoComplete="current-password"
                                        />
                                    </FormControl>
                                )
                            case 'gender':
                                return (
                                    <FormControl key={"formControl" + idx} margin="normal">
                                        <InputLabel id="select-label">Gender</InputLabel>
                                        <Select
                                            id='genderSelect'
                                            labelId='select-label'
                                            label='Gender'
                                            variant='standard'
                                            value={userRegistrationState.gender}
                                            color="success"
                                            onChange={handleInputChange}
                                            name={item}
                                        >
                                            {genderOptions.map((gender, idx) => (
                                                <MenuItem key={"menuitem" + idx} value={gender}>{gender}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                );
                            case 'date_of_birth':
                                return (
                                    <LocalizationProvider key={"dateOfBirth" + idx} dateAdapter={AdapterDayjs}>
                                        <DatePicker
                                            label="Date of birth"
                                            sx={{ marginTop: 3 }}
                                            defaultValue={dayjs(Date.now())}
                                            onChange={(date) => {
                                                const formattedDate = date ? date.toISOString().split('T')[0] : '';
                                                handleInputChange({ target: { name: 'date_of_birth', value: formattedDate } });
                                            }} />
                                    </LocalizationProvider>
                                );
                            case 'bio':
                                return (
                                    <FormControl key={"formControl" + idx} margin="normal">
                                        <TextField
                                            margin="normal"
                                            required
                                            fullWidth
                                            // variant='standard'
                                            name="bio"
                                            label="Write something about yourself :)"
                                            id="bio"
                                            color="success"
                                            onChange={handleInputChange}
                                        />
                                    </FormControl>
                                )
                            default:
                                return null;
                        }
                    } else {
                        const itemText = item.replaceAll("_", " ");
                        return (
                            <FormControl key={"formControl" + idx} margin="normal">
                                <TextField
                                    variant='standard'
                                    color="success"
                                    required
                                    name={item} // Ensure the name attribute is set
                                    label={[itemText.charAt(0).toUpperCase(), itemText.slice(1)].join('')}
                                    id={item}
                                    autoComplete={item}
                                    autoFocus
                                    value={userRegistrationState[item]}
                                    onChange={handleInputChange}
                                />
                            </FormControl>
                        );
                    }
                })}

                <ImageUpload upload={upload} setUpload={setUpload} setPhotoUpload={setPhotoUpload} setUserRegistrationState={setUserRegistrationState} photoKey={"profile_photo"}></ImageUpload>

                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="success"
                    sx={{ mt: 3, mb: 2 }}
                >
                    Sign Up
                </Button>
                <Grid container justifyContent="flex-end">
                    <Grid item>
                        <Link onClick={() => {
                            userCtx.setShowLogin(true);
                        }} variant="body2" sx={{ color: theme.palette.text.primary }}>
                            {"Already have an account? Sign in"}
                        </Link>
                    </Grid>
                </Grid>
            </Box>
        </>
    );

};

export default SignUp;