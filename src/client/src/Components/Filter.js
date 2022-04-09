import React, {useState} from "react";
import "./styles/Filter.css";

function Filter(props){

    const fallSwitch = React.createRef();
    const winterSwitch = React.createRef();
    const summerSwitch = React.createRef();
    
    const [allValues, setAllValues] = useState({
        SortBy: 'name',
        University: 'guelph',
        SemestersFWS: [false,false,false],
        Department: '',
        CourseCode: '',
        Credit: ''
    });

    const changeHandler = e => {
        setAllValues({...allValues, [e.target.name]: e.target.value});
    }
    
    const sortingHandler = e => {
        setAllValues({...allValues, "SortBy": e.target.value});
    }
    
    function universityRadioHandler(val) {
        setAllValues({...allValues, "University": val});
    }
    
    function semesterSwitchHandler(e) {
        setAllValues({...allValues, "SemestersFWS": [fallSwitch.current.checked,winterSwitch.current.checked,summerSwitch.current.checked]});
    }


    function search(e){
        props.handleChange(allValues);
    }


    function reset(e){
        window.location.reload();
        // const holdKeys = ["University", "Department", "CourseCode", "Credit"];
        // var arrayLength = holdKeys.length;
        // for (var i = 0; i < arrayLength; i++) {
        //     setAllValues({...allValues, [holdKeys[i]]: ''})
        //     console.log(holdKeys[i]);
        //     //Do something
        // }
    }

    return(
        <div className="container filter-container">
            <h1 className="center-headers">Filters</h1>

            <div className="filter-child search-holder">
                <div className="d-grid gap-2">
                    <button className="btn searchButton" type="button" onClick={search}>Search</button>
                    <button className="btn btn-secondary" type="button" onClick={reset}>Clear Filters</button>
                </div>
            </div>
            

            <div className="filter-child container sorting-container">
                <label className="form-check-label" htmlFor="SortBy">Sort By</label>
                <select name="SortBy" id="SortBy" onChange={(e) => sortingHandler(e)}>
                    <option value="name" selected>Name</option>
                    <option value="code">Course Code</option>
                </select>
            </div>
            
            <div className="filter-child container guelph-or-waterloo-container">
                <div className="form-check">
                    <input className="form-check-input" type="radio" name="flexRadioDefault" id="guelph" onChange={(e) =>universityRadioHandler("guelph")} defaultChecked/>
                    <label className="form-check-label" htmlFor="guelph">Guelph</label>
                </div>
                <div className="form-check">
                    <input className="form-check-input" type="radio" name="flexRadioDefault" id="waterloo" onChange={(e) => universityRadioHandler("waterloo")}/>
                    <label className="form-check-label" htmlFor="waterloo">Waterloo</label>
                </div>
            </div>
            
            <div className="filter-child container semester-container">
                <div className="form-check form-switch">
                    <input className="form-check-input" type="checkbox" id="Fall" name="Fall" ref={fallSwitch} onChange={(e) => semesterSwitchHandler(e)}></input>
                    <label className="form-check-label" htmlFor="Fall">Fall</label>
                </div>
                <div className="form-check form-switch">
                    <input className="form-check-input" type="checkbox" id="Winter" name="Winter" ref={winterSwitch} onChange={(e) => semesterSwitchHandler(e)}></input>
                    <label className="form-check-label" htmlFor="Winter">Winter</label>
                </div>
                <div className="form-check form-switch">
                    <input className="form-check-input" type="checkbox" id="Summer" name="Summer" ref={summerSwitch} onChange={(e) => semesterSwitchHandler(e)}></input>
                    <label className="form-check-label" htmlFor="Summer">Summer</label>
                </div>
            </div>

            <div className="filter-child filterHolder">
                <div className="input-group input-group-sm mb-3">
                    <span className="input-group-text" id="Department">Department</span>
                    <input type="text" className="form-control" name="Department" onChange={changeHandler}/>
                </div>
                <div className="input-group input-group-sm mb-3">
                    <span className="input-group-text" id="courseCode">Course Code</span>
                    <input type="number" className="form-control" min="0" name="CourseCode" onChange={changeHandler}/>
                </div>
                <div className="input-group input-group-sm mb-3">
                    <span className="input-group-text" id="credits">Credits</span>
                    <input type="number" className="form-control" min="0" step="0.25" name="Credit" onChange={changeHandler}/>
                </div>
            </div>
        </div>
    );
}

export default Filter;