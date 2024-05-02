import React, { useEffect, useState } from 'react';
import { Typography, Grid, Accordion, AccordionDetails, AccordionSummary, Box, IconButton, FormControl, TextField, Button } from "@mui/material";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useTheme } from '@emotion/react';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import useFetch from '../hooks/useFetch';
import BodyComposition from './BodyComposition';


const BodyMeasurementAccordion = (props) => {
    const theme = useTheme();
    const fetchData = useFetch();
    const possibleBodyTypes = ['Obese', 'Overweight', 'Thick-set', 'Lacks Exercise', 'Balanced', 'Balanced Muscular', 'Skinny', 'Balanced Skinny', 'Skinny Muscular'];

    const [showMeasurementForm, setShowMeasurementForm] = useState(false);
    const [newMeasurements, setNewMeasurements] = useState({})
    const [stabilized, setStabilized] = useState(false);
    const [startScan, setStartScan] = useState(false);

    useEffect(() => {
        setNewMeasurements(Object.keys(props.composition).reduce((acc, key) => {
            acc[key] = "";
            return acc;
        }, {}))
    }, [props.composition])

    const handleMeasurementIconClick = () => {
        setShowMeasurementForm((prevState) => !prevState);
    }

    const handleMeasurementChange = (e) => {
        const { name, value } = e.target;
        setNewMeasurements(prevState => ({
            ...prevState,
            [name]: name === 'body_type' ? value : parseFloat(value)
        }));
    }

    const handleMeasurementSubmit = async (event) => {
        event.preventDefault();

        const outgoingData = JSON.parse(JSON.stringify(newMeasurements));
        outgoingData.record_type = "compositions";

        Object.keys(outgoingData).forEach(key => {
            if (key.includes('_id')) {
                delete outgoingData[key];
            }
        });

        console.log(outgoingData)

        const res = await fetchData("/user/records/insert", "PUT", outgoingData, localStorage.getItem('accessToken'));

        if (!res.ok) {
            alert(`Register failed!: ${res.data}`);
        } else {
            props.snackbarOperations.setSnackbarMessage("Save Composition Successful!");
            props.snackbarOperations.setSnackbarOpen(true);
            props.getUserRecords('compositions');
            setNewMeasurements(Object.keys(props.composition).reduce((acc, key) => {
                acc[key] = "";
                return acc;
            }, {}))
            setShowMeasurementForm(false);
            setStartScan(false);
            setStabilized(false);
        }
    }


    return (
        <>
            <Grid container>
                <Grid item xs={10}>
                    <Typography variant='h4' sx={{ p: 2, textAlign: 'center', justifyContent: 'center' }}>
                        Today's Measurements
                    </Typography>
                    {(startScan && !stabilized) && (
                        <Typography variant='h5' sx={{ p: 2, textAlign: 'start', justifyContent: 'center' }}>
                            Scanning...
                        </Typography>
                    )}
                    {(stabilized) && (
                        <Typography variant='h5' sx={{ p: 2, textAlign: 'start', justifyContent: 'center' }}>
                            Scan Comlete... Please Save
                        </Typography>
                    )}
                </Grid>
                <Grid item xs={2} sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton onClick={handleMeasurementIconClick}>
                        {showMeasurementForm ? <RemoveIcon /> : <AddIcon />}
                    </IconButton>
                </Grid>
                {showMeasurementForm && (
                    <Box xs={12} sx={{ display: 'flex', justifyContent: 'space-evenly', gap: 2, mb: 2 }}>
                        <Button variant='contained' color='success' onClick={handleMeasurementSubmit}>
                            Save
                        </Button>
                        <Button variant='contained' color='error' onClick={handleMeasurementIconClick}>
                            Cancel
                        </Button>
                        <BodyComposition
                            newMeasurements={newMeasurements}
                            setNewMeasurements={setNewMeasurements}
                            setStabilized={setStabilized}
                            setStartScan={setStartScan}
                            composition={props.composition}
                            possibleBodyTypes={possibleBodyTypes}
                        />

                    </Box>
                )}
            </Grid>


            {Object.entries(props.composition).map(([k, v], idx) => {
                if (k.includes('_id')) return null;
                const handleKeyText = k.replaceAll('_', " ");
                const handleKeyTextToo = handleKeyText.split(" ").map(word => {
                    return word.charAt(0).toUpperCase() + word.slice(1);
                }).join(" ");

                let unit = "";
                let detailText = "";

                if (k.includes('bone')) {
                    unit = "kg";
                    detailText = "Bone mass refers to the weight of bones in your body. It's an important indicator of bone health and density. Eat more high-calcium foods, sunbathe and exercise for 15-20 minutes every day."
                }
                else if (k.includes('muscle')) {
                    unit = "kg";
                    detailText = "Muscle mass refers to the mass of skeletal and smooth muscles in your body. Loss of muscle mass will result in a lower basal metabolism and reduce energy consumption, and you'll gain weight or fall ill more easily. Getting more muscles is helpful to improve basal metabolism so as to reduce body fat."
                } else if (k.includes('fat')) {
                    unit = "%";
                    detailText = "Body fat refers to the proportion of fat in total body eight. In addition to obesity, high body fat ratio can also increase the prevalance of many obesity related diseases; while low body fat ratio may cause endocrine disorders."
                }
                else if (k.includes('protein')) {
                    unit = "%";
                    detailText = "Protein is an essential macronutrient that plays a crucial role in building and repairing tissues, producing enzymes and hormones, and supporting immune function."
                } else if (k.includes('water')) {
                    unit = "%";
                    detailText = "Water refers to the overall share of water in your body, including the water in your blood, lymph and other bodily fluids. If you are losing weight, you should pay special attention to water consumption to avoid dehydration. The measurements which are taken right after showering, alcohol consumption or workout might not be accurate."
                } else if (k.includes('basal')) {
                    unit = "kcal";
                    detailText = "Basal metabolism reers to the lowerst energy requierd to maintain basic life activities. Basal metabolic rate is determined by how much energy is consumed by muscle mass. People with higher basal metaboic rate don't gain weight easily. You can keep fit and eat more meat, fish, soy and dairy products to increase muscle mass."
                } else if (k.includes('mass_index')) {
                    unit = "";
                    detailText = `
                    BMI: weight(kg)/height(m)**2.     
                    You can't judge if you're obese just by my BMI value. People can have more fat than muscle with a normal BMI and still be classified as obese.
                    `;
                } else {
                    unit = "";
                    detailText = "";
                }


                return (
                    <div key={idx}>
                        <Accordion>
                            <AccordionSummary expandIcon={<ArrowDropDownIcon />}>
                                <Grid container gap={1} sx={{ display: 'flex', justifyContent: "space-between", alignItems: 'center', pr: 2 }}>
                                    <Grid item xs={6}>
                                        <Typography variant="body1">
                                            {handleKeyTextToo}
                                        </Typography>
                                    </Grid>
                                    {!showMeasurementForm && (
                                        <Grid item xs={4}>
                                            <Typography variant="body1" sx={{ color: v === 'Not measured' ? theme.palette.text.disabled : theme.palette.text.primary, fontWeight: 'bold' }}>
                                                {v + " " + unit}
                                            </Typography>
                                        </Grid>
                                    )}
                                    {startScan && (
                                        <Grid item xs={4}>
                                            <Typography variant="body1" sx={{ color: v === 'Not measured' ? theme.palette.text.disabled : theme.palette.text.primary, fontWeight: 'bold' }}>
                                                {newMeasurements[k]}
                                            </Typography>
                                        </Grid>
                                    )}
                                    {showMeasurementForm && (
                                        <>
                                            <Grid item xs={4}>
                                                <FormControl>
                                                    <TextField
                                                        variant='standard'
                                                        color='success'
                                                        name={k}
                                                        label=""
                                                        id={k}
                                                        autoFocus
                                                        onChange={handleMeasurementChange}
                                                        value={newMeasurements.k}>

                                                    </TextField>
                                                </FormControl>
                                            </Grid>
                                        </>
                                    )}
                                </Grid>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Grid container>
                                    {!k.includes('body_type') && (
                                        <Grid item xs={12}>
                                            <Typography variant='body2' sx={{ pl: 2 }}>
                                                {detailText}
                                            </Typography>
                                        </Grid>
                                    )}
                                    {k.includes('body_type') && (
                                        <>
                                            {possibleBodyTypes.map((type, idx) => (
                                                <Grid item xs={4} key={idx} sx={{ width: '5rem', height: '5rem', justifyContent: 'center', alignItems: 'center' }}>
                                                    <Typography variant={v === type.toLowerCase() ? 'h6' : 'body2'} sx={{
                                                        pl: 2,
                                                        color: v === type.toLowerCase() ? 'green' : theme.palette.text.primary,
                                                        fontWeight: v === type.toLowerCase() ? 'bold' : null,
                                                    }}>
                                                        {type}
                                                    </Typography>
                                                </Grid>
                                            ))}
                                        </>
                                    )}
                                </Grid>
                            </AccordionDetails>
                        </Accordion>
                    </div>
                )

            })}

        </>
    );
};

export default BodyMeasurementAccordion;
