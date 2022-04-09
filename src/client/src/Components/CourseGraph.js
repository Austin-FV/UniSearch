import React, { useEffect, useState } from "react";
import Modal from 'react-modal';
import Graph from "react-graph-vis";
import 'bootstrap/dist/css/bootstrap.min.css';
import {Container} from 'react-bootstrap';
import "./styles/GraphFlow.css";
import { v4 as uuidv4 } from 'uuid';


const options = {
    layout: {
        hierarchical: {
            shakeTowards: 'leaves',
            sortMethod: 'directed'
        }
    },
    height: "500px"
};

const modalStyle = {
    content: {
        top: 'auto',
        bottom: 'auto'
    }
}

const colour_list = ["#c0c0c0","#ffd875","#ffabab","#a8d4ff","#d8ff96","#ff82c6","#ffad73","#df9eff","#b5ffff","#ffdbad"];


// performs dfs on every node to see if it is a descendent of a dropped course
function getDisallowed(graphData, droppedCourse){
    let res = [];

    for(let i = 0; i < graphData.length; i++){
        let stack = [];
        let seen = new Set();
        stack.push(graphData[i]["code"]);
        seen.add(graphData[i]["code"]);
        while(stack.length != 0){
            let currCourse = stack.pop();
            
            if(currCourse === droppedCourse){
                res.push(graphData[i]["code"]);
                continue;
            }
            let currNode;
            for(let j = 0; j < graphData.length; j++){
                if (currCourse == graphData[j]["code"]){
                    currNode = graphData[j];
                }
            }
            if(!currNode){
                continue;
            }

            for(let j = 0; j < currNode["prereq_simple"].length; j++){
                if(!seen.has(currNode["prereq_simple"][j])){
                    stack.push(currNode["prereq_simple"][j]);
                    seen.add(currNode["prereq_simple"][j]);
                }
            }
        }
    }
    
    return res;
}

function getGraph(graphData, mainCourse, droppedCourses){
    var initialNodes = [];
    var initialEdges = [];
    var nodeId = {};
    var disallowedCourses = new Set();
    
    // get coursecodes of selected nodes attributed to by their node id value
    for(let i = 0; i < droppedCourses.length; i++){
        if(!isNaN(droppedCourses[i]))
            droppedCourses[i] = graphData[parseInt(droppedCourses[i])]["code"];
    }

    // populate hashset with every single course that isnt allowed due to a dropped course
    for(let i = 0; i < droppedCourses.length; i++){
        let descendents = getDisallowed(graphData, droppedCourses[i]);
        for(let j = 0; j < descendents.length; j++){
            disallowedCourses.add(descendents[j]);
        }        
    }

    // process nodes and use nodeId to map edges easily later on
    for(let i = 0; i < graphData.length; i++){
        let currCourseCode = graphData[i]["code"];
        nodeId[currCourseCode] = i.toString();
        let year;
        for(let j = 0; j < currCourseCode.length; j++){
            if(!isNaN(currCourseCode[j]) && currCourseCode[j] !== " "){
                year = currCourseCode[j].toString();
                break;
            }
        }

        let colour;
        
        if(disallowedCourses.has(graphData[i]["code"])){
            colour = "#808080";
        }
        else if(graphData[i]["code"] === mainCourse){
            colour = "#90EE90";
        }
        else{
            colour = colour_list[year];
        }

        initialNodes.push(
            {
                id: i.toString(),
                label: graphData[i]["code"],
                title: graphData[i]["desc"],
                color: colour
            }
        );
    }

    // process edges using prerequisite data per course
    for(let i = 0; i < graphData.length; i++){
        for(let j = 0; j < graphData[i]["prereq_simple"].length; j++){
            let prereqName = graphData[i]["prereq_simple"][j];
            initialEdges.push(
                {
                    from: nodeId[prereqName],
                    to: i.toString()
                }
            )
        }
    }

    return {nodes: initialNodes, edges: initialEdges};
}

function CourseGraph(props){
    const [modalOpen, setModalOpen] = useState(true);
    const [disallowedCourses, setDisallowed] = useState([]);
    let mainCourse = props.graphData[0]["code"];
    //let disallowedCourses = [];
    let graph = getGraph(props.graphData, mainCourse, disallowedCourses);

    useEffect(() => {
        setModalOpen(true)
        setDisallowed([]);
    }, [props.graphData]);
    
    useEffect(() => {
        console.log("graph update")
    }, [disallowedCourses]);

    return(
        <Modal isOpen={modalOpen} style={modalStyle}>
            <h1>{mainCourse}</h1>
            <Graph graph = {graph} events = {{
                select: ({nodes, edges}) => {
                    const tempList = [...nodes];
                    setDisallowed(tempList);
                    console.log(disallowedCourses);
                }
            }} options={options} fitView />
            <button className="btn courseGraphButton" onClick={() => setModalOpen(false)}>close</button>
        </Modal>
    );
}
export default CourseGraph;