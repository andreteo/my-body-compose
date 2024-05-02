import { Button, Container, Grid, Icon, IconButton, Paper } from '@mui/material';
import React, { useEffect, useState } from 'react';
import BluetoothSearchingIcon from '@mui/icons-material/BluetoothSearching';
import { useTheme } from '@emotion/react';
import Metrics from '../services/metrics';

const BodyComposition = (props) => {
    const theme = useTheme()
    const bodyCompositionService = '0000181b-0000-1000-8000-00805f9b34fb';
    const bodyCompositionCharacteristic = '00002a9c-0000-1000-8000-00805f9b34fb';
    const [measurement, setMeasurement] = useState({});

    const handleBluetoothButton = async () => {
        try {
            props.setStartScan(true);
            props.setNewMeasurements(Object.keys(props.composition).reduce((acc, key) => {
                acc[key] = "";
                return acc;
            }, {}))

            const options = {
                filters: [
                    { services: [bodyCompositionService] },
                    { services: [bodyCompositionCharacteristic] }
                ]
            };

            const device = await navigator.bluetooth.requestDevice(options);
            const server = await device.gatt.connect();
            const service = await server.getPrimaryService(bodyCompositionService);
            const characteristic = await service.getCharacteristic(bodyCompositionCharacteristic);
            characteristic.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);
            await characteristic.startNotifications();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleCharacteristicValueChanged = (event) => {
        // Reference: https://github.com/lswiderski/WebBodyComposition
        const value = event.target.value;
        let valueBuffer = new Uint8Array(value.buffer)
        const controlByte = valueBuffer[1];
        const stabilized = controlByte & (1 << 5);
        const weight = ((valueBuffer[12] << 8) + valueBuffer[11]) / 200;
        const impedance = (valueBuffer[10] << 8) + valueBuffer[9];

        setMeasurement({
            weight: weight,
            impedance: impedance
        })

        if (impedance > 0 && impedance < 3000 && stabilized) {
            const metrics = new Metrics(57, impedance, 158, 29, 'male');

            const { bmi,
                idealWeight,
                metabolicAge,
                proteinPercentage,
                lbmCoefficient,
                mbr,
                fat,
                muscleMass,
                boneMass,
                visceralFat,
                waterPercentage,
                bodyType } = metrics.getResult();


            props.setNewMeasurements({
                weight: weight,
                body_mass_index: parseFloat(bmi.value.toFixed(2)),
                ideal_weight: parseFloat(idealWeight.value.toFixed(2)),
                metabolic_age: parseFloat(metabolicAge.value.toFixed(2)),
                protein_percentage: parseFloat(proteinPercentage.value.toFixed(2)),
                basal_metabolism: parseFloat(mbr.value.toFixed(2)),
                body_fat_percentage: parseFloat(fat.value.toFixed(2)),
                muscle_mass: parseFloat(muscleMass.value.toFixed(2)),
                bone_mass: parseFloat(boneMass.value.toFixed(2)),
                visceral_fat: parseFloat(visceralFat.value.toFixed(2)),
                water_percentage: parseFloat(waterPercentage.value.toFixed(2)),
                body_type: props.possibleBodyTypes[bodyType.value].toLowerCase()
            })
            props.setStabilized(true);
        }

    };

    return (
        <Button variant='contained' onClick={handleBluetoothButton}>
            <IconButton onClick={handleBluetoothButton} sx={{ p: 0, color: theme.palette.primary.contrastText }}>
                <BluetoothSearchingIcon />
            </IconButton>
        </Button>
    );
};

export default BodyComposition;