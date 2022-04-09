#! /usr/bin/node

const playwright = require('playwright');
const fs = require('fs');
const cliProgress = require('cli-progress');
const { exit } = require('process');

// Gets course info such as Offerings, Restrictions, etc
// Params: link (an extension which is added onto a base URL) & page (a playwright object used to pull up pages).
async function getInfo(link, page){
    //Link to a paticular subject specific page
    // console.log("\x1b[95m","Collecting info for: " + link);
    try{
        // Goes to a paticular subject specific page
        await page.goto(link);

        // Finds the element with the class name "main", this contains all courses
        const subjectCourses = await page.$eval('main', mainElm => {
            const courses = mainElm.getElementsByTagName('center');
            const courseElms = Array.prototype.slice.call(courses);
            const data = [];
            // Loop through courses and add to data
            courseElms.forEach(course => {
                const listElms = course.getElementsByClassName('divTable');
                const allElms = Array.prototype.slice.call(listElms);
                allElms.forEach(elm => {
                    data.push(elm.innerText.split('\n'));
                });
            });
            return data;
        });

        //Returns a list of a paticular subjects courses with their course info
        // console.log("\x1b[92m","Finished collecting from: " + link);
        return subjectCourses;
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

        // Open browser
        const browser = await playwright.chromium.launch({
            headless: true // set this to true
        });
        
        // Go to waterloo's courses page
        const page = await browser.newPage();
        await page.goto('https://ugradcalendar.uwaterloo.ca/page/Course-Descriptions-Index');
        
        // Locates a snap containing the main content of the page
        const subjectsList = await page.$eval('#ctl00_contentMain_lblContent', headerElm => {
            const data = [];
            const tableLengths = [];

            // Get all tables within span
            const listElms = headerElm.getElementsByTagName('tbody');
            const allElms = Array.prototype.slice.call(listElms);

            // Loop through tables and save their length
            allElms.forEach(elm => {
                try{
                    const rows =  elm.getElementsByTagName('tr');
                    // for (var i = 0; i < courses.length; i++){
                    //     // maps the course name with it's specific link
                    //     map[courses[i]] = links[i].getAttribute('href');
                    // }
                    tableLengths.push(rows.length);
                }
                catch (err){
                    console.log("\x1b[91m","error: " + err);
                }
            });

            // Find longest table (this will have all the subjects)
            var highestNum = 0;
            for (var i = 0; i < tableLengths.length; i++){
                if (tableLengths[i] > highestNum){
                    highestNum = tableLengths;
                }
            }
            var theIndex = tableLengths.indexOf(highestNum);

            // Get the largest table object
            const getTable = allElms.at(theIndex).getElementsByTagName('tr');
            const theElms = Array.prototype.slice.call(getTable);

            // Loop through rows and create a map of "Subject":"link/to/courses"
            theElms.forEach(elm => {
                var map = {};
                try{
                    const rowText = elm.innerText.split('\t'); // Grab subject name
                    const rowsLinks = elm.getElementsByTagName('a'); // Get all links in row
                    var holdHref = rowsLinks[0].getAttribute('href'); // Gets first link (link to all dept courses)
                    if (holdHref!=null){
                        var splitHref = holdHref.split('/');
                        // If the split leaves the link in three sections, that is the department link
                        if (splitHref.length == 3){
                            map[rowText[0]] = ("https://ugradcalendar.uwaterloo.ca" + holdHref); // push data to map
                            data.push(map);
                        }
                    }
                }
                catch(err){
                    console.log("\x1b[91m","error: " + err);
                }
                map = {};
            });

            return data;
        });


        // This serves as the main data structure that stores all the course info.
        let mainList = [];
        // Iterate through the subjectsList
        for (var i = 0; i < subjectsList.length; i++){
            // Variable "subjectsHash" holds key, pair values (subject name, link)
            var subjectsHash = subjectsList[i];
            progressBar.update(Math.floor((i+1)/subjectsList.length * 100));
            // Loop through subjects
            for (const [key, value] of Object.entries(subjectsHash)) {
                let tempList = []
                // Split the link to get it's extension
                // Send the extension and the page object to the getInfo function
                // This function returns info on the subjects courses adn their info
                var subjectCoursesInfo = await getInfo(value, page);
                tempList.push(key);
                tempList.push(subjectCoursesInfo);
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

// When subject is run standalone
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
    bar1.update({taskname: "Waterloo Course Scraper"});

    // Scrape data and create json
    scrape(bar1).then(result => {saveJSONToFile(result, "../temp/scrapedCoursesWaterloo.json");bars.stop()});

}

module.exports = {scrape};
