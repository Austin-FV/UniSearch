// @ts-check
const { test, expect } = require('@playwright/test');

// Node Mailer setup
const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "cis3760team9@gmail.com",
    pass: "Team9w22CIS3760"
  },
  tls: {
    rejectUnauthorized: false,
  },
})

let mailOptions = {
  from: "cis3760team9@gmail.com",
  to: "cis3760team9@gmail.com",
  subject: "UniSearch Website Error",
  text: "Error found when testing UniSearch website at URL: https://131.104.49.108/ "
}

let errorBool = 0;

//goto website before each test
test.beforeEach(async ({ page }) => {
  await page.goto('https://131.104.49.108/');
});

//send email if error found after all tests
test.afterAll(async () => {
  if (errorBool === 1) {
    transporter.sendMail(mailOptions, function(err,success){
      if (err){
        console.log(err);
      } else {
        console.log("Email sent successfully!");
      }
    });
  }  
});

//search and graph testing functionality for Guelph

test.describe('Guelph: Search and Graph', () => {

  // test.beforeEach(async ({ page }) => {
  //   await page.goto('https://131.104.49.108/');
  // });  

  // test('my test', async ({page}) => {
  //   await expect(page).toHaveURL('https://131.104.49.108/');
  // });

  test('1: should allow me to view course search items using Department filter', async ({ page }) => {
    
    try {
      await page.fill('input[name=Department]', 'ARAB');

      await page.locator('button:has-text("Search")').click();

      await expect(page.locator('strong >> nth=0')).toHaveText('ARAB*1100 Introductory Arabic I');
      await expect(page.locator('strong >> nth=3')).toHaveText('ARAB*1110 Introductory Arabic II');
    } catch (e) {
      mailOptions.text = mailOptions.text + '\nTest 1: Error viewing course search items using Department filter';
      errorBool = 1;
    }

  });

  test('2: should allow me to view course search items using Credit filter', async ({ page }) => {
    
    try {

      await page.fill('input[name=Credit]', '2');

      await page.locator('button:has-text("Search")').click();

      await expect(page.locator('strong >> nth=0')).toHaveText('VETM*3070 Veterinary Anatomy');
      await expect(page.locator('strong >> nth=2')).toHaveText('VETM*3080 Veterinary Physiology and Biochemistry');

    } catch (e) {
      mailOptions.text = mailOptions.text + '\nTest 2: Error viewing course search items using Credit filter';
      errorBool = 1;
    }

  });

  test('3: should allow me to view course search items using Course Code filter', async ({ page }) => {

    try {

      await page.fill('input[name=CourseCode]', '2750');

      await page.locator('button:has-text("Search")').click();

      await expect(page.locator('strong >> nth=0')).toHaveText('CIS*2750 Software Systems Development and Integration');
  
    } catch (e) {
      mailOptions.text = mailOptions.text + '\nTest 3: Error viewing course search items using Course Code filter';
      errorBool = 1;
    }

  });

  test('4: should allow me to view course search items using Department, Credit, and Season filters', async ({ page }) => {
    
    try {
      await page.fill('input[name=Department]', 'CIS');
      await page.fill('input[name=Credit]', '0.75');
      await page.locator('input[name=Fall]').check();

      await page.locator('button:has-text("Search")').click();

      await expect(page.locator('strong >> nth=0')).toHaveText('CIS*3750 System Analysis and Design in Applications');
      await expect(page.locator('strong >> nth=4')).toHaveText('CIS*3760 Software Engineering');
    } catch (e) {
      mailOptions.text = mailOptions.text + '\nTest 4: Error viewing course search items using Department, Credit, and Season filters';
      errorBool = 1;
    }

  });

  test('5: should allow me to clear the searched items', async ({ page }) => {

    try {

      await page.fill('input[name=Department]', 'CIS');
      await page.fill('input[name=Credit]', '0.75');
      await page.locator('input[name=Fall]').check();

      await page.locator('button:has-text("Search")').click();

      await page.locator('button:has-text("Clear Filters")').click();

      await expect(page.locator('h2 >> nth=0')).toHaveText('No courses were found.');

    } catch (e) {
      mailOptions.text = mailOptions.text + '\nTest 5: Error clearing the searched items';
      errorBool = 1;
    }
      
  });

  test('6: should allow me to open react-vis graph of the selected item', async ({ page }) => {

    try {

      await page.fill('input[name=Department]', 'CIS');
      await page.fill('input[name=Credit]', '0.75');
      await page.locator('input[name=Fall]').check();
      // await page.fill('input[name=CourseCode]', '2750');

      await page.locator('button:has-text("Search")').click();

      // select second graph button which will choose CIS*3760 graph 
      await page.locator('button:has-text("Graph Course") >> nth=1').click();

      await expect(page.locator('h1 >> nth=2')).toHaveText('CIS*3760');
      await expect(page.locator('div > .vis-network')).toHaveCount(1);

    } catch (e) {
      mailOptions.text = mailOptions.text + '\nTest 6: Error graphing the searched items with react-vis';
      errorBool = 1;
    }
      
  });

  // big load
  test('7: should allow me to browse all Guelph courses with no filters', async ({ page }) => {

    try {

      await page.locator('button:has-text("Search")').click();

      await expect(page.locator('div > .courseCard')).toHaveCount(1903);

    } catch (e) {
      mailOptions.text = mailOptions.text + '\nTest 7: Error viewing all Guelph courses';
      errorBool = 1;
    }
      
  });

  test('should return error', async ({ page }) => {

    try {
      await page.fill('input[name=Department]', 'CIS');
      await page.fill('input[name=Credit]', '0.75');
      await page.locator('input[name=Fall]').check();

      await page.locator('button:has-text("Search")').click();

      await page.locator('button:has-text("Clear Filters")').click();

      await expect(page.locator('h2 >> nth=0')).toHaveText('error');
    } catch (e) {
      mailOptions.text = mailOptions.text + '\nTest E: Error example for testing email functionality';
      errorBool = 1;
    }
      
  });
    
});

//search and graph testing functionality for Waterloo

test.describe('Waterloo: Search and Graph', () => {

  // test.beforeEach(async ({ page }) => {
  //   await page.goto('https://131.104.49.108/');
  // });  

  // test('my test', async ({page}) => {
  //   await expect(page).toHaveURL('https://131.104.49.108/');
  // });

  test('8: should allow me to view course search items using Department filter', async ({ page }) => {
    
    try {

      await page.locator('input[id=waterloo]').check();

      await page.fill('input[name=Department]', 'CROAT');

      await page.locator('button:has-text("Search")').click();

      await expect(page.locator('strong >> nth=0')).toHaveText('CROAT 101 Elementary Croatian 1');
      await expect(page.locator('strong >> nth=2')).toHaveText('CROAT 102 Elementary Croatian 2');
      await expect(page.locator('strong >> nth=5')).toHaveText('CROAT 299 Croatian Abroad');

    } catch (e) {
      mailOptions.text = mailOptions.text + '\nTest 8: Error viewing Waterloo course search items using Department filter';
      errorBool = 1;
    }

  });

  test('9: should allow me to view course search items using Credit filter', async ({ page }) => {
    
    try {

      await page.locator('input[id=waterloo]').check();

      await page.fill('input[name=Credit]', '2');

      await page.locator('button:has-text("Search")').click();

      await expect(page.locator('strong >> nth=0')).toHaveText('GBDA 402 Capstone Course: Cross-Cultural Digital Business');
      await expect(page.locator('strong >> nth=2')).toHaveText('OPTOM 488 Exit Exam Remediation');

    } catch (e) {
      mailOptions.text = mailOptions.text + '\nTest 9: Error viewing Waterloo course search items using Credit filter';
      errorBool = 1;
    }

  });

  test('10: should allow me to view course search items using Course Code filter', async ({ page }) => {

    try {

      await page.locator('input[id=waterloo]').check();

      await page.fill('input[name=CourseCode]', '500');

      await page.locator('button:has-text("Search")').click();

      await expect(page.locator('strong >> nth=0')).toHaveText('CHE 500 Special Topics in Chemical Engineering');
  
    } catch (e) {
      mailOptions.text = mailOptions.text + '\nTest 10: Error viewing Waterloo course search items using Course Code filter';
      errorBool = 1;
    }

  });

  test('11: should allow me to view course search items using Department, Credit, and Season filters', async ({ page }) => {
    
    try {

      await page.locator('input[id=waterloo]').check();

      await page.fill('input[name=Department]', 'BIOL');
      await page.fill('input[name=Credit]', '0.25');
      await page.locator('input[name=Winter]').check();

      await page.locator('button:has-text("Search")').click();

      await expect(page.locator('strong >> nth=0')).toHaveText('BIOL 373L Human Physiology Laboratory');
      await expect(page.locator('strong >> nth=2')).toHaveText('BIOL 498A Short Biology Field Course 1');
      await expect(page.locator('strong >> nth=5')).toHaveText('BIOL 498B Short Biology Field Course 2');
    } catch (e) {
      mailOptions.text = mailOptions.text + '\nTest 11: Error viewing Waterloo course search items using Department, Credit, and Season filters';
      errorBool = 1;
    }

  });

  test('12: should allow me to open react-vis graph of the selected item', async ({ page }) => {

    try {

      await page.locator('input[id=waterloo]').check();

      await page.fill('input[name=Department]', 'BIOL');
      await page.fill('input[name=Credit]', '0.25');
      await page.locator('input[name=Winter]').check();

      await page.locator('button:has-text("Search")').click();

      // select second graph button which will choose BIOL 498A graph 
      await page.locator('button:has-text("Graph Course") >> nth=1').click();

      await expect(page.locator('h1 >> nth=2')).toHaveText('BIOL 498A');
      await expect(page.locator('div > .vis-network')).toHaveCount(1);

    } catch (e) {
      mailOptions.text = mailOptions.text + '\nTest 12: Error graphing the Waterloo searched items with react-vis';
      errorBool = 1;
    }
      
  });

  // big load
  test('13: should allow me to browse all Waterloo courses with no filters', async ({ page }) => {

    try {

      await page.locator('input[id=waterloo]').check();

      await page.locator('button:has-text("Search")').click();

      await expect(page.locator('div > .courseCard')).toHaveCount(4227);

    } catch (e) {
      mailOptions.text = mailOptions.text + '\nTest 7: Error viewing all Waterloo courses';
      errorBool = 1;
    }
      
  });
    
});