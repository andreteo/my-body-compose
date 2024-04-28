import { useTheme } from '@emotion/react';
import { Box, Button, FormControl, Grid, Icon, IconButton, Paper, SvgIcon, TextField, Typography } from '@mui/material';
import React, { useContext, useRef, useState } from 'react';
import Plot from 'react-plotly.js';
import WeightSVG from '../media/WeightSVG';
import UserContext from '../context/user'
import useFetch from '../hooks/useFetch';
import SnackbarMessage from './SnackbarMessage';


const UserGoalsPie = (props) => {
    const userCtx = useContext(UserContext);
    const fetchData = useFetch();
    const theme = useTheme();
    const paper_bg = theme.palette.background.paper;
    const [h, w] = [400, 400];
    const font_size_title = 14;
    const font_size_annotation = 16;
    const goals = [
        { type: 'water', title: 'Water Tank' },
        { type: 'calorie', title: 'Calorie Budget' }
    ];
    const [inputField, setInputField] = useState(false);
    const [inputFieldToEdit, setInputFieldToEdit] = useState('');
    const hydrationRef = useRef();
    const calorieRef = useRef();
    const foodRef = useRef();

    const insertCalorieRecord = async () => {
        const req = {
            "record_type": "calories",
            "food_item": foodRef.current.value,
            "calories_consumed": calorieRef.current.value
        }

        const res = await fetchData("/user/records/insert", "PUT", req, localStorage.getItem('accessToken'));

        if (!res.ok) {
            alert(`Insert calories failed!: ${res.data}`);
        } else {
            props.snackbarOperations.setSnackbarMessage("Calorie Intake Saved!");
            props.snackbarOperations.setSnackbarOpen(true);
            foodRef.current.value = 0;
            props.getUserRecords('calories');
            setInputField(false);
        }
    }

    const insertHydrationRecord = async () => {
        const req = {
            "record_type": "hydration",
            "water_consumed_milli_litres": hydrationRef.current.value
        }

        const res = await fetchData("/user/records/insert", "PUT", req, localStorage.getItem('accessToken'));

        if (!res.ok) {
            alert(`Insert hydration failed!: ${res.data}`);
        } else {
            props.snackbarOperations.setSnackbarMessage("Water Intake Saved!");
            props.snackbarOperations.setSnackbarOpen(true);
            hydrationRef.current.value = 0;
            props.getUserRecords('hydration');
            setInputField(false);
        }
    }


    const createDataAndLayout = (goalType, goalTitle) => {
        const data = [
            {
                values: [props.userCurrentGoals[`${goalType}_goal`], (props.userMaxGoals[`${goalType}_goal`] - props.userCurrentGoals[`${goalType}_goal`])],
                labels: ['Consumed', 'Outstanding'],
                domain: { row: 0 },
                type: 'pie',
                hole: .6,
                textinfo: 'label+value',
                automargin: true,
                marker: {
                    colors: [goalType === 'water' ? theme.palette.visualisation.water : theme.palette.visualisation.food, theme.palette.visualisation.marker_background]
                }
            }
        ];

        const layout = {
            title: goalTitle,
            font: {
                size: font_size_title
            },
            font: {
                size: font_size_annotation,
                color: theme.palette.text.primary
            },
            annotations: [
                {
                    showarrow: false,
                    text: goalType === 'water' ? props.userMaxGoals[`${goalType}_goal`] + ' ml' : props.userMaxGoals[`${goalType}_goal`] + ' kcal',
                    x: 0.5,
                    y: 0.5
                }
            ],
            showlegend: false,
            height: h,
            width: w,
            paper_bgcolor: paper_bg
        };

        return { data, layout };
    };

    return (
        <Grid container gap={5}>
            <SnackbarMessage
                open={props.snackbarOperations.snackbarOpen}
                message={props.snackbarOperations.snackbarMessage}
                vertical="bottom"
                horizontal="center"
                setSnackbarOpen={props.snackbarOperations.setSnackbarOpen}
                setSnackbarMessage={props.snackbarOperations.setSnackbarMessage}>
            </SnackbarMessage>
            <Grid item xs={12} sx={{ p: 3, display: 'flex', justifyContent: 'space-around' }}>
                {inputField && inputFieldToEdit === 'hydration' && (<Box>
                    <FormControl sx={{ mr: 2 }}>
                        <TextField
                            name="hydration_form"
                            label="Amount Consumed"
                            id="hydration_form"
                            color="success"
                            inputRef={hydrationRef}
                        />
                    </FormControl>
                    <Button sx={{ mr: 1 }} variant='contained' color='success' onClick={insertHydrationRecord}>Submit</Button>
                    <Button variant='outlined' color='error' onClick={() => { setInputField(false) }}>Cancel</Button>
                </Box>)}

                {inputField && inputFieldToEdit === 'calories' && (<Box>
                    <FormControl sx={{ mr: 2 }}>
                        <TextField
                            name="calorie_form"
                            label="Calories Consumed"
                            id="calorie_form"
                            color="success"
                            inputRef={calorieRef}
                        />
                        <TextField
                            name="food_form"
                            label="Food Item"
                            id="food_form"
                            color="success"
                            inputRef={foodRef}
                        />
                    </FormControl>
                    <Button sx={{ mr: 1 }} variant='contained' color='success' onClick={insertCalorieRecord}>Submit</Button>
                    <Button variant='outlined' color='error' onClick={() => { setInputField(false); }}>Cancel</Button>
                </Box>)}

                {!inputField && (
                    <>
                        <Button variant='contained' size='large' sx={{ backgroundColor: theme.palette.visualisation.water, color: theme.palette.text.dark }} onClick={() => { setInputField(true); setInputFieldToEdit('hydration') }}>
                            I drank
                        </Button>
                        <Button variant='contained' size='large' sx={{ backgroundColor: theme.palette.visualisation.food, color: theme.palette.text.dark }} onClick={() => { setInputField(true); setInputFieldToEdit('calories') }}>I ate</Button>
                    </>
                )}
            </Grid>
            {goals.map(goal => {
                const { data, layout } = createDataAndLayout(goal.type, goal.title);
                return (
                    <Grid key={goal.type} item xs={4}>
                        <Plot data={data} layout={layout} />
                    </Grid>
                )
            })}
            <Grid item xs={3}>
                <Box>
                    <Typography m={3} variant='h5' sx={{ color: theme.palette.text.primary, textAlign: 'center' }}>Ideal Weight</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', paddingTop: 4 }}>
                        <WeightSVG fillColor={theme.palette.text.primary} fontSize={70}>{props.userMaxGoals.weight_goal + ' kg'}</WeightSVG>
                        <svg viewBox="0 0 512 512" width="200" height="200">
                            <use xlinkHref="#weight-light" fill={theme.palette.text.primary} />
                        </svg>
                    </Box>
                </Box>
            </Grid>
        </Grid>
    );
};


export default UserGoalsPie;
