# Handles Playwright
# Should install and run the scraper once.

cd parser
npm i
npx playwright install --with-deps chromium
./index.js
mv temp/ ..