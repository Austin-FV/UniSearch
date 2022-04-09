import React from "react";

import 'bootstrap/dist/css/bootstrap.min.css';
import {Card} from 'react-bootstrap';
import "./styles/CourseCard.css";



function CourseCard(props){

    // Creating components if data is given
    let descObj = null;
    if (props.desc != null && props.desc.length > 0){
        descObj = <Card.Text className="courseDesc">{props.desc}</Card.Text>
    }
    let prereqObj = null;
    if (props.prer != null && props.prer.length > 0){
        prereqObj = <Card.Text className="courseTag"><strong>Prerequisites:</strong> {props.prer}</Card.Text>
    }
    let offeringObj = null;
    if (props.offr != null && props.offr.length > 0){
        offeringObj = <Card.Text className="courseTag"><strong>Offered:</strong> {props.offr}</Card.Text>
    }
    let creditObj = null;
    if (props.cred != null){
        creditObj = <Card.Text className="courseTag"><strong>Credits:</strong> {props.cred}</Card.Text>
    }
    let lectureObj = null;
    if (props.lecs != null){
        lectureObj = <Card.Text className="courseTag"><strong>Lectures:</strong> {props.lecs}</Card.Text>
    }
    let labsObj = null;
    if (props.labs != null){
        labsObj = <Card.Text className="courseTag"><strong>Labs:</strong> {props.labs}</Card.Text>
    }

    function graphCourse(e){
        props.updateGraph(props.code);
        return;
    }
    

    return(
            <Card className="courseCard">
                <Card.Body className="courseBody">
                    <div className="courseTitleContainer">
                        <Card.Title className="courseTitle"><strong>{props.code} {props.title}</strong></Card.Title>
                        <button className="btn courseGraphButton" type="button" onClick={graphCourse}>Graph Course</button>
                    </div>
                    {descObj}
                    {prereqObj}
                    {offeringObj}
                    {creditObj}
                    {lectureObj}
                    {labsObj}
                </Card.Body>
            </Card>
    );
}
export default CourseCard;