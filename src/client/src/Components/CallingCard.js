import React from "react";

import 'bootstrap/dist/css/bootstrap.min.css';
import {Card} from 'react-bootstrap';
import "./styles/CallingCard.css";

function CallingCard(props){
    return(
            <Card className="picture-cards">
                <div className="card-image-container">
                    <Card.Img className="card-image" variant="top" src={props.imgsrc} />
                </div>
                <Card.Body>
                    <Card.Title className="title"><strong>{props.title}</strong></Card.Title>
                    <Card.Text className="text">{props.desc}</Card.Text>
                </Card.Body>
            </Card>
    );
}
export default CallingCard;