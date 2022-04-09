import React from "react";
import "./styles/About.css"
import CallingCard from "../Components/CallingCard";
import 'bootstrap/dist/css/bootstrap.min.css';
import {Container, Row} from 'react-bootstrap';

function About(){
    return(
        <div className="about-container">
            <div className="about-title">
                <h1>Meet The Team</h1>
            </div>
            <Container>
                <Row className="justify-content-center">
                    <CallingCard title="Matthew Szurkowski" desc="This tech visionary is the self-appointed CEO of Team 9. Dubbed “God” by his fellow teammates, Matthew Szurkowski constantly strides towards innovation. A natural born leader that has single-handedly revolutionized the tech industry. With his charm and good looks, Szurkowski consistently topples the competition, and paves the way to Team 9’s victory." imgsrc="https://media-exp1.licdn.com/dms/image/C4E03AQF4Wbb5gwAlVg/profile-displayphoto-shrink_200_200/0/1636064792801?e=1652313600&v=beta&t=dCBfYFMxrDlmXqqyJGCqccQfBEiBCu2xmlvQM_Rzta8"></CallingCard>
                </Row>
                <Row className="justify-content-center">
                    <CallingCard title="William Fitzjohn" desc="This tech visionary is the self-appointed CEO of Team 9. Prior to his partnership, he was revolutionizing the tech industry by epitomizing rectitude and generating practicality. Within months of joining us in 2022, he pioneered the technique we use for powerpoint profile pictures. He plans on continuing his innovative leadership and bringing Team 9 to the forefront of technology." imgsrc="https://media-exp1.licdn.com/dms/image/C4D03AQFiGDf6-BQ5YQ/profile-displayphoto-shrink_200_200/0/1632187750150?e=1652313600&v=beta&t=dgWQfnE3yZEFfYp0hTfe4rsUHuAWcMpN_mZPQiIvze4"></CallingCard>
                </Row>
                <Row className="justify-content-center">
                    <CallingCard title="Matthew Ng" desc="This tech visionary is the self-appointed CEO of Team 9. Divorced 7 times and fired from 6 FAANG companies, Matthew “Tech Lead” Ng demolishes the competition through his elite coding prowess. A financial revolutionary, he once subsisted on only Costco samples for a whole year, entering only through the exit door, of course." imgsrc="https://media-exp1.licdn.com/dms/image/C4D03AQGdTMLthgTQbQ/profile-displayphoto-shrink_200_200/0/1648714409417?e=1654732800&v=beta&t=AljiHMaQDj-qh-UsYqtEYiy9UDSRIK7-FnRQ3_Ko_NY"></CallingCard>
                </Row>
                <Row className="justify-content-center">
                    <CallingCard title="Andrei Jors" desc="This tech visionary is the self-appointed CEO of Team 9. His experience in mongolian basket-weaving makes him a well-rounded addition to the team, and his deep and comprehensive understanding of how to render servers unusable has come in handy in the competition with the enemy teams. Andrei strives for perfection in all things, but incapable of achieving it, settles quickly for simply dismantling the opposition so that his exploits are perfect in comparison." imgsrc="https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/shrek-forever-after-1587549453.jpg?crop=0.676xw:0.901xh;0.0969xw,0&resize=480:*"></CallingCard>
                </Row>
                <Row className="justify-content-center">
                    <CallingCard title="Austin Varghese" desc="This tech visionary is the self-appointed CEO of Team 9. Was recently labeled as the “Heartthrob” by fellow team members for his exuberant looks and attitude towards creating lovable code. Austin Varghese thrives to learn more and develop his skills further within this team of goats." imgsrc="https://media-exp1.licdn.com/dms/image/C4E03AQEwAOMmD0ODAw/profile-displayphoto-shrink_200_200/0/1642144635044?e=1652313600&v=beta&t=QnSSEGw5hznmBJFFwIa2cImiYutldPJH2GrY8QI3fIY"></CallingCard>
                </Row>
            </Container>
        </div>
    );
}
export default About;