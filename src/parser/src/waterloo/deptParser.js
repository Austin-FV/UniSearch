#! /usr/bin/node
'use strict';

//const util = require("util");
const fs = require('fs');
const { exit } = require('process');

// Params: coursesInfo waterloo's course database
// Returns: json file structured like parsedDeptData.json
function parseJSON(coursesInfo){
    //console.log(coursesInfo);
    let resultJSON = [];
    for (let i = 0; i < coursesInfo.length; i++){
        // courses are in index 1 of each department info, iterate through them to JSON format each description
        let departmentName = coursesInfo[i][0];
        if(departmentName === "Business (Wilfrid Laurier University)")
            continue;

        let prefix = "";
        let courses = [];
        for (let j = 0; j < coursesInfo[i][1].length; j++){
            // The first field of a particular course structure contains info such as the code, title, seasons, lecs and labs, and credits
            // We need to find the bounds of each of these values, if they exist, all nonexistent values will be denoted as an empty string
            
            let splitTitle = coursesInfo[i][1][j][0].split(/[\s,]/);

            prefix = splitTitle[0];
            
            let courseCode = "";
            let courseTitle = "";
            let seasonsString = "";
            let lecsLab = "";
            let credits = "";
            
            
            // let seasonIndex = 0;

            courseCode = splitTitle[1];
            courseTitle = coursesInfo[i][1][j][2];
            credits = splitTitle[splitTitle.length - 1];

            let description = coursesInfo[i][1][j][3];
            if(!description)
                description = "";


            // Go through all other fields of the data structure and assign the values to the appropriate variable
            let prerequisiteStr = "";
            let corequisite = "";
            let restriction = "";
            let location = "";
            let department= "";

            let notes = "";
            let crossListedStr = "";

            let offerings = {seasons: [], frequency: 0, offset: 0, DVM: false};
            for (let k = 3; k < coursesInfo[i][1][j].length; k++){
                let rawSplit = coursesInfo[i][1][j][k].split(/\s/);
                let rawString = "";
                for (let x = 1; x < rawSplit.length; x++){
                    rawString += rawSplit[x] + " ";
                }
                if (coursesInfo[i][1][j][k].includes("Prereq:")){
                    prerequisiteStr = rawString.trim();
                }
                else if (coursesInfo[i][1][j][k].includes("Coreq:")){
                    corequisite = rawString.trim();
                }
                //restriction same as antireq
                else if (coursesInfo[i][1][j][k].includes("Antireq:")){
                    restriction = rawString.trim();
                }
                else if (coursesInfo[i][1][j][k].includes("Location(s):")){
                    location = rawString.trim();
                }
                else if (coursesInfo[i][1][j][k].includes("Department(s):")){
                    department = rawString.trim();
                }
                else if (coursesInfo[i][1][j][k].includes("[Note:")){
                    notes = rawString.trim().slice(0,-1);
                }
                else if (coursesInfo[i][1][j][k].includes("(Cross-listed")){
                    crossListedStr = rawString.trim().slice(0,-1);
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

            // parse out the seasons that the course is being offered from either the description or the notes
            if(description.includes("Offered:") || notes.includes("Offered:")){
                let currIndex = 0;
                let offeredSep = description.includes("Offered:") ? description.split(/[\s]/) : notes.split(/[\s]/);
                while (!offeredSep[currIndex].includes("Offered:")){
                    currIndex++;
                }
                currIndex++;
                if(currIndex < offeredSep.length && offeredSep[currIndex].includes(",")){
                    let commaDescription = offeredSep[currIndex].replace(/]/, '').split(",");
                    for(const season of commaDescription){
                        if (season === "F"){
                            offerings.seasons.push("Fall");
                        }
                        if (season === "W"){
                            offerings.seasons.push("Winter");
                        }
                        if (season === "S"){
                            offerings.seasons.push("Summer");
                        }
                    }
                }
            }

            // **needs some work for more features
            // has a lot of very different formats
            // some courses have a letter at the end ANTH 370W
            let prerequisite = [];
            prerequisite = parsePrerequisites(prerequisiteStr);
            
            // ONE OUTLIER: MSCI 422: has prerequisites found in the description (no prereq string)
            
            // **OFFERINGS
            // some courses have offered within the Description OR within the Notes
            // main format: 'Offered: F,W,S' 
            // outliers include: (not exact, there are variations)
            //      Offered: W even years
            //      Offered: F or W
            //      Offered: W and/or S
            //      Offered: As available
            //      Offered: F,W,S; online: F,W,S
            //      Offered: F; online only
            //      Offered: F, W; also offered online: W
            //      Offered: As permitted by demand and available resources.
            //      Offered: After spring examinations, prior to the fall term.
            //      Offered: F, first offered Fall 2024
            //      Offered: AE 123 (S), CIVE 123 (W), ENVE 123 (S), GEOE 123 (S) (4 found in JSON)
            //      Offered: Winter (1 found in JSON - SMF 400)
            //      Offered: W; Based in Bordeaux; online only (1 found in JSON - CHEM 301)

            // some courses have offered within the Description OR within the Notes
            // Currently collects offered substring but does not further parse it
            let offeredStr = "";
            if (description.includes("Offered: ")){
                let offeredIndex = description.indexOf("Offered: ");
                offeredStr = description.substring(offeredIndex, description.length - 1);
                offeredStr = offeredStr.replace(']','');

                // console.log(offeredStr);

            } else if (notes.includes("Offered: ")){
                let offeredIndex = notes.indexOf("Offered: ");
                offeredStr = notes.substring(offeredIndex, notes.length);
                offeredStr = offeredStr.replace(']','');

                // console.log(offeredStr);

            }

            // OTHER WATERLOO SPECIFIC DATA THAT IS NOT CURRENTLY PUSHED ONTO JSON            
            // course ID
            let splitID = coursesInfo[i][1][j][1].split(/[\s,]/);
            let courseID = splitID[splitID.length - 1];
            // console.log(components);

            // components contain items such as LEC, LAB, SEM, TUT, PRJ
            let components = splitTitle.slice(2,splitTitle.length - 1);
            // console.log(components);

            //cross listed courses, format: '(Cross-listed with SPCOM 112, THPERF 112, VCULT 112)'
            //remove "with " from string and then split into array of courses
            crossListedStr = crossListedStr.substring(5,crossListedStr.length - 1);
            let crossListed = crossListedStr.split(", ");
            // console.log(crossListed);
            
            let curr = {
                courseCode,
                courseTitle,
                offerings,
                lecsLab,
                credits,
                description,
                notes,
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

        resultJSON.push({departmentName, prefix, courses, urlExtension: coursesInfo[i][2]});
    }

    return resultJSON;
}

function parsePrerequisites(prerequisiteStr){
    let result = prerequisiteStr.match(/[A-Z]{2,5}\s[0-9]{3}/g);

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
    if(!fs.existsSync("../temp") || !fs.existsSync("../temp/scrapedCoursesWaterloo.json")){
        console.log('[Error] Couldn\'t find scraped data. Run waterlooScraper.js first!')
        exit(1);
    }

    // Parse data and create json
    let scrapedjson = require('../temp/scrapedCoursesWaterloo.json');
    let parsedjson = parseJSON(scrapedjson);
    saveJSONToFile(parsedjson, "../temp/parsedCoursesWaterloo.json");

}

module.exports = {parseJSON};