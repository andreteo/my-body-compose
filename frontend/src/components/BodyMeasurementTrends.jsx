import { Accordion, AccordionDetails, AccordionSummary, Paper, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import useFetch from '../hooks/useFetch';
import { useTheme } from '@emotion/react';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

const BodyMeasurementTrends = (props) => {
    const fetchData = useFetch();
    const theme = useTheme();
    const [daysAgo, setDaysAgo] = useState([]);
    const [compositionHistoricalData, setCompositionHistoricalData] = useState([]);
    const units = {
        'basal_metabolism': 'kcal',
        'body_fat_percentage': '%',
        'bone_mass': 'kg',
        'metabolic_age': 'years',
        'muscle_mass': 'kg',
        'protein_percentage': '%',
        'water_percentage': '%',
        'weight': 'kg'
    }

    const getCompositionHistoricalData = async () => {
        const url = '/user/records/composition';
        const response = await fetchData(url, "GET", undefined, localStorage.getItem('accessToken'));
        const data = response.data;


        if (data.ok) {
            const records = data.user_records;
            const today = Date.now();
            const historicDate = records.date_added;
            const daysAgo = historicDate.map((date_item) => {
                const diff = today - Date.parse(date_item);
                const diffInDays = parseInt(diff / (1000 * 60 * 60 * 24));
                return diffInDays;
            });
            setCompositionHistoricalData(records);
            setDaysAgo(daysAgo);
        }
    };

    useEffect(() => {
        getCompositionHistoricalData();
    }, []);


    return (

        <div>
            <Accordion>
                <AccordionSummary expandIcon={<ArrowDropDownIcon />}>
                    <Typography variant='h3'>Composition Trends</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    {Object.keys(compositionHistoricalData).map((k, idx) => {
                        const data_array = compositionHistoricalData[k];

                        switch (k) {
                            case 'date_added':
                                break;
                            case 'ideal_weight':
                                break;
                            default:
                                return (
                                    <div key={idx}>
                                        <Plot data={[
                                            {
                                                x: daysAgo,
                                                y: data_array,
                                                mode: 'markers',
                                                name: k,
                                                text: data_array,
                                                hoverinfo: 'text',
                                                marker: {
                                                    size: 8,
                                                    color: [...Array(data_array.length).keys()].reverse()
                                                },
                                            }
                                        ]} layout={{
                                            title: {
                                                text: k,
                                                font: {
                                                    color: theme.palette.text.primary
                                                }
                                            },
                                            width: 1000,
                                            paper_bgcolor: theme.palette.background.paper,
                                            plot_bgcolor: theme.palette.background.paper,
                                            xaxis: {
                                                title: {
                                                    text: 'Num Days Ago',
                                                    font: {
                                                        size: 20,
                                                        color: theme.palette.text.primary
                                                    }
                                                },
                                                zerolinecolor: theme.palette.text.primary,
                                                gridcolor: theme.palette.text.primary,
                                                linecolor: theme.palette.text.primary,
                                                tickcolor: theme.palette.text.primary,
                                                tickfont: {
                                                    color: theme.palette.text.primary
                                                }
                                            },
                                            yaxis: {
                                                title: {
                                                    text: units[k],
                                                    font: {
                                                        size: 20,
                                                        color: theme.palette.text.primary
                                                    }
                                                },
                                                zerolinecolor: theme.palette.text.primary,
                                                gridcolor: theme.palette.text.primary,
                                                linecolor: theme.palette.text.primary,
                                                tickcolor: theme.palette.text.primary,
                                                tickfont: {
                                                    color: theme.palette.text.primary
                                                }
                                            }
                                        }}></Plot>
                                    </div>
                                );
                        }
                    })}
                </AccordionDetails>
            </Accordion>

        </div>
    );
};

export default BodyMeasurementTrends;
