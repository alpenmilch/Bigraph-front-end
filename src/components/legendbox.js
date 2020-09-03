import React from 'react';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import ColorPicker from "./colorpicker";
import Grid from "@material-ui/core/Grid";
const style = {
    box:{
        width:100,
        height:40,
    }
}

export default function LegendBox(props){
    const [state, setState] = React.useState({
        checked: false,
    });

    const handleCheck = (event) => {
        setState({ checked: event.target.checked });
        props.onChange(props.label,event.target.checked);
    };

    const handleSelect = (color) => {
        props.onSelect(props.label, color)
    }

    return(
        <Grid container direction='row' alignItems='center' justify="space-between">
            <Grid>
                <FormControlLabel style={style.box} control={<Checkbox checked={state.checked} onChange={handleCheck} color="primary" />} label={props.label}/>
            </Grid>
            <Grid>
                <ColorPicker color={props.color} onChange={handleSelect}/>
            </Grid>
        </Grid>
    );
}