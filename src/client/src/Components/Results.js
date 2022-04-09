import React, { Component } from "react";
import "./styles/Results.css"
import CourseCard from "../Components/CourseCard";
import CourseGraph from "./CourseGraph";
import axios from 'axios';
const qs = require('query-string');
const api = axios.create({
    baseURL: '/api/'
});

class Results extends Component{
    constructor(props){
        super(props) //since we are extending class Table so we have to use super in order to override Component class constructor
        this.state = { //state is by default an object
            tableInfo: [],
            currGraph: null,
            currUniversity: null,
        }
    }

    updateSelf = (value) => {
        this.setState({tableInfo:value, currGraph:null});
    }

    updateUniversity = (value) => {
        this.setState({currUniversity: value});
    }

    updateGraph = courseCode => {
        api.get(
            '/course/prerequisites',
            {params:{'code': courseCode, 'university': this.state.currUniversity, 'format':'coursedetailed'},
            paramsSerializer: function(params){
            return qs.stringify(params, {indices: false})
        }}).then(response => {
            this.setState({currGraph: response.data});
        });
    }

    renderTableData= () => {
        // If search results are empty
        if (this.state.tableInfo.length === 0){
            return (
                <h2>No courses were found.</h2>
            )
        }
        return this.state.tableInfo.map((info, index) => {
            const { code, title, desc, prereqs, offering, credits, lectures, labs} = info //destructuring
            return (
                <CourseCard code={code}
                            title={title}
                            desc={desc}
                            prer={prereqs}
                            offr={offering}
                            cred={credits}
                            lecs={lectures}
                            labs={labs}
                            updateGraph = {this.updateGraph}></CourseCard>
            )
        })
    }

    renderGraph = () => {
        if(this.state.currGraph){
            const graphData = this.state.currGraph;
            return <CourseGraph graphData = {graphData}></CourseGraph>
        }
        return;
    }

    render = () =>{
        return(
            <div className="container results-parent">
                <h1>Results</h1>
                <div className="container results-container">
                    {this.renderTableData()}
                </div>
                {this.renderGraph()}
            </div>
        )
    }
}

export default Results;