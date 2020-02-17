
const puppeteer = require('puppeteer');
const fetch = require('node-fetch')
const async = require('async')

const chronos_api_url = 'https://chronos-ciaxkghomq-ue.a.run.app';
const beeline_url = 'https://prod2.beeline.com/capitalone/Security/NewLogin.aspx?Url=%2fcapitalone%2fdefault.aspx';

function doTimesheet() {
    const USERNAME = process.env.CAPONE_USERNAME
    const PASS = process.env.CAPONE_PASS

    if (USERNAME === undefined || PASS === undefined) {
        return
    }

    puppeteer.launch({headless: false}).then(async browser => {
        const page = await browser.newPage();

        const response = await fetch(chronos_api_url)
        const timesheet = await response.json();

        console.log(timesheet);

        await page.goto(beeline_url);

        console.log('INITIAL PAGE', page.url());

        // Type username and password
        await page.focus('#beelineForm_UserLoginForm_userNameText');
        await page.type('#beelineForm_UserLoginForm_userNameText', USERNAME, {delay: 100});

        await page.waitFor(1000);

        await page.focus('#beelineForm_UserLoginForm_passwordText');
        await page.type('#beelineForm_UserLoginForm_passwordText', PASS, {delay: 100});

        // Login
        await page.click('#beelineForm_loginButtonLink');

        // Wait for page to login
        await page.waitForNavigation({waitUntil: 'load'});

        console.log(page.url());

        // wait for 1 second
        await page.waitFor(3000);

        async.eachOfSeries((await page.$$('input.input-time[dayindex]')), async (input, i) => {

            await page.waitFor(1000);

            try {
                await input.type("0" + timesheet[(i + 6) % 7].toString(), {delay: 100});
            } catch (err) {
                console.log(err);
            }
        }, async () => {
            // Submit Timesheet
            await page.click('#submitTimesheetButton')
            await page.waitFor(1000);

            // Click to confirm
            await page.click('.ui-dialog-buttonset > button:nth-child(2)')

            await page.waitFor(1000);
            await browser.close();

            console.log(`
             _______               __           __
            /_  __(_)_ _  ___ ___ / /  ___ ___ / /_
             / / / /  ' \\/ -_|_-</ _ \\/ -_) -_) __/
            /_/ /_/_/_/_/\\__/___/_//_/\\__/\\__/\\__/
            `);

            console.log(`
             _____                __    __
            / ___/__  __ _  ___  / /__ / /____
           / /__/ _ \\/  ' \\/ _ \\/ / -_) __/ -_)
           \\___/\\___/_/_/_/ .__/_/\\__/\\__/\\__/
                         /_/
            `);
        });
    });


}

// doTimesheet()

// Schedule to run every week on Friday at 7 pm
const schedule = require('node-schedule');
schedule.scheduleJob({hour: 19, minute: 00, dayOfWeek: 5}, doTimesheet);
