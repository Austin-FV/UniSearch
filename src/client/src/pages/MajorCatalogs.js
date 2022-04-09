import React from "react";
import "./styles/About.css"
import 'bootstrap/dist/css/bootstrap.min.css';
import {Container, Image} from 'react-bootstrap';

import GuelphMajors from "../GuelphMajors.pdf";
import WaterlooMajors from "../WaterlooMajors.pdf";

import "./styles/MajorCatalogs.css";

function About(){
    return(
        <div className="about-container">
            <div className="about-title">
                <h1><u>Major Catalogs</u></h1>
                <h3 className="sub-title">Major Catalogs from University of Waterloo and University of Guelph!</h3>
            </div>
            <Container>
                <div className="guelph-majors">
                <Image src="https://upload.wikimedia.org/wikipedia/en/f/f6/UofGshield.png" responsive />
                    <a href={GuelphMajors} target="_blank" rel="noreferrer">Guelph Majors PDF</a>
                </div>
                <div className="waterloo-majors">
                    <Image style={{width: 150}} src="https://upload.wikimedia.org/wikipedia/en/6/6e/University_of_Waterloo_seal.svg" responsive />
                    <a href={WaterlooMajors} target="_blank" rel="noreferrer">Waterloo Majors PDF</a>
                </div>
            </Container>
        </div>
    );
}
export default About;