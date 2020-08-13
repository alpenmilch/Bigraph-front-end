import React from "react"
import {Toolbar, AppBar, Typography, Button, withStyles} from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Bigraph from "./bigraph";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import {ExpandMoreOutlined, GetApp, Publish} from '@material-ui/icons';
import RangeSlider from "./rangeslider";
import LegendGroup from "./legendgroup";
import tpdata from '../1.json'
import convert from "../utils/jsonconvert";
import d3ToPng from "d3-svg-to-png";


const style = {
    container:{
        minWidth:1000,
    },
    panel:{

    },
    panelGrid:{
        marginLeft:30,
        marginTop: 30,
        minWidth: 300,
    },
    graph:{

    },
    graphGrid:{
        marginTop:30,
        marginLeft:30,
        minWidth:600,
    },
    button:{
        marginRight:20,
    },
    input: {
        display: 'none',
    },
};

class Graph extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            disabled:true,
            range:1,
            legends:[],
        };
    }
    componentWillMount() {
    }
    slide(values){
        this.bigraph.showRange(values);
    }
    checked(name,bl){
        this.bigraph.showLegend(name,bl);
    }
    selected(name, color){
        this.bigraph.changeColor(name,color);
    }
    reset(){
        this.bigraph.reset();
        this.bigraph = null;
    }
    upload(){
        const file = document.getElementById("upload-file").files[0];
        if (file == null){return ;}
        // var data = fetch('http://localhost:8080/api/upload/',{
        //     method:'POST',
        //     headers:{
        //         'Content-Type':'application/json;charset=UTF-8'
        //     },
        //     body: file,
        // }).then(res => res.json());
        this.reset();
        const reader = new FileReader();
        var data
        reader.onload=(e) => {
            data = JSON.parse(e.target.result)
            this.paint(convert(data))
        }
        reader.readAsText(file);
    }
    export(){
        d3ToPng('#bigraph','bigraph')
    }
    paint(data){
        var bigraph = new Bigraph();
        bigraph.initialize(data);
        bigraph.draw("#bigraph");
        this.bigraph = bigraph;
        this.setState({disabled:false,range:(1+bigraph.depth),legends:bigraph.legends});
    }
    componentDidMount(){
        this.paint(convert(tpdata))
    }
    render(){
        const {classes} = this.props;
        return(
            <div>
                <div className={classes.container}>
                    <Grid container direction="row" alignContent="center">
                        <Grid item xs={4} className={classes.panelGrid}>
                            <Paper className={classes.panel}>
                                <Accordion square>
                                    <AccordionSummary expandIcon={<ExpandMoreOutlined />}>
                                        <Typography >Editing</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Grid container direction="column">
                                        <Typography>
                                            <RangeSlider disabled={this.state.disabled} max={this.state.range} onChange={this.slide.bind(this)}/>
                                        </Typography>
                                        <Typography>
                                            <LegendGroup legends={this.state.legends} onChange={this.checked.bind(this)} onSelect={this.selected.bind(this)}/>
                                        </Typography>
                                        </Grid>
                                    </AccordionDetails>
                                </Accordion>
                                <Accordion square>
                                    <AccordionSummary expandIcon={<ExpandMoreOutlined />}>
                                        <Typography >Export/Import</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Typography>
                                            <Grid container direction='row' alignItems='center' justify="space-between">
                                                <Grid>
                                                    <form onChange={this.upload.bind(this)}>
                                                        <input accept="application/json" className={classes.input} id="upload-file" type="file"/>
                                                        <label htmlFor="upload-file">
                                                            <Button variant="contained" className={classes.button} color="inherit" component="span" startIcon={<Publish/>}>
                                                                Upload
                                                            </Button>
                                                        </label>
                                                    </form>
                                                </Grid>
                                                <Grid>
                                                    <Button className={classes.button} onClick={this.export} variant="contained" color="primary" component="span" startIcon={<GetApp/>}>
                                                        Export
                                                    </Button>
                                                </Grid>
                                            </Grid>
                                        </Typography>
                                    </AccordionDetails>
                                </Accordion>
                            </Paper>
                        </Grid>
                        <Grid item xs={6} className={classes.graphGrid}>
                            <svg id='bigraph'  className={classes.graph}></svg>
                        </Grid>
                    </Grid>
                </div>
            </div>
        )
    }

}

export default withStyles(style) (Graph);