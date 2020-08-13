import React from "react";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import FormGroup from "@material-ui/core/FormGroup";
import LegendBox from "./legendbox";

export default function LegendGroup(props){

    return(
        <FormGroup>
            {props.legends.map(d=> d? <LegendBox label={d.label} color={d.color} onChange={props.onChange}/>:null)}
        </FormGroup>
    );
}