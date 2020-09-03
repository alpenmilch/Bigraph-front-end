import React from 'react'
import {Toolbar, AppBar, Typography, Button, withStyles} from '@material-ui/core';
import {Link, NavLink} from 'react-router-dom';

const style = {
    root: {
        flexGrow: 1,
    },
    toolbar: {
        height:70,
        alignItems: 'flex-start',
        paddingTop: 5,
        paddingBottom: 5,
    },
    navlink:{
        fontSize:'30px',
        fontWeight: 'bold',
        color: 'white',
        position: 'relative',
    },
    title:{
        marginLeft:50,
        paddingTop:10,
        paddingBottom: 10,
        marginTop:'auto',
        marginBottom:'auto',
    },
    button:{
        marginRight:30,
        marginLeft: 'auto',
        marginTop:'auto',
        marginBottom:'auto',
    }
};

class NavBar extends React.Component{
    render(){
        const {classes} = this.props;
        return(
            <div className={classes.root}>
                <AppBar position="static">
                    <Toolbar variant='regular' className={classes.toolbar}>
                        <Typography className={classes.title} variant="h5">
                            <NavLink to='/about' className={classes.navlink}>
                                About
                            </NavLink>
                        </Typography>
                        <Typography className={classes.title} variant="h5">
                            <NavLink to='/graph' className={classes.navlink}>
                                Graph
                            </NavLink>
                        </Typography>
                        <Typography className={classes.title} variant="h5">
                            <NavLink to='/example' className={classes.navlink}>
                                Example
                            </NavLink>
                        </Typography>
                        <Typography className={classes.button} variant="h5">
                            <NavLink to='/' className={classes.navlink}>
                                <Button color='inherit'>test</Button>
                            </NavLink>
                        </Typography>
                    </Toolbar>
                </AppBar>
            </div>
        )
    }
}
export default withStyles(style) (NavBar);
