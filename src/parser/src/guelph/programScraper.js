#! /usr/bin/node

const playwright = require('playwright');
const cliProgress = require('cli-progress');
const fs = require('fs');

// Gets course info such as Offerings, Restrictions, etc
// Params: link (an extension which is added onto a base URL) & page (a playwright object used to pull up pages).
async function getCourses(name, link, page){
    //Link to a paticular program specific page
    // console.log("\x1b[36m", "Collecting info for: " + name);
    // Modify the given extension to locate the correct degree program offerings
    link = "https://calendar.uoguelph.ca/" + link + "#requirementstext";
    try{
        // Goes to a paticular program specific page
        await page.goto(link);

        // Find the core requirements if there are any

        const coreReq = await page.locator('tbody:below(h2:text("Core Requirements"))');
        var coreReqCourses = await coreReq.allInnerTexts();
        if (coreReqCourses.length != 0){
            if (coreReqCourses.length>1){
                while (coreReqCourses.length!=1){
                    coreReqCourses.pop();
                }
            }
            // console.log(coreReqCourses);
        }

        // Find the honours program if available, otherwise try and find the regular major
        
        const majorHTable = await page.locator('tbody:below(h2:text("Major (Honours Program)"))');
        var majorHprogramCourses = await majorHTable.allInnerTexts();
        if (majorHprogramCourses.length != 0){
            if (majorHprogramCourses.length>1){
                // Removes any other un-ness table data
                while (majorHprogramCourses.length!=1){
                    majorHprogramCourses.pop();
                }
            }
            if (coreReqCourses.length == 1){
                majorHprogramCourses.push(coreReqCourses[0]);
            }
            // console.log(majorHprogramCourses);
            // console.log("\x1b[32m", "Finished collecting for: " + name);
            return majorHprogramCourses;
        }
        else{
            // Find the major if available, otherwise try and scrape normally

            const majorTable = await page.locator('tbody:below(h2:text("Major"))');
            var majorProgramCourses = await majorTable.allInnerTexts();
            if (majorProgramCourses.length != 0){
                if (majorProgramCourses.length>1){
                    while (majorProgramCourses.length!=1){
                        majorProgramCourses.pop();
                    }
                }
                if (coreReqCourses.length == 1){
                    majorProgramCourses.push(coreReqCourses[0]);
                }
                // console.log(majorProgramCourses);
                // console.log("\x1b[32m", "Finished collecting for: " + name);
                return majorProgramCourses;
            }
            else{
                // Finds the table containing info
                const programCourses = await page.$$eval('tbody', selected => {
                    const data = [];
                    
                    //The first tbody elem because sometimes there are 2 or more
                    // ITERATE THROUGH ALL SELECTED (EX. SELECTED[I]) TO GET ALL TABLES (tbody)
                    for (var j = 0; j < selected.length; j++){
                        const listElms = selected[j].getElementsByTagName('tr');
                        const allElms = Array.prototype.slice.call(listElms);
                        allElms.forEach(elm => {
                            data.push(elm.innerText.split('\t'));
                        });
                    }
                    return data;
                });
                //Returns a list of a paticular programs courses with their course info
                // console.log(programCourses);
                if (programCourses.length == 0){
                    // console.log("\x1b[101m%s\x1b[0m","No information to be collected. Returned null.");
                    return null;
                }
                // console.log("\x1b[32m", "Finished collecting for: " + name);
                return programCourses;
            }
        }
    }
    catch (err){
        // console.log("\x1b[101m%s\x1b[0m","No information to be collected. Returned null.");
        return null;
    }
}


// Gets programs and the course info within each
// Params: 
//        name: name of the program
//        link: extension link to the program
//        page: page object used to open pages
async function getPrograms(name, link, page){
    //Link to a paticular degree specific page
    // console.log("\x1b[95m", "Collecting info for: " + name);
    // Modify the given extension to locate the correct degree program offerings
    link = "https://calendar.uoguelph.ca/" + link + "#programstext";
    try{
        // Goes to a paticular program specific page
        await page.goto(link);
        // Finds the element with the class name "sc_sccoursedescs"
        const findPrograms = await page.$eval('.sitemap', headerElm => {
            const data = [];
            // Pull all the links associated with the program so you can find their correct pages
            // Map these links to the program names
            const listElms = headerElm.getElementsByTagName('li');
            const allElms = Array.prototype.slice.call(listElms);
            allElms.forEach(elm => {
                var map = {};
                try{
                    const degreeProgram = elm.innerText.split('\n');
                    const links =  elm.getElementsByTagName('a');
                    for (var i = 0; i < degreeProgram.length; i++){
                        // maps the course name with it's specific link
                        map[degreeProgram[i]] = links[i].getAttribute('href');
                    }
                    
                    data.push(map);
                }
                catch (err){
                    console.log("error: " + err);
                }
                map = {};
            });
            return data;
        });

        // console.log(degreePrograms);
        // this serves as the main data structure that stores all the course info.
        
        let degreeProgramList = [];

        // Iterate through the programsList
        for (var i = 0; i < findPrograms.length; i++){
            // variable "programsHash" holds key, pair values (program name, link)
            var programsHash = findPrograms[i];
            let currDegree = [];
            for (const [key, value] of Object.entries(programsHash)) {
                let tempList = []
                currDegree.push(key);
                // Split the link to get it's extension
                var extension = value;
                // Send the extension and the page object to the getInfo function
                // This function returns info on the programs courses adn their info
                var degreeOfferings = await getCourses(key, extension, page);
                tempList.push(key);
                tempList.push(degreeOfferings);
                tempList.push(value);
                degreeProgramList.push(tempList);
                
            }
        }

        // console.log(degreeProgramList);
        // console.log("\x1b[94m", "Finished collecting for: " + name);
        return degreeProgramList;
    }
    catch (err){
        // console.log("\x1b[93m","Checking if " + name + " is standalone:");
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
        // Base link that takes you to all of the degree's
        await page.goto('https://calendar.uoguelph.ca/undergraduate-calendar/degree-programs/');
        // Locates the element with the class name "sitemap" which holds the  degrees
        const degrees = await page.$eval('.sitemap', headerElm => {
            const data = [];
            const listElms = headerElm.getElementsByTagName('li');
            const allElms = Array.prototype.slice.call(listElms);

            // This takes the links embedded within the test (href's) and maps them toward the text (Ex. Bachelor of Computing (B.Comp.): /undergraduate-calendar/degree-programs/bachelor-computing-bcomp/ )
            allElms.forEach(elm => {
                var map = {};
                try{
                    const degree = elm.innerText.split('\n');
                    const links =  elm.getElementsByTagName('a');
                    for (var i = 0; i < degree.length; i++){
                        // maps the course name with it's specific link
                        map[degree[i]] = links[i].getAttribute('href');
                    }
                    
                    data.push(map);
                }
                catch (err){
                    throw err;
                }
                map = {};
            });
            return data;
        });
        
        // mainList is the main data structure
        //Holds degree's, programs within degree's, and courses within programs
        let mainList = [];
        
        // Iterate through the degrees taking each link extension and sending it to get offerings
        for (var i = 0; i < degrees.length; i++){
            // Update progress bar
            progressBar.update(Math.floor((i+1)/degrees.length * 100));
            // variable "programsHash" holds key, pair values (program name, link)
            var programsHash = degrees[i];
            for (const [key, value] of Object.entries(programsHash)) {
                let tempList = []
                var extension = value;
                // Send the extension and the page object to the getPrograms function
                // This function returns info on the programs within that degree and the courses within those programs
                
                var degreeOfferings = await getPrograms(key, extension, page);

                // THIS MEANS THAT IT'S SPECIAL LIKE A BACHELOR OF ARTS AND SCIENCES
                // Give it a dict called standalone, and it's value will be the req courses
                var standAlone = {}
                tempList.push(key);
                if (degreeOfferings == null){
                    degreeOfferings = await getCourses(key, extension, page);
                    if (degreeOfferings == null){
                        // console.log(key + " is null. No information available.");
                        tempList.push(null);
                    }
                    else{
                        standAlone["Standalone"] = degreeOfferings;
                        // console.log("\x1b[91m",key + " is standalone!");
                        tempList.push(standAlone);
                    }
                }
                // If it isn't standalone, treat it regularly
                else{
                    tempList.push(degreeOfferings);   
                }
                tempList.push(value);
                mainList.push(tempList);
                
            }
        }

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
    bar1.update({taskname: "Guelph Program Scraper"});

    // Scrape data and create json
    scrape(bar1).then(result => {saveJSONToFile(result, "../temp/scrapedProgramsGuelph.json");bars.stop()});
}

module.exports = {scrape};
