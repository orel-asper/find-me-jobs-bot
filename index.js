const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.setDefaultNavigationTimeout(0);
  await page.goto('https://www.drushim.co.il/')
  await page.setUserAgent("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36");

  // wait for login selector and click on it
  await page.waitForSelector(".login-btn");
  await page.click(`.login-btn`);

  //focus on input
  const email = await page.$("#email-login-field");
  await email.focus();
  await page.type('#email-login-field', 'your email here')

  const password = await page.$("#password-login-field");
  await password.focus();
  await page.type('#password-login-field', 'youre password here')

  await page.click('#submit-login-btn')
  await delay(2000)
  await page.goto('https://www.drushim.co.il/personal/myboard.aspx')


  // get the amaunt Of Jobs alivable 
  const amauntOfJobs = await page.$('h3[class="font-weight-bold display-30"]')
  let h3_text = await page.evaluate(el => el.innerText, amauntOfJobs);

  let AOJ = Number(h3_text.slice(21, 24))

  for (let i = 0; i < Math.floor((AOJ - 25) / 10); i++) {
    await page.$('button[class="v-btn v-btn--contained theme--light v-size--default load_jobs_btn narrow mb-6"]')
    await delay(1000)
    await page.click('button[class="v-btn v-btn--contained theme--light v-size--default load_jobs_btn narrow mb-6"]')
  }

  const items = await page.$$("div[class='v-list jobList_vacancy v-sheet theme--light']")
  let sendCVsBtn = await page.$$('#cv-send-btn > span > button')
  let totalJobs = 0

  for (let i = 0; i < items.length; i++) {
    //job title
    let jobTitle = await items[i].$("span[class='job-url primary--text font-weight-bold primary--text']");
    let job_text = await page.evaluate(el => el.innerText, jobTitle);

    // place
    let place = await items[i].$("span[class='display-18']");
    let place_text = await page.evaluate(el => el.innerText, place);

    // years of experience
    let years = await items[i].$("div:nth-child(2) > span[class='display-18']");
    let years_text = await page.evaluate(el => el.innerText, years);


    let toLowerCase = job_text.toLowerCase()

    if (
      (toLowerCase.includes('stack') ||
        toLowerCase.includes('angular') ||
        toLowerCase.includes('react') ||
        toLowerCase.includes('native') ||
        toLowerCase.includes('junior') ||
        toLowerCase.includes('end')) &&
      (place_text.includes('תל אביב') ||
        place_text.includes('ירושלים') ||
        place_text.includes('מודיעין') ||
        place_text.includes('הרצליה ') ||
        place_text.includes('רמת גן')
      )
      && years_text === '1-2 שנים'
    ) {
      console.table({
        job_title: job_text,
        place: place_text,
        total_jobs_found: totalJobs++,
        years_of_experience: years_text,
        job_position_in_row: i
      })


      await sendCVsBtn[i].click()
      await page.$('#submitApply')
      await delay(1000)
      await page.click('#submitApply')
      await delay(3000)
      console.log(`CV sent to position${i}`)
    }

  }
  await browser.close();
})();

function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}
