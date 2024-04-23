import React, { useState } from 'react';
import { Avatar, Box, Button, FormControl, Grid, IconButton, TextField } from '@mui/material';
import FileUploadIcon from "@mui/icons-material/FileUpload";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CancelIcon from "@mui/icons-material/Cancel";

const ImageUpload = (props) => {
    const [profilePic, setProfilePic] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [displayFileName, setDisplayFileName] = useState("");

    const handleFileChange = (event) => {
        const file = event.target.files[0];

        if (!file) {
            return;
        }

        if (file.type !== 'image/png' && file.type !== 'image/jpeg') {
            alert('Please upload a PNG or JPG image.');
            return;
        }

        setDisplayFileName(file.name);

        const reader = new FileReader();

        reader.onload = () => {
            // const fileData = reader.result;
            // const blob = new Blob([fileData], { type: file.type });
            const fileData = new Uint8Array(reader.result);

            props.setPhotoUpload(fileData);
            // Now you can upload the blob to your server
            // Example:
            // uploadBlob(blob);
            // Make sure to implement the uploadBlob function to handle the upload to your server
        };

        reader.readAsArrayBuffer(file);
    };



    return (
        <Box>
            <div>{selectedFile}</div>
            {!props.upload && (
                <Button
                    type="submit"
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                    onClick={() => {
                        props.setUpload(true);
                    }}
                >
                    Change Profile Pic
                </Button>
            )}

            {props.upload && (
                <TextField
                    value={displayFileName ? displayFileName : ""}
                    label="Upload Profile Picture"
                    variant='standard'
                    color='success'
                    fullWidth
                    InputProps={{
                        readOnly: true,
                        startAdornment: (
                            <IconButton component="label">
                                <AttachFileIcon />
                                <input
                                    type="file"
                                    hidden
                                    onChange={handleFileChange}
                                />
                            </IconButton>
                        ),
                    }}
                />
            )}

            {!props.upload && (
                <Grid container gap={2} sx={{ margin: "1rem" }}>
                    <Button
                        xs={6}
                        variant="contained"
                        color="primary"
                        startIcon={<FileUploadIcon />}
                        // onClick={handleSubmit}
                        onClick={() => console.log("submit")}
                    >
                        Upload
                    </Button>
                    <Button
                        xs={6}
                        variant="contained"
                        color="error"
                        startIcon={<CancelIcon />}
                        onClick={() => console.log("cancel")}
                    >
                        Cancel
                    </Button>
                </Grid>
            )}
        </Box>

    );
};

export default ImageUpload;