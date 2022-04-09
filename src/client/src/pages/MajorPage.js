import React, {Component} from "react";
import "./styles/MajorPage.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import {Container} from 'react-bootstrap';
import GraphFlow from "../Components/GraphFlow";
// Api
import axios from 'axios';
const qs = require('query-string');
const api = axios.create({
    baseURL: '/api/'
});

class MajorPage extends Component{

    constructor(props){
        super(props);
        this.degree = '';
    }

    changeHandler = e => {
        this.degree = e.target.value;
    }

    findDegree = async (e) =>{
        let deg = document.getElementsByName('Degree')[0].value.toUpperCase();
        let graphData = [];
        let tempData = await api.get(
            '/degree', 
            {params:{'program':deg,'format':'coursedetailed'},
            paramsSerializer: function(params) {
            return qs.stringify(params, { indices: false })
        }});
        graphData = graphData.concat(tempData["data"]);
        this.programGraph.updateGraph(graphData[0]);
    }
    
    render(){
        return (
            <Container className="main-major-container">
                <div className="major-title-container">
                    <div>
                        <h1>University of Guelph - Degree Search</h1>
                    </div>
                    <div className="major-search-bar">
                        <div className="search-container filterHolder">
                            <div className="input-group input-group-sm mb-3">
                                <span className="input-group-text" id="Department">Degree Program</span>
                                <input type="text" className="form-control" name="Degree" onChange={this.changeHandler}/>
                            </div>
                        </div>
                        <div className="search-button-container">
                            <button className="btn major-search-button" type="button" onClick={this.findDegree}>Search</button>
                        </div>
                    </div>
                </div>
                <div className="graph-container">
                    <GraphFlow ref={(ip) => {this.programGraph = ip}}></GraphFlow>
                </div>
            </Container>
        );
    }
}

export default MajorPage;