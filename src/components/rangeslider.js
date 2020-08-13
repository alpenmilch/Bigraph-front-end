import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Slider from '@material-ui/core/Slider';

const useStyles = makeStyles({
    root: {
        width: 250,
    },
});

function valuetext(value) {
    return `${value}`;
}

export default function RangeSlider(props) {

    const classes = useStyles();
    const [value, setValue] = React.useState([-1, -1]);

    const handleChange = (event, newValue) => {
        setValue(newValue);
        props.onChange(value);
    };

    return (
        <div className={classes.root}>
            <Typography id="range-slider" gutterBottom>
                Depth Range
            </Typography>
            <Slider
                value={value}
                onChange={handleChange}
                valueLabelDisplay="auto"
                max={props.max}
                min={-1}
                aria-labelledby="range-slider"
                getAriaValueText={valuetext}
                disabled={props.disabled}
            />
        </div>
    );
}