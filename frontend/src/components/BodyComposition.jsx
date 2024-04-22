import { Container, Grid, IconButton, Paper } from '@mui/material';
import React, { useEffect, useState } from 'react';
import BluetoothIcon from '@mui/icons-material/Bluetooth';
import { useTheme } from '@emotion/react';

const BodyComposition = (props) => {
    const theme = useTheme()
    const bodyCompositionService = '0000181b-0000-1000-8000-00805f9b34fb';
    const bodyCompositionCharacteristic = '00002a9c-0000-1000-8000-00805f9b34fb';
    const [measurement, setMeasurement] = useState({});
    const [startScan, setStartScan] = useState(false);

    const handleBluetoothButton = async () => {
        try {
            setStartScan(true);

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


            setMeasurement({
                weight: weight,
                impedance: impedance,
                bmi: bmi.value.toFixed(2),
                idealWeight: idealWeight.value.toFixed(2),
                metabolicAge: metabolicAge.value.toFixed(2),
                proteinPercentage: proteinPercentage.value.toFixed(2),
                lbmCoefficient: lbmCoefficient.value.toFixed(2),
                mbr: mbr.value.toFixed(2),
                fat: fat.value.toFixed(2),
                muscleMass: muscleMass.value.toFixed(2),
                boneMass: boneMass.value.toFixed(2),
                visceralFat: visceralFat.value.toFixed(2),
                waterPercentage: waterPercentage.value.toFixed(2),
                bodyType: bodyType.value
            })
        }

    };

    useEffect(() => {
        console.log(measurement)
    }, [measurement])

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Grid container spacing={3}>
                {/* Chart */}

                <Grid item xs={12} md={8} lg={9}>

                    <Paper
                        sx={{
                            p: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            height: 240,
                        }}
                    >
                        test
                        <IconButton onClick={handleBluetoothButton} sx={{ p: 0, color: theme.palette.primary.contrastText }}>
                            <BluetoothIcon />
                        </IconButton>

                    </Paper>
                </Grid>

            </Grid>
        </Container>
    );
};

export default BodyComposition;