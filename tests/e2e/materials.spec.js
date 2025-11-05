const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { expect } = require('chai');

const APP_URL = process.env.APP_URL || 'http://localhost:3000';

describe('Material Manager (React + Node)', function () {
  this.timeout(60000);
  let driver;

  before(async () => {
    const options = new chrome.Options();
    // options.addArguments('--headless=new');
    driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();
    await driver.manage().setTimeouts({ implicit: 5000, pageLoad: 30000, script: 30000 });
  });

  after(async () => {
    if (driver) await driver.quit();
  });

  it('renders Supplier Risk Management UI and columns', async () => {
    await driver.get(APP_URL);
    // If page needs navigation, insert a click here to open Materials page
    await driver.wait(until.elementLocated(By.xpath("//*[contains(., 'Supplier Risk Management (ML)')]")), 20000);

    const header = await driver.findElements(By.xpath("//*[normalize-space()='1. Label Suppliers for Training']"));
    expect(header.length).to.be.greaterThan(0);

    const headerCells = await driver.findElements(By.xpath("//table//thead//th"));
    expect(headerCells.length, 'Supplier table header should have columns').to.be.greaterThan(0);
  });
});
