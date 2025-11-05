const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { expect } = require('chai');

const APP_URL = process.env.APP_URL || 'http://localhost:3000';

describe('Finance Management (React + Node)', function () {
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

  it('loads Finance Management and shows KPI cards + People card', async () => {
    await driver.get(APP_URL);
    await driver.wait(until.elementLocated(By.xpath("//*[contains(., 'Finance Management')]")), 20000);

    const totalBudget = await driver.findElements(By.xpath("//*[normalize-space()='Total Budget']"));
    const materialExpenses = await driver.findElements(By.xpath("//*[normalize-space()='Material Expenses']"));
    const laborWages = await driver.findElements(By.xpath("//*[normalize-space()='Labor Wages']"));
    const netProfit = await driver.findElements(By.xpath("//*[normalize-space()='Net Profit/Loss']"));

    expect(totalBudget.length, 'Total Budget card missing').to.be.greaterThan(0);
    expect(materialExpenses.length, 'Material Expenses card missing').to.be.greaterThan(0);
    expect(laborWages.length, 'Labor Wages card missing').to.be.greaterThan(0);
    expect(netProfit.length, 'Net Profit/Loss card missing').to.be.greaterThan(0);

    const peopleCard = await driver.findElements(By.xpath("//*[normalize-space()='People']"));
    expect(peopleCard.length, 'People card missing').to.be.greaterThan(0);
  });

  it('toggles Filters and shows Projects dropdown if available', async () => {
    const filtersBtn = await driver.findElement(By.xpath("//button[normalize-space()='Filters']"));
    await filtersBtn.click();

    const projectLabel = await driver.findElements(By.xpath("//label[contains(., 'Project')]"));
    expect(projectLabel.length, 'Project label not found (inside Filters panel)').to.be.greaterThan(0);

    // Close filters to return state
    await filtersBtn.click();
  });
});
