#! /usr/bin/node

const playwright = require('playwright');
const cliProgress = require('cli-progress');
const fs = require('fs');
// const parser = require('./parser.js');

// Gets course info such as Offerings, Restrictions, etc
// Params: link (an extension which is added onto a base URL) & page (a playwright object used to pull up pages).
async function getInfo(link, page){
    //Link to a paticular program specific page
    // console.log("\x1b[95m","Collecting info for: " + link);
    link = "https://calendar.uoguelph.ca/undergraduate-calendar/course-descriptions/" + link + "/";
    try{
        // Goes to a paticular program specific page
        await page.goto(link);
        // Finds the element with the class name "sc_sccoursedescs"
        const programCourses = await page.$eval('.sc_sccoursedescs', headerElm => {
            const data = [];
            // Locate all elements with the class name "courseblock"
            const listElms = headerElm.getElementsByClassName('courseblock');
            const allElms = Array.prototype.slice.call(listElms);
            allElms.forEach(elm => {
                data.push(elm.innerText.split('\n'));
            });
            return data;
        });
        //Returns a list of a paticular programs courses with their course info
        // console.log("\x1b[92m","Finished collecting from: " + link);
        return programCourses;
    }
    catch (err){
        console.log("\x1b[91m",err);
        return null;
    }
}

function saveJSONToFile(JSONEntity, fileName){
    let JSONString = JSON.stringify(JSONEntity, null, 2);
    fs.writeFileSync(fileName, JSONString);
    // console.log("\x1b[92m","JSON successfully written to file " + fileName + ".")
}

async function scrape(progressBar) {
    try{
        const browser = await playwright.chromium.launch({
            headless: true // set this to true
        });
        
        const page = await browser.newPage();
        await page.goto('https://calendar.uoguelph.ca/undergraduate-calendar/course-descriptions/');
        // Locates the element with the class name "az_sitemap"
        const programsList = await page.$eval('.az_sitemap', headerElm => {
            const data = [];
            const listElms = headerElm.getElementsByTagName('ul');
            const allElms = Array.prototype.slice.call(listElms);
            allElms.forEach(elm => {
                var map = {};
                try{
                    const courses = elm.innerText.split('\n');
                    const links =  elm.getElementsByTagName('a');
                    for (var i = 0; i < courses.length; i++){
                        // maps the course name with it's specific link
                        map[courses[i]] = links[i].getAttribute('href');
                    }
                    
                    data.push(map);
                }
                catch (err){
                    console.log("\x1b[91m","error: " + err);
                }
                map = {};
            });
            return data;
        });

        // this serves as the main data structure that stores all the course info.
        
        let mainList = [];
        
        
        // Iterate through the programsList
        for (var i = 0; i < programsList.length; i++){
            // update bar
            progressBar.update(Math.floor((i+1)/programsList.length * 100));
            // variable "programsHash" holds key, pair values (program name, link)
            var programsHash = programsList[i];
            let currDepartment = [];
            for (const [key, value] of Object.entries(programsHash)) {
                let tempList = []
                currDepartment.push(key);
                // Split the link to get it's extension
                var extension = value.split('/');
                // Send the extension and the page object to the getInfo function
                // This function returns info on the programs courses adn their info
                var programCoursesInfo = await getInfo(extension[3], page);
                tempList.push(key);
                tempList.push(programCoursesInfo);
                tempList.push(value);
                mainList.push(tempList);
                
            }
        }

        // Close browser and return json
        await browser.close();
        return mainList;
    }
    catch (err){
        console.log(err);
    }
}

// When program is run standalone
if (require.main === module) {
    // Create temp
    if(!fs.existsSync("../temp")){
        fs.mkdirSync("../temp");
    }

    let bars = new cliProgress.MultiBar({
        format: '{taskname} |{bar}| {percentage}% || ETA: {eta}s',
        // barCompleteChar: '\u2588',
        // barIncompleteChar: '\u2591',
        hideCursor: true
    }, cliProgress.Presets.shades_classic);
    bar1 = bars.create(100,0);
    bar1.update({taskname: "Guelph Course Scraper"});
    
    // Scrape data and create json
    scrape(bar1).then(result => {saveJSONToFile(result, "../temp/scrapedCoursesGuelph.json");bars.stop()});
}

module.exports = {scrape};
