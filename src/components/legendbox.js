import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';


export default function LegendBox(props){
    const [state, setState] = React.useState({
        checked: false,
    });

    const handleChange = (event) => {
        setState({ checked: event.target.checked });
        props.onChange(props.label,event.target.checked);
    };

    return(
        <div>
            <FormControlLabel control={<Checkbox checked={state.checked} onChange={handleChange} color="primary" />} label={props.label}/>
        </div>
    );
}