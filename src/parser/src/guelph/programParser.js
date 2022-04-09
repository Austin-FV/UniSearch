#! /usr/bin/node
'use strict';

//const util = require("util");
const fs = require('fs');
const { exit } = require('process');

// Parses the scraped data structure into valid JSON
// Params: progInfo: data structure with all program info

function parseJSON(progInfo){

    /* RESULTANT JSON STRUCTURE
    [
        {
            "name":"Computer Science",
            "code":"CS",
            "blocks":[
                {
                    "label":"Semester 1",
                    "type": 0,      // 0:required, 1:elective group, 2:other
                    "courses":[
                        "CIS*1300",
                        "CIS*1910",
                        "MATH*1200"
                    ],
                    "text":[
                        "1.00 credits in the Area of Application or electives"
                    ]
                }
            ]
        }
    ]
    */

    //console.log(progInfo);
    let majors = [];
    for (let i = 0; i < progInfo.length; i++){ //loop through bachelors
        // [i][0] = "Bachelor Name (code)"
        // [i][1] = [Majors list]
        // [i][2] = "link"

        if(!progInfo[i][1]) // if null
            continue;

        for (let j = 0; j < progInfo[i][1].length; j++){ //loop through programs
            // [i][1][j][0] = "Major Name (code)"
            // [i][1][j][1] = [data list]
            // [i][1][j][2] = "link"

            // Create major object
            let newMajor = {};
            
            // Parse Name and Code
            newMajor["name"] = progInfo[i][1][j][0].split(' (',)[0];
            newMajor["code"] = progInfo[i][1][j][0].split(' (',)[1].split(')')[0];
            newMajor["blocks"] = [];

            // Coding structure to only have 1 block
            let newBlock = {};
            newBlock["label"] = "Courses";
            newBlock["type"] = 0;
            newBlock["courses"] = [];

            for (let k = 0; k < progInfo[i][1][j][1].length; k++){ //loop through pulled data objects
                // [i][1][j][1][k]    = [data object] or "Strings"
                if(typeof progInfo[i][1][j][1][k] == 'string'){ //if data object is string
                    let courses = regexCourse(progInfo[i][1][j][1][k]);
                    
                    for (let m = 0; m < courses.length; m++){ //loop through strings in objects
                        if (newBlock["courses"].includes(courses[m]) === false){
                            newBlock["courses"].push(courses[m]);
                        }
                    }
                }else{//if data object isnt string
                    for (let l = 0; l < progInfo[i][1][j][1][k].length; l++){ //loop through strings in data objects
                        // [i][1][j][1][k][l] = "Strings"
                        let courses = regexCourse(progInfo[i][1][j][1][k][l])
                        
                        for (let m = 0; m < courses.length; m++){ //loop through strings in objects
                            if (newBlock["courses"].includes(courses[m]) === false){
                                newBlock["courses"].push(courses[m]);
                            }
                        }
                    }
                }
            }
            
            // newBlock["courses"].sort();
            newMajor["blocks"].push(newBlock);
            
            // Push major onto list of majors
            majors.push(newMajor);
        }
    }

    return majors;
}

function regexCourse(input){
    let result = input.match(/[A-Z]{2,4}\*[1-9][0-9]{3}/g);
    return result ? result : []
}

function saveJSONToFile(JSONEntity, fileName){
    let JSONString = JSON.stringify(JSONEntity, null, 2);
    fs.writeFileSync(fileName, JSONString);
    console.log("JSON successfully written to file " + fileName + ".")
}

// When program is run standalone
if (require.main === module) {
    // Create temp
    if(!fs.existsSync("../temp") || !fs.existsSync("../temp/scrapedProgramsGuelph.json")){
        console.log('[Error] Couldn\'t find scraped data. Run programScraper.js first!')
        exit(1);
    }

    // Parse data and create json
    let scrapedjson = require('../temp/scrapedProgramsGuelph.json');
    let parsedjson = parseJSON(scrapedjson);
    saveJSONToFile(parsedjson, "../temp/parsedProgramsGuelph.json");

}

module.exports = {parseJSON};