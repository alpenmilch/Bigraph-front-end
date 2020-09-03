import React from 'react';
import index from '../data/id.json';
import { withRouter } from 'react-router-dom';
import GraphCard from "./graphcard";
import withStyles from "@material-ui/core/styles/withStyles";
import {connect} from "react-redux";
import {uploadAction} from "../store/action";

const styles = {
    root: {
        marginTop: 30,
        marginLeft:50,
        marginRight:50,
        display: 'flex',
        flexDirection: 'row',
        flexWrap:'wrap',
        justifyContent:'flex-start'
    },
    item:{
        marginWidth: 20,
        paddingLeft:10,
        paddingRight:10,
        paddingTop:10,
        paddingBottom:10
    }
};


class Gallery extends React.Component{
    constructor(props){
        super(props);
    }
    Change(event){
        if (event.target){
            const name = event.target.values || event.target.parentNode.value
            const data = require('../data/'+name)
            this.props.change(name,data)
            this.props.history.push('/graph')
        }
    }

    render(){
        const {classes} = this.props;
        return(
            <div className={classes.root} onClick={this.Change.bind(this)}>
                {index.data.map((d)=><div className={classes.item}><GraphCard title={d.name}/></div>)}
            </div>
        )
    }
}

function mapDispatchToProps(dispatch) {
    return {
        change: (n,d) => {return dispatch(uploadAction(n,d))}
    }
}


export default connect(
    null,
    mapDispatchToProps
)(withStyles(styles) (withRouter(Gallery)));