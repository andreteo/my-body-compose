import { Accordion, AccordionDetails, AccordionSummary, Avatar, Button, Container, Grid, IconButton, Paper, Typography } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import useFetch from '../hooks/useFetch';
import UserContext from '../context/user';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { useTheme } from '@emotion/react';
import SnackbarMessage from './SnackbarMessage';


const AdminPage = (props) => {
    const userCtx = useContext(UserContext);
    const fetchData = useFetch();
    const theme = useTheme();
    const [allUsers, setAllUsers] = useState([]);
    const [allProfiles, setAllProfiles] = useState([]);
    const [makeAdmin, setMakeAdmin] = useState(false);

    const getAllUserProfiles = async () => {
        const userProfiles = await fetchData('/user/users', 'GET', undefined, localStorage.getItem('accessToken'));
        const res = userProfiles.data;

        if (res.ok) {
            setAllProfiles(res.profiles);
            setAllUsers(res.users);
        } else {
            alert(JSON.stringify(userPhotos.data));
        }
    }

    const capitalizeFirstLetter = (someString) => {
        return someString.charAt(0).toUpperCase() + someString.slice(1);
    }

    const handleToggleMakeAdminButton = async (userId) => {
        const req = {
            "user_id": userId
        }
        const makeAdmin = await fetchData('/user/privileges/admin', 'POST', req, localStorage.getItem('accessToken'));
        const res = makeAdmin.data;

        if (res.ok) {
            const newAdminStatus = res.user_profile.is_admin;
            const userNameInModeration = capitalizeFirstLetter(res.user_profile.first_name) + capitalizeFirstLetter(res.user_profile.last_name)
            setMakeAdmin(newAdminStatus);
            getAllUserProfiles();
            const msg = newAdminStatus ? userNameInModeration + " is now an Admin!" : userNameInModeration + " is removed from Admin list"
            props.snackbarOperations.setSnackbarMessage(msg)
            props.snackbarOperations.setSnackbarOpen(true);
        }
    };

    const handleDeleteUser = async (userId) => {
        const req = {
            "user_id": userId
        }
        const deleteUser = await fetchData('/user/privileges/delete', 'POST', req, localStorage.getItem('accessToken'));
        const res = deleteUser.data;

        if (res.ok) {
            props.snackbarOperations.setSnackbarMessage("Account Deleted")
            props.snackbarOperations.setSnackbarOpen(true);
            getAllUserProfiles();
        }
    };

    useEffect(() => {
        getAllUserProfiles();
    }, [])

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper sx={{
                padding: 2,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'start',
                gap: 2
            }}>
                <Typography variant='h2'>Admin Page</Typography>
                <Typography variant='h4'>Hello, {capitalizeFirstLetter(userCtx.userProfile.first_name)}</Typography>

                <SnackbarMessage
                    open={props.snackbarOperations.snackbarOpen}
                    message={props.snackbarOperations.snackbarMessage}
                    vertical="bottom"
                    horizontal="center"
                    setSnackbarOpen={props.snackbarOperations.setSnackbarOpen}
                    setSnackbarMessage={props.snackbarOperations.setSnackbarMessage}>
                </SnackbarMessage>

                {Object.entries(allUsers).map((user, idx) => {
                    const userObj = user[1];
                    const profileIdx = allProfiles.findIndex(item => userObj.profile_id === item.profile_id);
                    const userProfile = allProfiles[profileIdx];

                    return (
                        <>
                            <Grid container gap={1} sx={{ display: 'flex', justifyContent: 'start', pr: 2 }}>
                                <Grid item>
                                    <Typography variant='h5'>
                                        {capitalizeFirstLetter(userProfile.first_name) + " " + capitalizeFirstLetter(userProfile.last_name)}
                                    </Typography>
                                    {userProfile['is_admin'] &&
                                        <Typography variant='h6' sx={{ fontWeight: 'bold', color: 'red' }}>
                                            Administrator
                                        </Typography>}
                                    <Typography variant='body1'>
                                        {userObj.email}
                                    </Typography>
                                </Grid>
                                <Grid item>
                                    {userProfile.profile_photo && (
                                        <Avatar sx={{ width: 75, height: 75, objectFit: "contain" }} src={"data:image/jpeg;base64," + userProfile.profile_photo} alt='user profile photo'>
                                        </Avatar>
                                    )}
                                    {!userProfile.profile_photo && (
                                        <Avatar alt="User Avatar" sx={{ backgroundColor: theme.palette.primary.avatar, color: theme.palette.text.primary }} />
                                    )}

                                </Grid>
                                <Grid container item xs={12} sx={{ display: 'flex', justifyContent: 'end' }}>
                                    {/* Disable remove admin for andreteo because of reasons */}
                                    {userObj.username !== 'andreteo' && (
                                        <>
                                            <Typography variant='body2'>Make admin?</Typography>
                                            <IconButton onClick={() => { handleToggleMakeAdminButton(userObj.user_id) }}>
                                                {userProfile['is_admin'] && <CheckBoxIcon />}
                                                {!userProfile['is_admin'] && <CheckBoxOutlineBlankIcon />}
                                            </IconButton>
                                        </>
                                    )}
                                    <Button variant='contained' color='error' onClick={() => { handleDeleteUser(userObj.user_id) }}>
                                        Delete
                                    </Button>
                                </Grid>
                            </Grid>
                        </>
                        // <Accordion key={idx} sx={{ width: '100%' }}>
                        //     <AccordionSummary expandIcon={<ArrowDropDownIcon />}>

                        //     </AccordionSummary>
                        // </Accordion>

                    )
                })}

            </Paper>
        </Container>
    );
};

export default AdminPage;