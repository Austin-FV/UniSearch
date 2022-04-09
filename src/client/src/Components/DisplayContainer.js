import React, { Component } from "react";
import Filter from "./Filter";
import Results from "./Results";
import "./styles/DisplayContainer.css"
import 'bootstrap/dist/css/bootstrap.min.css';
import {Container, Row} from 'react-bootstrap'
// Api
import axios from 'axios';
const qs = require('query-string');
const api = axios.create({
    baseURL: '/api/'
});

class DisplayContainer extends Component{

    handleChange = async (filterData) => {
        //parse filterData into shortened api usable json
        const newParams = {};
        newParams['sort'] = filterData['SortBy'];
        newParams['university'] = filterData['University'];
        newParams['format'] = 'coursedetailed';
        if (filterData['CourseCode'] !== null && filterData['CourseCode'] !== ''){
            newParams['code'] = filterData['CourseCode'];
        }
        if (filterData['Department'] !== null && filterData['Department'] !== ''){
            newParams['dept'] = filterData['Department'];
        }
        if (filterData['Credit'] !== null && filterData['Credit'] !== ''){
            newParams['credits'] = filterData['Credit'];
        }
        if (filterData['SemestersFWS'] !== null && filterData['SemestersFWS'] !== [false,false,false]){
            let newlist = '';
            if(filterData['SemestersFWS'][0] === true){newlist += 'F';}
            if(filterData['SemestersFWS'][1] === true){newlist += 'W';}
            if(filterData['SemestersFWS'][2] === true){newlist += 'S';}
            newParams['offerings'] = newlist;
        }
        // Get course ids from search route
        const courseDataraw = await api.get('/search', {params:newParams});
        let courseData = courseDataraw['data'];

        // Send course data to the results page
        this.results.updateSelf(courseData);
        this.results.updateUniversity(newParams['university']);
    }

    render(){
        return(
            <Container className="main-area">
                <Row>
                    <Filter handleChange = {this.handleChange}/>
                    <Results ref={(ip) => {this.results = ip}}/>
                </Row>
            </Container>
        )
    }
}

export default DisplayContainer;