// import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
// NavDropdown
import { Container, Navbar, Nav} from 'react-bootstrap'
import {BrowserRouter as Router,Routes,Route,Link} from "react-router-dom";
import About from './pages/About';
import Home from './pages/Home';
import MajorCatalogs from "./pages/MajorCatalogs";
import MajorPage from './pages/MajorPage';


function App() {
  return (
    <div className='font-sen'>
      <Router>
        <Navbar className="navbarToggle" bg="light" expand="lg">
          <Container>
            <Navbar.Brand as={Link} to="/">UniSearch</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                <Nav.Link as={Link} to="/about">About</Nav.Link>
                <Nav.Link as={Link} to="/catalogs">Major Catalogs</Nav.Link>
                <Nav.Link as={Link} to="/majors">Majors</Nav.Link>
                {/* <NavDropdown title="Dropdown" id="basic-nav-dropdown">
                  <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
                  <NavDropdown.Item href="#action/3.2">Another action</NavDropdown.Item>
                  <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item>
                </NavDropdown> */}
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
        <Routes>
          <Route path='/home' element={<Home/>} />
          <Route path='/' element={<Home/>} />
          <Route path='/catalogs' element={<MajorCatalogs/>} />
          <Route path='/about' element={<About/>} />
          <Route path='/majors' element={<MajorPage/>} />
        </Routes>
      </Router>
      {/* <ul>
        <div className='UniSeachNavTitle'>
          <h2 className='t9'>T9</h2>
        </div>
        <h2 className='UniSeachNavTitle'>UniSearch</h2>
        <li></li>>
      </ul> */}
      {/* <div className='container'>
        <DisplayContainer/>
      </div> */}
    </div>
  );
}

export default App;
