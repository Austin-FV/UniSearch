#! /usr/bin/node

const fs = require('fs');
const cliProgress = require('cli-progress');

const deptScraper = require('./guelph/deptScraper.js');
const deptParser = require('./guelph/deptParser.js');
const programScraper = require('./guelph/programScraper.js');
const programParser = require('./guelph/programParser.js');
const waterlooScraper = require('./waterloo/deptScraper.js');
const waterlooParser = require('./waterloo/deptParser.js');

function saveJSONToFile(JSONEntity, fileName){
    let JSONString = JSON.stringify(JSONEntity, null, 2);
    fs.writeFileSync(fileName, JSONString);
}

async function download(progressBar, scraper, parser, filesuffix){
    let json;
    // Get Data
    if(!fs.existsSync("./temp/scraped"+filesuffix+".json")){
        json = await scraper.scrape(progressBar);
        saveJSONToFile(json, "./temp/scraped"+filesuffix+".json");
    }else{
        json = require("./temp/scraped"+filesuffix+".json");
        progressBar.update(100);
    }
    // Parse Data
    let parsedjson = parser.parseJSON(json);
    saveJSONToFile(parsedjson, "./temp/parsed"+filesuffix+".json");
}

async function main(){
    try{
        // Create multibar object
        let bars = new cliProgress.MultiBar({
            format: '{taskname} |{bar}| {percentage}% || ETA: {eta}s',
            hideCursor: true
        }, cliProgress.Presets.shades_classic);

        // Create individual bars
        (b1 = bars.create(100,0)).update({taskname: "Guelph Course Scraper  "});
        (b2 = bars.create(100,0)).update({taskname: "Guelph Program Scraper "});
        (b3 = bars.create(100,0)).update({taskname: "Waterloo Course Scraper"});
        
        // Create temp folder
        if(!fs.existsSync("./temp")){
            fs.mkdirSync("./temp");
        }

        // Run all three scrapers/parsers
        await Promise.all([
            download(b1,deptScraper,deptParser,"CoursesGuelph"),
            download(b2,programScraper,programParser,"ProgramsGuelph"),
            download(b3,waterlooScraper,waterlooParser,"CoursesWaterloo")
        ]);
        
        // Stop progress bars after completion
        bars.stop();

    }catch(e){
        console.log("error: " + e);
    }
}

main();