import { createTheme } from "@mui/material";

export const lightTheme = createTheme({
    palette: {
        primary: {
            main: '#f6e8ee', // pastel pink
            light: '#f2f0e9', // beige
            dark: '#c9a7bc',
            avatar: '#fce181',
            accent2: '#e9eBf2',
            contrastText: '#7c7c7a',
        },
        background: {
            default: "#e8f6f0", // pastel green
            paper: "#f2f0e9"
        },
        text: {
            primary: 'rgba(0, 0, 0, 0.8)',
            secondary: 'rgba(0, 0, 0, 0.6)',
            disabled: 'rgba(0, 0, 0, 0.38)',
            dark: '#000'
        },
        visualisation: {
            water: '#7C96AB',
            marker_background: '#CCCCCC',
            food: '#A5DD9B',
            measurement: '#FBBBC3'
        }
    },
});

export const darkTheme = createTheme({
    palette: {
        primary: {
            main: '#1F2833',
            dark: '#000',
            light: '#324153', // dark blue
            avatar: '#66FCF1',
            accent2: '#45A29E',
            contrastText: '#e3f2fd'
        },
        background: {
            default: "#080C10",
            paper: "#324153"
        },
        text: {
            primary: '#fff',
            secondary: 'rgba(255, 255, 255, 0.7)',
            disabled: 'rgba(255, 255, 255, 0.5)',
            dark: '#000'
        },
        visualisation: {
            water: '#ADD8E6',
            marker_background: '#CCCCCC',
            food: '#A5DD9B',
            measurement: '#FBBBC3'
        }
    },
});
