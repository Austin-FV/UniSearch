#! /usr/bin/node
'use strict';

//const util = require("util");
const fs = require('fs');
const { exit } = require('process');

//const moo = require("moo");

//Nearley isn't used, but a lot of good work has gone into bringing it close to functionality.
/*const nearley = require("nearley");
const prerequisite_def = require("./prerequisite.js");
const season_def = require("./season.js");*/

// Parses the data structure into valid JSON
// Params: coursesInfo: data structure with all course info

function parseJSON(coursesInfo){
    //console.log(coursesInfo);
    let resultJSON = [];
    for (let i = 0; i < coursesInfo.length; i++){
        // courses are in index 1 of each department info, iterate through them to JSON format each description
        let courses = [];
        for (let j = 0; j < coursesInfo[i][1].length; j++){
            // The first field of a particular course structure contains info such as the code, title, seasons, lecs and labs, and credits
            // We need to find the bounds of each of these values, if they exist, all nonexistent values will be denoted as an empty string
            let courseCode = "";
            let courseTitle = "";
            let seasonsString = "";
            let lecsLab = "";
            let credits = "";
            let splitTitle = coursesInfo[i][1][j][0].split(/[\s,]/);
            let seasonIndex = 0;
            courseCode = splitTitle[0].split(/[*]/)[1];
            
            // Parse the bounds of the seasons in the raw data, DVM courses have a different formatting for seasons
            if (!(coursesInfo[i][1][j][0].includes("DVM"))){
                while (seasonIndex < splitTitle.length && splitTitle[seasonIndex] !== 'Unspecified' && splitTitle[seasonIndex] !== 'Summer' && splitTitle[seasonIndex] !== 'Fall' && splitTitle[seasonIndex] !== 'Winter'){
                    seasonIndex++;
                }
            }
            else{
                while (seasonIndex < splitTitle.length && splitTitle[seasonIndex] !== 'DVM'){
                    seasonIndex++;
                }
            }

            courseTitle = splitTitle[1];

            for (let k = 1; k < seasonIndex; k++){
                courseTitle += splitTitle[k] + " ";
            }
            
            // Parse the bounds that show how many lectures and labs there are, if they exist
            let lecIndex = 0;
            let lecEnd = 0;
            while (lecIndex < splitTitle.length && splitTitle[lecIndex][0] != "("){
                lecIndex++;
            }

            if (lecIndex < splitTitle.length){
                while (splitTitle[lecEnd][splitTitle[lecEnd].length - 1] != ")"){
                    lecEnd++;
                }
                
                for (let k = seasonIndex; k < lecIndex; k++){
                    seasonsString += splitTitle[k] + " ";
                }

                for (let k = lecIndex; k <= lecEnd; k++){
                    lecsLab += splitTitle[k] + " ";
                }    
            }

            // Find how many credits the specific course is worth
            for (let k = 0; k < splitTitle.length; k++){
                if (splitTitle[k][0] === '['){
                    credits = splitTitle[k];
                }
            }

            // Go through all other fields of the data structure and assign the values to the appropriate variable
            let prerequisiteStr = "";
            let corequisite = "";
            let restriction = "";
            let location = "";
            let department= "";
            let offerings = {seasons: [], frequency: 0, offset: 0, DVM: false};
            for (let k = 3; k < coursesInfo[i][1][j].length; k++){
                let rawSplit = coursesInfo[i][1][j][k].split(/\s/);
                let rawString = "";
                for (let x = 1; x < rawSplit.length; x++){
                    rawString += rawSplit[x] + " ";
                }
                if (coursesInfo[i][1][j][k].includes("Prerequisite(s):")){
                    prerequisiteStr = rawString.trim();
                }
                else if (coursesInfo[i][1][j][k].includes("Co-requisite(s):")){
                    corequisite = rawString.trim();
                }
                else if (coursesInfo[i][1][j][k].includes("Restriction(s)")){
                    restriction = rawString.trim();
                }
                else if (coursesInfo[i][1][j][k].includes("Location(s):")){
                    location = rawString.trim();
                }
                else if (coursesInfo[i][1][j][k].includes("Department(s):")){
                    department = rawString.trim();
                }
                else if (coursesInfo[i][1][j][k].includes("Offering(s):")){
                    if (coursesInfo[i][1][j][k].includes("odd")){
                        offerings.frequency = 2;
                        offerings.offset = 1;
                    }
                    else if(coursesInfo[i][1][j][k].includes("even")){
                        offerings.frequency = 2;
                        offerings.offset = 0;
                    }
                }
            }

            let prerequisite = parsePrerequisites(prerequisiteStr);
            
            
            // parse the non DVM seasons in a more easily readable format
            if (!coursesInfo[i][1][j][0].includes("DVM")){
                if (seasonsString.includes("Fall")){
                    offerings.seasons.push("Fall");
                }
                if (seasonsString.includes("Winter")){
                    offerings.seasons.push("Winter");
                }
                if (seasonsString.includes("Summer")){
                    offerings.seasons.push("Summer");
                }
            }
            else{
                offerings.seasons.push(seasonsString);
                offerings.DVM = true;
            }
            
            courseTitle = courseTitle.trim();
            lecsLab = lecsLab.trim();
            credits = credits.slice(1, -1);

            let description = coursesInfo[i][1][j][2];
            if(!description)
                description = "";

            let curr = {
                courseCode,
                courseTitle,
                offerings,
                lecsLab,
                credits,
                description,
                prerequisiteStr,
                prerequisite,
                corequisite,
                restriction,
                location,
                department,
            }

            // Push resultant JSON to the list of all courses
            courses.push(curr);
        }
        coursesInfo[i][0].split(" ")[1];
        // Names and Department Prefixes are included in each department JSON
        // Parse out the department name and prefix by finding the bounds of the two
        let prefixIndex = 0;
        while (prefixIndex < coursesInfo[i][0].length && coursesInfo[i][0][prefixIndex][0] !== '('){
            prefixIndex++;
        }
        let departmentName = "";
        let prefix = "";
        for (let j = 0; j < prefixIndex; j++){
            departmentName += coursesInfo[i][0][j];
        }
        for (let j = prefixIndex; j < coursesInfo[i][0].length; j++){
            prefix += coursesInfo[i][0][j];
        }
        departmentName = departmentName.trim();
        prefix = prefix.slice(1, -1);

        resultJSON.push({departmentName, prefix, courses, urlExtension: coursesInfo[i][2]});
    }

    return resultJSON;
}

function parsePrerequisites(prerequisiteStr, department){
    /*const prerequisite_parser = new nearley.Parser(nearley.Grammar.fromCompiled(prerequisite_def));
    try{
        prerequisite_parser.feed(prerequisiteStr);
    }catch(e){
        console.log("String Failed: \"" + prerequisiteStr + "\", " + e);
        //process.exit(-1);
    }
    //console.log(JSON.stringify(prerequisite_parser.results));
    */

    //Say hello to the lazy option. It works, for now.
    let result = prerequisiteStr.match(/[A-Z]{2,4}\*[1-9][0-9]{3}/g);

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
    if(!fs.existsSync("../temp") || !fs.existsSync("../temp/scrapedCoursesGuelph.json")){
        console.log('[Error] Couldn\'t find scraped data. Run deptScraper.js first!')
        exit(1);
    }

    // Parse data and create json
    let scrapedjson = require('../temp/scrapedCoursesGuelph.json');
    let parsedjson = parseJSON(scrapedjson);
    saveJSONToFile(parsedjson, "../temp/parsedCoursesGuelph.json");

}

module.exports = {parseJSON};