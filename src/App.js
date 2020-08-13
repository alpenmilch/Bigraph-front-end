import React from 'react';
import { render } from 'react-dom'
import './App.css';
import {BrowserRouter as Router, Route, Link, Switch} from "react-router-dom";
import NavBar from "./components/navbar";
import Graph from "./components/graph";
import About from "./components/about";

function App (){
    return (
        <Router>
            <div>
                <div className="NavBar">
                    <NavBar></NavBar>
                </div>
                <div className="main" id="main">
                    <Switch>
                        <Route path="/about" >
                            <About/>
                        </Route>
                        <Route path="/graph">
                            <Graph/>
                        </Route>
                    </Switch>
                </div>
            </div>
        </Router>
    );
}
export default App;