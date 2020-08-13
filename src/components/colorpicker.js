import React from "react";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import { ChromePicker } from 'react-color'
import {withStyles} from "@material-ui/core";



export default function ColorPicker(props){
    const [state, setState] = React.useState({
        display: false,
        color: props.color,
    });

    const style = {
        root:{
            alignContent:'space-around',
        },
        button:{
            padding: '5px',
            background: '#fff',
            borderRadius: '1px',
            boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
            alignItems:'center',
        },
        color:{
            width: '36px',
            height: '18px',
            borderRadius: '2px',
            background: state.color,
        },
        pop:{
            position: 'absolute',
            zIndex:2
        }
    }

    const handleClick = () => {
        setState({ display: !state.display, color: state.color})
    };

    const handleClose = () => {
        setState({ display: false, color: state.color})
    };

    const handleChange = (color) => {
        setState({display:true, color: color.hex })
        props.onChange(color.hex);
    };

    return(
        <div style={style.root}>
            <div style={style.button} backgroud={state.color} onClick={ handleClick }>
                <div style={ style.color } />
            </div>
            {
                state.display ?
                    <div style={ style.pop }>
                        <ChromePicker color={ state.color } onChange={ handleChange } />
                    </div>
                    : null
            }

        </div>
    );
}